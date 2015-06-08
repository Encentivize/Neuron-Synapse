/*globals describe, it*/
'use strict';
var synapse = require('../lib/neuron-synapse.js');

describe('basic', function () {
    it('getToken should throw an error if initialise has not been called', function () {
        synapse.getToken({
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

    it('initialise should throw an error if neuronBaseUrl is not specified', function () {
        try {
            synapse.initialise({});
            throw new Error("should not have got here!");
        } catch (error) {
            error.message.should.equal(synapse.errorMessage.neuronBaseUrlMustBeSpecified);
        }
    });
    it('initialise should throw an error if neuronBaseUrl is not a string', function () {
        try {
            synapse.initialise({
                neuronBaseUrl: {}
            });
            throw new Error("should not have got here!");
        } catch (error) {
            error.message.should.equal(synapse.errorMessage.neuronBaseUrlMustBeAString);
        }
    });

    it('initialise should throw an error if neuronBaseUrl is a blank string', function () {
        try {
            synapse.initialise({
                neuronBaseUrl: "    "
            });
            throw new Error("should not have got here!");
        } catch (error) {
            error.message.should.equal(synapse.errorMessage.neuronBaseUrlCannotBeBlank);
        }
    });

    it('initialise should throw an error if clientId is not specified', function () {
        try {
            synapse.initialise({
                neuronBaseUrl: "http://localhost:3666/"
            });
            throw new Error("should not have got here!");
        } catch (error) {
            error.message.should.equal(synapse.errorMessage.noClientId);
        }
    });

    it('initialise should throw an error if clientId is not a string', function () {
        try {
            synapse.initialise({
                neuronBaseUrl: "http://localhost:3666/",
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
                neuronBaseUrl: "http://localhost:3666/",
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
                neuronBaseUrl: "http://localhost:3666/",
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
                neuronBaseUrl: "http://localhost:3666/",
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
                neuronBaseUrl: "http://localhost:3666/",
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
        synapse.getToken(null, function (error) {
            error.message.should.equal(synapse.errorMessage.noInputs);
        });
    });

    it('getToken should throw an error if inputs is not an object', function () {
        baseSuccesfullInitialise();
        synapse.getToken("null", function (error) {
            error.message.should.equal(synapse.errorMessage.inputsNotAnObject);
        });
    });

    it('getToken should throw an error if callback is not specified', function () {
        baseSuccesfullInitialise();
        try {
            synapse.getToken({}, null);
            throw new Error("should not have got here!");
        } catch (error) {
            error.message.should.equal(synapse.errorMessage.noCallback);
        }
    });

    it('getToken should throw an error if callback is not a function', function () {
        baseSuccesfullInitialise();
        try {
            synapse.getToken({}, {});
            throw new Error("should not have got here!");
        } catch (error) {
            error.message.should.equal(synapse.errorMessage.callbackNotAFunction);
        }
    });

    it('getToken should throw an error if inputs.programName is not specified', function () {
        baseSuccesfullInitialise();
        synapse.getToken({}, function (error) {
            error.message.should.equal(synapse.errorMessage.programNameRequired);
        });
    });

    it('getToken should throw an error if inputs.programName is not a string', function () {
        baseSuccesfullInitialise();
        synapse.getToken({
            programName: {}
        }, function (error) {
            error.message.should.equal(synapse.errorMessage.programNameMustBeAString);
        });
    });

    it('getToken should throw an error if inputs.programName is a blank string', function () {
        baseSuccesfullInitialise();
        synapse.getToken({
            programName: "    "
        }, function (error) {
            error.message.should.equal(synapse.errorMessage.programNameCannotBeBlank);
        });
    });

    it('_serviceUrlTemplate should get set after initialise is called', function () {
        baseSuccesfullInitialise();
        synapse.getServiceUrlTemplate().should.equal("http://localhost:3666/:programName/oauth/token");

    });

    it('_serviceUrlTemplate should not change when getToken is called', function () {
        baseSuccesfullInitialise();
        var urlCopy = synapse.getServiceUrlTemplate();
        synapse.getToken({
            programName: 'test'
        }, getTokenDone);

        function getTokenDone() {
            synapse.getServiceUrlTemplate().should.equal(urlCopy);
        }
    });

    it('Should succeed if all the parameters are correct', function (next) {
        baseSuccesfullInitialise();
        synapse.getToken({
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

    function baseSuccesfullInitialise() {
        synapse.initialise({
            neuronBaseUrl: "http://localhost:3666/",
            clientId: "Aperitif",
            clientSecret: "qwh3ejk12"
        });
    }
});
