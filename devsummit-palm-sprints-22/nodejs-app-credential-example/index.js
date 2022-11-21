const fetch = require("cross-fetch"); // npm install cross-fetch
const FormData = require("isomorphic-form-data"); // npm install isomorphic-form-data
require("dotenv").config();
const TOKEN_EXPIRATION_TIME = 900;

function getApplicationToken() {
    return new Promise(function(resolve, reject) {
        let parameters = new FormData();
        parameters.append('f', 'json');
        parameters.append('client_id', process.env.CLIENT_ID);
        parameters.append('client_secret', process.env.CLIENT_SECRET);
        parameters.append('grant_type', 'client_credentials');
        parameters.append('expiration', TOKEN_EXPIRATION_TIME);
        
        fetch("https://www.arcgis.com/sharing/rest/oauth2/token", {
            method: 'POST',
            body: parameters
        })
        .then(function(response) {
            response.json()
            .then(function(arcgisResponse) {
              if (arcgisResponse.error) {
                reject(new Error(arcgisResponse.error.message));
              } else {
                resolve(arcgisResponse.access_token);
              }
            })
            .catch(function(error) {
                reject(error);
            })
        });
    })
}

function geoEnrichStudyArea(studyArea) {
    return new Promise(function(resolve, reject) {
        getApplicationToken()
        .then(function(applicationToken) {
            let parameters = new FormData();
            parameters.append('f', 'json');
            parameters.append('token', applicationToken);
            parameters.append('studyAreas', studyArea);
            
            fetch('https://geoenrich.arcgis.com/arcgis/rest/services/World/GeoenrichmentServer/Geoenrichment/enrich', {
                method: 'POST',
                body: parameters
            })
            .then(function(response) {
                response.json()
                .then(function(arcgisResponse) {
                  if (arcgisResponse.error) {
                    reject(new Error(arcgisResponse.error.message));
                  } else {
                    resolve(arcgisResponse);
                  }
                })
                .catch(function(error) {
                    reject(error);
                })
              });
        }, function(error) {
            reject(error);
        })
        .catch(function(exception) {
            reject(exception);
        });
    })
}

geoEnrichStudyArea('[{"geometry":{"x":-117.1956,"y":34.0572}}]')
.then(function(arcgisResponse) {
    console.log("Study area: " + JSON.stringify(arcgisResponse));
}, function(error) {
    console.log(error.toString());
})
.catch(function(exception) {
    console.log(exception.toString());
});
