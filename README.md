# Neuron-Synapse

A library for Encentivize app writers for aquiring and managing Oauth2.0 app-tokens.
The library will use an in-memory cache to ensure that tokens are not needlessly requested

## installation ##

    npm install --save neuron-synapse

## Usage ##

Once you have your clientId and client Secret, in the root of your app (reccomended) add the following:


    var neuronSynapse = require('neuron-synapse);
    neuronSynapse..initialise({
	    neuronBaseUrl: "<linkToNeuronBaseUrl>",
	    clientId: "<yourClientId>",
	    clientSecret: "<yourClientSecret>"
	});


Then when you need a token for your app, simply use the following code snippet:

    var neuronSynapse = require('neuron-synapse');
    var programName = req.programName; // get the program name somehow, might be stored in config or based on the req.path etc
    neuronSynapse.getClientToken({
    	programName: programName,
	    scope: "<Space seprated list of scopes you require>"
    }, getTokenDone);
    
    function getTokenDone(error, token) {
    	if (error) {
    		throw error; //Ensure you have graceful error handling
    	}
    
    ... // call the Encentivize api using the supplied bearer token
    })