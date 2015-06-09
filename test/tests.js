/*globals describe, it*/
'use strict';
var synapse = require('../lib/neuron-synapse.js');

describe('basic', function () {
    it('getToken should throw an error if initialise has not been called', function () {
        synapse.getClientToken({
            programName: "bob"
        }, function (error) {
            error.message.should.equal(synapse.errorMessage.notInitialised);
        });
    });

    it('initialise should throw an error if no options is provided', function () {
        try {
            synapse.initialise();
            throw new Error("should not have got here!");
        } catch (error) {
            error.message.should.equal(synapse.errorMessage.noOptions);
        }
    });

    it('initialise should throw an error if options is not an object', function () {
        try {
            synapse.initialise("asd");
            throw new Error("should not have got here!");
        } catch (error) {
            error.message.should.equal(synapse.errorMessage.optionsNotAnObject);
        }
    });

    it('initialise should throw an error if apiBaseUrl is not specified', function () {
        try {
            synapse.initialise({});
            throw new Error("should not have got here!");
        } catch (error) {
            error.message.should.equal(synapse.errorMessage.apiBaseUrlMustBeSpecified);
        }
    });
    it('initialise should throw an error if apiBaseUrl is not a string', function () {
        try {
            synapse.initialise({
                apiBaseUrl: {}
            });
            throw new Error("should not have got here!");
        } catch (error) {
            error.message.should.equal(synapse.errorMessage.apiBaseUrlMustBeAString);
        }
    });

    it('initialise should throw an error if apiBaseUrl is a blank string', function () {
        try {
            synapse.initialise({
                apiBaseUrl: "    "
            });
            throw new Error("should not have got here!");
        } catch (error) {
            error.message.should.equal(synapse.errorMessage.apiBaseUrlCannotBeBlank);
        }
    });

    it('initialise should throw an error if clientId is not specified', function () {
        try {
            synapse.initialise({
                apiBaseUrl: "http://localhost:3000/"
            });
            throw new Error("should not have got here!");
        } catch (error) {
            error.message.should.equal(synapse.errorMessage.noClientId);
        }
    });

    it('initialise should throw an error if clientId is not a string', function () {
        try {
            synapse.initialise({
                apiBaseUrl: "http://localhost:3000/",
                clientId: {}
            });
            throw new Error("should not have got here!");
        } catch (error) {
            error.message.should.equal(synapse.errorMessage.clientIdMustBeAString);
        }
    });

    it('initialise should throw an error if clientId is a blank string', function () {
        try {
            synapse.initialise({
                apiBaseUrl: "http://localhost:3000/",
                clientId: "      "
            });
            throw new Error("should not have got here!");
        } catch (error) {
            error.message.should.equal(synapse.errorMessage.clientIdCannotBeBlank);
        }
    });


    it('initialise should throw an error if clientSecret is not specified', function () {
        try {
            synapse.initialise({
                apiBaseUrl: "http://localhost:3000/",
                clientId: "bob"
            });
            throw new Error("should not have got here!");
        } catch (error) {
            error.message.should.equal(synapse.errorMessage.noClientSecret);
        }
    });

    it('initialise should throw an error if clientSecret is not a string', function () {
        try {
            synapse.initialise({
                apiBaseUrl: "http://localhost:3000/",
                clientId: "bob",
                clientSecret: {}
            });
            throw new Error("should not have got here!");
        } catch (error) {
            error.message.should.equal(synapse.errorMessage.clientSecretMustBeAString);
        }
    });

    it('initialise should throw an error if clientSecret is a blank string', function () {
        try {
            synapse.initialise({
                apiBaseUrl: "http://localhost:3000/",
                clientId: "bob",
                clientSecret: "      "
            });
            throw new Error("should not have got here!");
        } catch (error) {
            error.message.should.equal(synapse.errorMessage.clientSecretCannotBeBlank);
        }
    });

    it('getToken should throw an error if inputs is null', function () {
        baseSuccesfullInitialise();
        synapse.getClientToken(null, function (error) {
            error.message.should.equal(synapse.errorMessage.noInputs);
        });
    });

    it('getToken should throw an error if inputs is not an object', function () {
        baseSuccesfullInitialise();
        synapse.getClientToken("null", function (error) {
            error.message.should.equal(synapse.errorMessage.inputsNotAnObject);
        });
    });

    it('getToken should throw an error if callback is not specified', function () {
        baseSuccesfullInitialise();
        try {
            synapse.getClientToken({}, null);
            throw new Error("should not have got here!");
        } catch (error) {
            error.message.should.equal(synapse.errorMessage.noCallback);
        }
    });

    it('getToken should throw an error if callback is not a function', function () {
        baseSuccesfullInitialise();
        try {
            synapse.getClientToken({}, {});
            throw new Error("should not have got here!");
        } catch (error) {
            error.message.should.equal(synapse.errorMessage.callbackNotAFunction);
        }
    });

    it('getToken should throw an error if inputs.programName is not specified', function () {
        baseSuccesfullInitialise();
        synapse.getClientToken({}, function (error) {
            error.message.should.equal(synapse.errorMessage.programNameRequired);
        });
    });

    it('getToken should throw an error if inputs.programName is not a string', function () {
        baseSuccesfullInitialise();
        synapse.getClientToken({
            programName: {}
        }, function (error) {
            error.message.should.equal(synapse.errorMessage.programNameMustBeAString);
        });
    });

    it('getToken should throw an error if inputs.programName is a blank string', function () {
        baseSuccesfullInitialise();
        synapse.getClientToken({
            programName: "    "
        }, function (error) {
            error.message.should.equal(synapse.errorMessage.programNameCannotBeBlank);
        });
    });

    it('_serviceUrlTemplate should get set after initialise is called', function () {
        baseSuccesfullInitialise();
        synapse._getServiceUrlTemplate().should.equal("http://localhost:3000/api/programs/:programName/apps/token");

    });

    it('_serviceUrlTemplate should not change when getToken is called', function () {
        baseSuccesfullInitialise();
        var urlCopy = synapse._getServiceUrlTemplate();
        synapse.getClientToken({
            programName: 'test'
        }, getTokenDone);

        function getTokenDone() {
            synapse._getServiceUrlTemplate().should.equal(urlCopy);
        }
    });

    it('Should succeed if all the parameters are correct', function (next) {
        baseSuccesfullInitialise();
        synapse.getClientToken({
            programName: 'encentivize',
            scope: ""
        }, getTokenDone);

        function getTokenDone(error, token) {
            if (error) {
                throw error;
            }
            token.should.be.ok;
            return next()
        }
    });

    it('Should get the token from the cache if it already exists', function (next) {
        baseSuccesfullInitialise();
        var tokenRequest = {
            programName: 'encentivize',
            scope: ""
        };
        synapse.getClientToken(tokenRequest, firstGetTokenDone);
        var firstToken = null;

        function firstGetTokenDone(error, token, cacheStatus) {
            if (error) {
                throw error;
            }
            token.should.be.ok;
            firstToken = token;
            cacheStatus.should.equal("cacheMiss");
            synapse.getClientToken(tokenRequest, secondGetTokenDone);
        }

        function secondGetTokenDone(error, token, cacheStatus) {
            if (error) {
                throw error;
            }
            token.should.be.ok;
            cacheStatus.should.equal("cacheHit");
            firstToken.should.be.ok;
            token.should.equal(firstToken);
            return next();
        }
    });

    it('_getCacheKey should be case insensitive', function () {
        var scope1 = "a B c D E F";
        var cacheKey1 = synapse._getCacheKey(scope1);
        var scope2 = "A b c D e F";
        var cacheKey2 = synapse._getCacheKey(scope2);
        cacheKey1.should.equal(cacheKey2);
    });

    it('_getCacheKey should ignore the ordering of scopes', function () {
        var scope1 = "a B c D E F";
        var cacheKey1 = synapse._getCacheKey(scope1);
        var scope2 = "F D E b c a";
        var cacheKey2 = synapse._getCacheKey(scope2);
        cacheKey1.should.equal(cacheKey2);
    });

    it('_getCacheKey should ignore extra whitespace scopes', function () {
        var scope = "  a B c    D  E F  ";
        var cacheKey = synapse._getCacheKey(scope);
        cacheKey.should.equal("abcdef");
    });

    function baseSuccesfullInitialise() {
        synapse.initialise({
            apiBaseUrl: "http://localhost:3000/",
            clientId: "Aperitif",
            clientSecret: "qwh3ejk12"
        });
    }
});
