/**
 * auth.js handles authentication negotiation with ArcGIS servers.
 */
const fs = require("fs");
const fetch = require("cross-fetch");
const FormData = require("isomorphic-form-data");
const arcgisRestRequest = require("@esri/arcgis-rest-request");
const { ApplicationSession } = require("@esri/arcgis-rest-auth");
const { queryDemographicData } = require("@esri/arcgis-rest-demographics");

arcgisRestRequest.setDefaultRequestOptions({ fetch, FormData });
require("dotenv").config();
const configuration = require("./server-configuration.json");

/**
 * Given a valid response from the ArcGIS server we want to store this token and use it
 * until it expires so we do not have to ask the server for a token on every client request.
 *
 * @param {object} arcgisServerResponse A successful token request response from the ArcGIS server.
 * @returns {object|null} An object that is the response plus additional properties we want to remember.
 */
function cacheResponse(arcgisServerResponse) {
    if ( ! isArcGISError(arcgisServerResponse)) {
        // Determine Unix time in milliseconds when this token will expire
        arcgisServerResponse.expiresDate = (parseInt(arcgisServerResponse.expires_in) * 1000) + Date.now();
        arcgisServerResponse.appTokenBaseURL = configuration.appTokenBaseURL;
        arcgisServerResponse.arcgisUserId = process.env.ARCGIS_USER_ID;

        // save JSON response in a local file
        const response = JSON.stringify(arcgisServerResponse);
        try {
            const cache = fs.createWriteStream(configuration.cacheFile, { flags: 'w' });
            if (cache) {
                cache.write(response);
                cache.end();
            }
        } catch(error) {
            console.log("Cannot write cache file " + error.toString());
        };
    }
    return arcgisServerResponse;
};

/**
 * If we have a token cache and it has not expired, return the cache. Otherwise reject the Promise
 * to indicate a new token must be requested.
 * @returns {Promise} Resolves with the parsed and valid object. Rejects on any error (such as the
 * cache does not exist or the token has expired.)
 */
function getCachedToken() {
    return new Promise(function(resolve, reject) {
        let response = "";
        try {
            let cache = fs.createReadStream(configuration.cacheFile, { flags: 'r' });
            cache.on("error", function(fileError) {
                reject(fileError);
            });
            cache.on("data", function(chunk) {
                response += chunk;
            });
            cache.on("end", function() {
                try {
                    const cachedToken = JSON.parse(response);
                    if (cachedToken == null) {
                        reject(new Error("Invalid token."));
                    } else {
                        // @TODO determine if this token is still good or it expired
                        const now = new Date();
                        const expires = cachedToken.expiresDate;
                        const dateExpires = new Date(expires);
                        const timeDiff = cachedToken.expiresDate - Date.now();
                        const isExpired = Date.now() > cachedToken.expiresDate;
                        const timeDiffStr = Math.floor(timeDiff / (1000 * 60 * 60)) + ":" + (Math.floor(timeDiff / (1000 * 60)) % 60) + ":" + Math.floor(timeDiff / 1000) % 60;
                        // console.log(`Date now ${now}; expires ${dateExpires}; diff: ${timeDiffStr}; isExpired: ${isExpired.toString()}`);
                        if (isExpired) {
                            reject(new Error("Token expired."));
                        } else {
                            resolve(cachedToken);
                        }
                    }
                } catch (exception) {
                    reject(new Error("Could not parse response as JSON: " + response.toString()));
                }
            });
        } catch(error) {
            reject(error);
        };
    });
};

/**
 * Format an error response so it looks the same as an ArcGIS error for errors that happen in this service. This
 * should help clients handle errors with just one consistent format.
 * @param {integer} errorCode An HTTP status code to report.
 * @param {string} errorMessage An error message to help explain what went wrong.
 */
function errorResponse(errorCode, errorMessage) {
    return {
        error: {
            code: errorCode,
            error: "invalid_server_response",
            error_description: "Invalid server response: " + errorMessage,
            message: "Invalid server response: " + errorMessage,
            details: []
        }
    };
};

/**
 * Determine if a response from the ArcGIS server is an error, since the server seems to always send
 * back status 200 and the error is in the JSON response but it only appears if there is an error.
 * @param {object} arcgisServerResponse An object returned from a failed ArcGIS service endpoint.
 * @returns {boolean} True if `arcgisServerResponse` looks like an error, false if it does not.
 */
function isArcGISError(arcgisServerResponse) {
    return arcgisServerResponse == null || (typeof arcgisServerResponse.error !== "undefined");
};

/**
 * Contact the ArcGIS server and ask for a token using ArcGIS REST JS auth module. Client ID and secret are gather from environment variables.
 * This method uses @esri/arcgis-rest-auth to mimic what is documented on https://developers.arcgis.com/documentation/mapping-apis-and-services/security/application-credentials/#examples
 * for the Node.js code sample.
 *
 * @returns {Promise} The promise resolves with an object that has the token, expiration, and other properties. It rejects for 
 * any case where a token cannot be determined.
 */
function requestTokenWithAuth() {
    return new Promise(function(resolve, reject) {
        const arcgisTokenURL = configuration.appTokenBaseURL + configuration.appTokenPath;
        const session = new ApplicationSession({
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            duration: configuration.tokenExpirationMinutes
        });
        session.getToken(arcgisTokenURL)
        .then(function(response) {
            // remember the token and when it expires
            const completeResponse = cacheResponse({
                access_token: response,
                expires_in: configuration.tokenExpirationMinutes * 60
            });
            resolve(completeResponse);
        }).catch(function(error) {
            reject(error);
        });
    });
};

/**
 * Contact the ArcGIS server and ask for a token using the REST API. Client ID and secret are gather from environment variables.
 * This method uses fetch to mimic what is documented on https://developers.arcgis.com/documentation/mapping-apis-and-services/security/application-credentials/#examples
 * for the Node.js code sample.
 *
 * @returns {Promise} The promise resolves with an object that has the token, expiration, and other properties. It rejects for 
 * any case where a token cannot be determined.
 */
function requestTokenWithRequest() {
    return new Promise(function(resolve, reject) {
        const arcgisTokenURL = configuration.appTokenBaseURL + configuration.appTokenPath;
        let parameters = new FormData();
        parameters.append('f', 'json');
        parameters.append('client_id', process.env.CLIENT_ID);
        parameters.append('client_secret', process.env.CLIENT_SECRET);
        parameters.append('grant_type', 'client_credentials');
        parameters.append('expiration', configuration.tokenExpirationMinutes);

        fetch(arcgisTokenURL, { method: 'POST', body: parameters })
        .then(function(response) {
            response.json()
            .then(function(responseObject) {
                if (isArcGISError(responseObject)) {
                    // Errors come back with status 200 so we need to swizzle the real error code from the response body.
                    reject(responseObject);
                } else {
                    // remember the token and when it expires
                    const completeResponse = cacheResponse(responseObject);
                    if (completeResponse != null) {
                        resolve(completeResponse);
                    } else {
                        reject(errorResponse(500, "response is an error."));
                    }
                }
            })
            .catch(function(error) {
                reject(errorResponse(500, error.toString()));
            })
        }).catch(function(error) {
            reject(errorResponse(500, error.toString()));
        });
    });
};

/**
 * Request an ArcGIS application token.
 * If forceRefresh is false and a cached token exists from a prior call and it has not expired it will be returned and the server will not be contacted.
 * If forceRefresh is true, or no cached token exists, or a cached token exists from a prior call but it has expired, the server is contacted for a new token.
 * clientID and clientSecret must be set as environment variables (see README for details.)
 *
 * @param {boolean} forceRefresh True to ignore the cache and force a server call.
 * @returns {Promise} Resolves with an object that has the token properties, or rejects with an error.
 */
function getToken(forceRefresh) {
    return new Promise(function(resolve, reject) {

        function requestTokenPromise(resolve, reject) {
            requestTokenWithAuth()
            .then(function(responseObject) {
                resolve(responseObject);
            }, function(error) {
                reject(error);
            })
            .catch(function(error) {
                reject(error);
            });
        };

        if ( ! forceRefresh) {
            // first check if the cache is available
            getCachedToken()
            .then(function(responseObject) {
                // cache is good
                resolve(responseObject);
            }, function() {
                // cache is no good, get a new token
                requestTokenPromise(resolve, reject);
            })
            .catch(function(error) {
                // cache is no good, get a new token
                requestTokenPromise(resolve, reject);
            });
        } else {
            // ignore the cache and get a new token
            requestTokenPromise(resolve, reject);
        }
    });
};

module.exports = {
    getToken: getToken,
    requestTokenWithRequest: requestTokenWithRequest,
    requestTokenWithAuth: requestTokenWithAuth,
    isArcGISError: isArcGISError,
    errorResponse: errorResponse,
    getCachedToken: getCachedToken,
    cacheResponse: cacheResponse
};
