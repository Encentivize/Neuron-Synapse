'use strict';

var Client = require('node-rest-client').Client;
var querystring = require('querystring');
var urljoin = require('url-join');
var _initialised = false;
var _serviceUrlTemplate;
var _clientId;
var _clientSecret;

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
    if (options.neuronBaseUrl.trim() === "") {
        throw new Error(module.exports.errorMessage.neuronBaseUrlCannotBeBlank);
    }
    if (!options.clientId) {
        throw new Error(module.exports.errorMessage.noClientId);
    }
    if (typeof (options.clientId) !== "string") {
        throw new Error(module.exports.errorMessage.clientIdMustBeAString);
    }
    if (options.clientId.trim() === "") {
        throw new Error(module.exports.errorMessage.clientIdCannotBeBlank);
    }

    if (!options.clientSecret) {
        throw new Error(module.exports.errorMessage.noClientSecret);
    }
    if (typeof (options.clientSecret) !== "string") {
        throw new Error(module.exports.errorMessage.clientSecretMustBeAString);
    }
    if (options.clientSecret.trim() === "") {
        throw new Error(module.exports.errorMessage.clientSecretCannotBeBlank);
    }
    _initialised = true;
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
    if (inputs.programName.trim() === "") {
        return callback(new Error(module.exports.errorMessage.programNameCannotBeBlank));
    }
    if (_initialised === false) {
        return callback(new Error(module.exports.errorMessage.notInitialised));
    }
    var programName = inputs.programName;
    var url = _serviceUrlTemplate.replace(':programName', programName);
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
        return callback(null, token.access_token);
    });
    req.on('requestTimeout', function (req) {
        req.abort();
        return callback(new Error(module.exports.errorMessage.requestTimeout));
    });

    req.on('responseTimeout', function (res) {
        return callback(new Error(module.exports.errorMessage.responseTimeout));
    });

    req.on('error', function (err) {
        return callback(err);
    });

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
