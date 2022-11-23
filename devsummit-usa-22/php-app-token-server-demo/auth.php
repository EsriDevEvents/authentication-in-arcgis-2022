<?php
// secret properties come from a file that is .gitignore'd
include_once('secrets.php');

// Configuration variables, set these to values that make sense on your server.
// Which ArcGIS server to converse with
$serviceBaseURL = 'https://www.arcgis.com/sharing/rest';
$serviceTokenURL = $serviceBaseURL . '/oauth2/token/';
// a local file to cache the token as we set it to expire once per 24 hours. Make sure your process has r/w access. @TODO use an encrypted session storage.
$cacheFile = dirname(__DIR__, 2) . '../data/.ArcGISTokenCache.json';
// a local file to log debug info to. Make sure your process has w access.
$logFile = dirname(__DIR__, 2) . '../data/logs/debug.log';

// Set CORS so that only known/approved origins can request this service.
if (isset($_SERVER['HTTP_ORIGIN'])) {
    // @TODO limit the request to only known origins.
    header('Access-Control-Allow-Origin: ' . $_SERVER['HTTP_ORIGIN']);
    header('Access-Control-Allow-Credentials: false');
    header('Access-Control-Max-Age: 43200');
}

/**
 * Write message to a local file for debugging purposes.
 */
function debugLog($message) {
    global $logFile;
    file_put_contents($logFile, $message . "\r\n", FILE_APPEND);
}

/**
 * Determine which service is requested and if it is a valid request.
 */
function processRequest() {
    if ($_SERVER['REQUEST_METHOD'] == 'POST' && isSecureRequest()) {
        $forceRefresh = isset($_POST['force']) && $_POST['force'] == '1';
        handleTokenRequest($forceRefresh);
    } else {
        echo(errorResponse(403, 'Invalid request'));
    }
}

/**
 * Make sure the request is done over HTTPS.
 */
function isSecureRequest() {
    $isSecure = false;
    if (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] == 'on') {
        $isSecure = true;
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] == 'https' || !empty($_SERVER['HTTP_X_FORWARDED_SSL']) && $_SERVER['HTTP_X_FORWARDED_SSL'] == 'on') {
        $isSecure = true;
    }
    return $isSecure;
}

/**
 * Verify the client is making this request as part of the same session that loaded the page.
 */
function nonceMatch($nonce) {
    // @TODO come up with a way for the client and this server to agree on a value per session, such as a session id.
    return intval($nonce) == 1234;
}

/**
 * Format a JSON error response so it looks the same as an ArcGIS error for errors that happen in this service.
 */
function errorResponse($errorCode, $errorMessage) {
    return '{"error":{"code":' . $errorCode . ',"error":"invalid_server_response","error_description":"Invalid server response: ' . $errorMessage . '","message":"Invalid server response: ' . $errorMessage . '","details":[]}}';
}

/**
 * Determine if a response from the ArcGIS server is an error, since the server seems to always send
 * back status 200 and the error is in the JSON response but it only appears if there is an error.
 */
function isArcGISError($response) {
    return isset($response->error);
}

/**
 * Only allow authorized callers to request this service so we don't hand out tokens to just anyone.
 */
function isCallerAuthorized() {
    /*
     * @TODO: things to add in order to determine who is authentic:
     * 1. known referrers, known origins. CORS only handles this for browsers.
     * 2. add some form of secret to the http header?
     * 3. add nonce to the request
     */
    $isAuthorized = isset($_POST['nonce']) && nonceMatch($_POST['nonce']);
    return $isAuthorized;
}

/**
 * If we received a good response, cache this response and use it until it expires.
 * @TODO: this is a simple insecure implementation. to improve it, consider encrypting the cache data. also make sure this file is saved in a secure location.
 */
function cacheResponse($response) {
    global $serviceBaseURL;
    global $cacheFile;

    $responseObject = json_decode($response);
    if ($responseObject != null) {
        if ( ! isArcGISError($responseObject)) {
            $responseObject->expiresDate = intval($responseObject->expires_in) + time(); // Unix time in seconds when this token will expire
            $responseObject->appTokenBaseURL = $serviceBaseURL;
            $responseObject->arcgisUserId = ARCGIS_USER_ID;
            $response = json_encode($responseObject);
            file_put_contents($cacheFile, $response);
        }
    } else {
        $response = errorResponse(500, 'Unable to process server response.');
    }
    return $response;
}

/**
 * If we have a token cache and it has not expired, return the cache. Otherwise return null
 * to indicate a new token must be requested.
 */
function getCachedToken() {
    global $cacheFile;
    $response = file_get_contents($cacheFile);
    if ($response !== false) {
        $responseObject = json_decode($response);
        if ($responseObject != null) {
            if (time() <= $responseObject->expiresDate) {
                // token has not yet expired
                return $response;
            }
            debugLog('cache expired');
        }
    }
    return null;
}

/**
 * Make a request to an ArcGIS service to get an authorization token.
 */
function requestArcGISToken($clientID, $clientSecret, $expiration = 1440) {
    global $serviceTokenURL;
    $parameters = [
        'client_id' => $clientID,
        'client_secret' => $clientSecret,
        'grant_type' => 'client_credentials',
        'expiration' => $expiration, // this is in minutes, default is 120(7200 seconds), max is 20160
        'f' => 'json'
    ];
    $referrer = 'https://localhost';
    $certificatePath = dirname(__DIR__, 2) . '/private/cacert.pem';
    try {
        $ch = curl_init($serviceTokenURL);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($parameters));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HEADER, false);
        curl_setopt($ch, CURLOPT_REFERER, $referrer);
        curl_setopt($ch, CURLOPT_CAINFO, $certificatePath);
        $response = curl_exec($ch);
        curl_close($ch);
        $response = cacheResponse($response);
    } catch (Exception $error) {
        $response = errorResponse(500, $error->getMessage());
    }
    return $response;
}

/**
 * Process a request for an authorization token.
 */
function handleTokenRequest($forceRefresh = false) {
    if (isCallerAuthorized()) {
        if ( ! $forceRefresh) {
            $response = getCachedToken();
        } else {
            $response = null;
        }
        if ($response == null) {
            $clientID = ARCGIS_CLIENT_ID;
            $clientSecret = ARCGIS_CLIENT_SECRET;
            $response = requestArcGISToken($clientID, $clientSecret);
        }
    } else {
        $response = errorResponse(403, 'Not authorized');
    }
    echo($response);
    return;
}

processRequest();
