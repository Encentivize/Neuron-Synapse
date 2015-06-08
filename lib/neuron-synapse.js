'use strict';

var Client = require('node-rest-client').Client;
var querystring = require('querystring');
var urljoin = require('url-join');
var _initialised = false;
var _serviceUrlTemplate;
var _clientId;
var _clientSecret;
var _programCache;
var _tokenSafetyIntervalInSeconds = 30;


function initialise(options) {
    if (!options) {
        throw new Error(module.exports.errorMessage.noOptions);
    }
    if (typeof (options) !== "object") {
        throw new Error(module.exports.errorMessage.optionsNotAnObject);
    }
    if (!options.neuronBaseUrl) {
        throw new Error(module.exports.errorMessage.neuronBaseUrlMustBeSpecified);
    }
    if (typeof (options.neuronBaseUrl) !== "string") {
        throw new Error(module.exports.errorMessage.neuronBaseUrlMustBeAString);
    }
    options.neuronBaseUrl = options.neuronBaseUrl.trim();
    if (options.neuronBaseUrl === "") {
        throw new Error(module.exports.errorMessage.neuronBaseUrlCannotBeBlank);
    }
    if (!options.clientId) {
        throw new Error(module.exports.errorMessage.noClientId);
    }
    if (typeof (options.clientId) !== "string") {
        throw new Error(module.exports.errorMessage.clientIdMustBeAString);
    }
    options.clientId = options.clientId.trim();
    if (options.clientId === "") {
        throw new Error(module.exports.errorMessage.clientIdCannotBeBlank);
    }

    if (!options.clientSecret) {
        throw new Error(module.exports.errorMessage.noClientSecret);
    }
    if (typeof (options.clientSecret) !== "string") {
        throw new Error(module.exports.errorMessage.clientSecretMustBeAString);
    }
    options.clientSecret = options.clientSecret.trim();
    if (options.clientSecret === "") {
        throw new Error(module.exports.errorMessage.clientSecretCannotBeBlank);
    }
    _initialised = true;
    _programCache = {};
    _clientId = options.clientId;
    _clientSecret = options.clientSecret;
    _serviceUrlTemplate = urljoin(options.neuronBaseUrl, ':programName/oauth/token');
}

function getServiceUrlTemplate() {
    return _serviceUrlTemplate;
}

function getToken(inputs, callback) {
    if (!inputs) {
        return callback(new Error(module.exports.errorMessage.noInputs));
    }
    if (typeof (inputs) !== "object") {
        return callback(new Error(module.exports.errorMessage.inputsNotAnObject));
    }
    if (!callback) {
        throw new Error(module.exports.errorMessage.noCallback);
    }
    if (typeof (callback) !== "function") {
        throw new Error(module.exports.errorMessage.callbackNotAFunction);
    }
    if (!inputs.programName) {
        return callback(new Error(module.exports.errorMessage.programNameRequired));
    }
    if (typeof (inputs.programName) !== "string") {
        return callback(new Error(module.exports.errorMessage.programNameMustBeAString));
    }
    inputs.programName = inputs.programName.trim();
    if (inputs.programName === "") {
        return callback(new Error(module.exports.errorMessage.programNameCannotBeBlank));
    }
    if (_initialised === false) {
        return callback(new Error(module.exports.errorMessage.notInitialised));
    }
    if (!inputs.scope) {
        inputs.scope = "";
    }
    var cacheKey = getCacheKey(inputs.scope);
    var token = getValidTokenFromCache(inputs.programName, cacheKey);
    if (token) {
        return callback(null, token.access_token);
    }
    var url = _serviceUrlTemplate.replace(':programName', inputs.programName);
    var body = {
        "client_id": _clientId,
        "client_secret": _clientSecret,
        "grant_type": "client_credentials",
        "scope": inputs.scope
    };
    var args = {
        data: querystring.stringify(body),
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    };
    var client = new Client();
    var req = client.post(url, args, function (data, response) {
        var tokenString;
        if (Buffer.isBuffer(data)) {
            tokenString = data.toString('utf8');
        } else if (typeof data === 'string') {
            tokenString = data;
        }
        if (response.statusCode !== 200) {
            return callback(new Error(tokenString));
        }
        var token = JSON.parse(tokenString);
        if (!token.access_token) {
            throw new Error(module.exports.errorMessage.noAccessToken);
        }
        if (token.expires_in && token.expires_in > _tokenSafetyIntervalInSeconds) {
            cacheToken(token, inputs.programName, cacheKey);
        }
        return callback(null, token.access_token);
    });
    req.on('requestTimeout', function (req) {
        req.abort();
        return callback(new Error(module.exports.errorMessage.requestTimeout));
    });

    req.on('responseTimeout', function () {
        return callback(new Error(module.exports.errorMessage.responseTimeout));
    });

    req.on('error', function (err) {
        return callback(err);
    });

}

function getValidTokenFromCache(programName, cacheKey) {
    var thisProgramCache = getEnsureProgramCacheExists(programName);
    var token = thisProgramCache[cacheKey];
    if (!token) {
        return null;
    }
    var now = new Date();
    if (now >= token.expiryDate) {
        return null;
    }
    return token;
}

function cacheToken(token, programName, cacheKey) {
    setExpiryDateOnToken(token);
    var thisProgramCache = getEnsureProgramCacheExists(programName);
    thisProgramCache[cacheKey] = token;
}

function getCacheKey(scope) {
    var inputScopeArray = scope.toLowerCase().split(' ');
    var validScopes = [];
    inputScopeArray.forEach(function (scope) {
        if (scope !== '') {
            validScopes.push(scope);
        }
    });
    if (validScopes.length === 0) {
        validScopes.push("none");
    }
    validScopes = validScopes.sort();
    var cacheKey = validScopes.join('');
    return cacheKey;
}

function getEnsureProgramCacheExists(programName) {
    var lowerCaseProgramName = programName.toLowerCase();
    if (!_programCache[lowerCaseProgramName]) {
        _programCache[lowerCaseProgramName] = {};
    }
    return _programCache[lowerCaseProgramName];
}

function setExpiryDateOnToken(token) {
    var secondsuntilTokenExpires = token.expires_in - _tokenSafetyIntervalInSeconds; //remove the tokenSafetyIntervalInSeconds to ensure that the token does not expire mid request
    var expiryDate = new Date();
    expiryDate.setSeconds(expiryDate.getSeconds() + secondsuntilTokenExpires);
    token.expiryDate = expiryDate;
}

module.exports = {
    initialise: initialise,
    getToken: getToken,
    getServiceUrlTemplate: getServiceUrlTemplate,
    errorMessage: {
        noOptions: "initialise must be called with options",
        optionsNotAnObject: "options must be an object",
        neuronBaseUrlMustBeSpecified: "neuronBaseUrl must be set",
        neuronBaseUrlMustBeAString: "Neuron base url must be a string",
        neuronBaseUrlCannotBeBlank: "Neuron base url cannot be blank",
        noClientId: "clientId must be set",
        clientIdMustBeAString: "clientId must be a string",
        clientIdCannotBeBlank: "clientId cannot be blank",
        noClientSecret: "clientSecret must be specified",
        clientSecretMustBeAString: "clientSecret must be a string",
        clientSecretCannotBeBlank: "clientSecret cannot be blank",
        noInputs: "Input must be specified when getToken is called",
        inputsNotAnObject: "The first argument (inputs) on getToken must be an object",
        noCallback: "Callback must be specified when getToken is called",
        callbackNotAFunction: "callback must be a function",
        programNameRequired: "inputs.program name is required",
        programNameMustBeAString: "Program name must be a string",
        programNameCannotBeBlank: "Program name cannot be blank",
        notInitialised: "neuron-synapse has not yet been initialised",
        noAccessToken: "token object did not contain the property access_token",
        requestTimeout: 'request has expired',
        responseTimeout: 'response has expired'
    }
};
