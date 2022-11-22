/**
 * Unit test framework to verify all expected functions do what they are designed to do.
 * Run this with `npm test`.
 */

const fs = require("fs");
const arcgisAppAuth = require("./auth.js");
const configuration = require("./server-configuration.json");

// mock an arcgis server error
const mockErrorResponse = {
    error: {
        code: 403,
        error: "Unauthorized",
        error_description: "Unauthorized",
        message: "Unauthorized",
        details: []
    }
};

// mock a good response. Make sure these are values we would not expect from a real token.
const mockGoodResponse = {
    access_token: "1234",
    expires_in: 1111
};

// remove a cache from a prior run.
function clearCache() {
    if (fs.existsSync(configuration.cacheFile)) {
        fs.unlinkSync(configuration.cacheFile);
    }
};

test('errorResponse returns error object', () => {
    expect(arcgisAppAuth.errorResponse).toBeDefined();
    const message = "This is an error message";
    const statusCode = 444;
    const serverError = arcgisAppAuth.errorResponse(statusCode, message);
    expect(typeof serverError).toBe("object");
    expect(serverError.error).toBeDefined();
    expect(serverError.error.code).toEqual(statusCode);
    expect(serverError.error.error).toEqual("invalid_server_response");
    expect(serverError.error.error_description).toContain(message);
});

test("is ArcGIS error", () => {
    expect(arcgisAppAuth.isArcGISError).toBeDefined();
    expect(arcgisAppAuth.isArcGISError(mockErrorResponse)).toBeTruthy();
    expect(arcgisAppAuth.isArcGISError(null)).toBeTruthy();
    expect(arcgisAppAuth.isArcGISError(mockGoodResponse)).toBeFalsy();
});

test("cacheResponse actually caches something", async () => {
    let result;
    expect(arcgisAppAuth.cacheResponse).toBeDefined();

    // remove a cache from a prior run.
    clearCache();

    // expected to not cache anything
    result = arcgisAppAuth.cacheResponse(null);
    expect(result).toBeNull();
    expect(fs.existsSync(configuration.cacheFile)).toBeFalsy();

    // error should be recognized and not cached
    result = arcgisAppAuth.cacheResponse(mockErrorResponse);
    expect(result).toMatchObject(mockErrorResponse);
    expect(fs.existsSync(configuration.cacheFile)).toBeFalsy();

    // good response should be updated and cached
    result = arcgisAppAuth.cacheResponse(mockGoodResponse);
    await new Promise(function(resolve) { setTimeout(resolve, 250) }); // short wait to make sure the stream is closed
    expect(fs.existsSync(configuration.cacheFile)).toBeTruthy();
    expect(result).toMatchObject(mockGoodResponse);
    expect(result.expiresDate).toBeDefined();
    expect(result.expiresDate).toBeGreaterThan(0);
    expect(result.appTokenBaseURL).toBeDefined();
    expect(result.appTokenBaseURL.length).toBeGreaterThan(0);

    clearCache();
});

test("getCachedToken rejects when no cache", () => {
    expect(arcgisAppAuth.getCachedToken).toBeDefined();

    // remove a cache from a prior run.
    clearCache();
    
    // test to make sure an error is resolved when there is no cache
    expect.assertions(2);
    return arcgisAppAuth.getCachedToken().catch(function(error) {
        expect(error.toString()).toMatch('ENOENT')
    });
});

test("getCachedToken rejects when cache is expired", async () => {
    expect(arcgisAppAuth.getCachedToken).toBeDefined();

    // remove a cache from a prior run.
    clearCache();

    // try to cache a token that will be expired
    let mockExpiredResponse = {
        ...mockGoodResponse
    };
    mockExpiredResponse.expires_in = -1;
    result = arcgisAppAuth.cacheResponse(mockExpiredResponse);
    await new Promise(function(resolve) { setTimeout(resolve, 250) }); // short wait to make sure the stream is closed
    expect(fs.existsSync(configuration.cacheFile)).toBeTruthy();
    expect(result).toMatchObject(mockExpiredResponse);

    // test to make sure an error is resolved when the cache is expired
    expect.assertions(4);
    return arcgisAppAuth.getCachedToken().catch(function(error) {
        expect(error.toString()).toMatch('Token expired');
    });
});

test("getCachedToken succeeds when cache is good", async () => {
    expect(arcgisAppAuth.getCachedToken).toBeDefined();

    // remove a cache from a prior run.
    clearCache();

    result = arcgisAppAuth.cacheResponse(mockGoodResponse);
    await new Promise(function(resolve) { setTimeout(resolve, 250) }); // short wait to make sure the stream is closed
    expect(fs.existsSync(configuration.cacheFile)).toBeTruthy();
    expect(result).toMatchObject(mockGoodResponse);

    // test to make sure an error is resolved when there is no cache
    expect.assertions(7);
    return arcgisAppAuth.getCachedToken().then(function(token) {
        expect(token.access_token).toEqual(mockGoodResponse.access_token);
        expect(token.expires_in).toEqual(mockGoodResponse.expires_in);
        expect(token.appTokenBaseURL).toEqual(configuration.appTokenBaseURL);
        expect(token.arcgisUserId.length).toBeGreaterThan(0);
    });
});

test("requestTokenWithRequest gets a token from the server and caches it", async () => {
    expect(arcgisAppAuth.requestTokenWithRequest).toBeDefined();

    // remove a cache from a prior run. Here I am going to cache the mock token and we expect not to see this when the request is complete.
    clearCache();

    result = arcgisAppAuth.cacheResponse(mockGoodResponse);
    await new Promise(function(resolve) { setTimeout(resolve, 250) }); // short wait to make sure the stream is closed

    expect.assertions(6);
    return arcgisAppAuth.requestTokenWithRequest().then(function(token) {
        expect(token.access_token).not.toEqual(mockGoodResponse.access_token);
        expect(token.expires_in).toEqual(configuration.tokenExpirationMinutes * 60);
        expect(token.appTokenBaseURL).toEqual(configuration.appTokenBaseURL);
        expect(token.arcgisUserId.length).toBeGreaterThan(0);
        expect(fs.existsSync(configuration.cacheFile)).toBeTruthy();
    });
});

test("requestTokenWithRequest fails bad credentials/error response", async () => {
    expect(arcgisAppAuth.requestTokenWithRequest).toBeDefined();

    clearCache();

    const restoreClientId = process.env.CLIENT_ID;
    process.env.CLIENT_ID = "BAD";
    expect.assertions(6); // should only hit the catch phrase.
    return arcgisAppAuth.requestTokenWithRequest().then(function(token) {
        process.env.CLIENT_ID = restoreClientId;
        expect(token.access_token).not.toEqual(mockGoodResponse.access_token);
    })
    .catch(function(error) {
        process.env.CLIENT_ID = restoreClientId;
        expect(error).toBeDefined();
        expect(error.error).toBeDefined();
        expect(error.error.code).toBeDefined();
        expect(error.error.message).toBeDefined();
        expect(error.error.code).toEqual(400);
    });
});

test("requestTokenWithAuth gets a token from the server and caches it", async () => {
    expect(arcgisAppAuth.requestTokenWithAuth).toBeDefined();

    // remove a cache from a prior run. Here I am going to cache the mock token and we expect not to see this when the request is complete.
    clearCache();

    result = arcgisAppAuth.cacheResponse(mockGoodResponse);
    await new Promise(function(resolve) { setTimeout(resolve, 250) }); // short wait to make sure the stream is closed

    expect.assertions(6);
    return arcgisAppAuth.requestTokenWithAuth().then(function(token) {
        expect(token.access_token).not.toEqual(mockGoodResponse.access_token);
        expect(token.expires_in).toEqual(configuration.tokenExpirationMinutes * 60);
        expect(token.appTokenBaseURL).toEqual(configuration.appTokenBaseURL);
        expect(token.arcgisUserId.length).toBeGreaterThan(0);
        expect(fs.existsSync(configuration.cacheFile)).toBeTruthy();
    });
});

test("getToken gets a token from the cache", async () => {
    expect(arcgisAppAuth.getToken).toBeDefined();

    // remove a cache from a prior run.
    clearCache();

    result = arcgisAppAuth.cacheResponse(mockGoodResponse);
    await new Promise(function(resolve) { setTimeout(resolve, 250) }); // short wait to make sure the stream is closed

    expect.assertions(6);
    return arcgisAppAuth.getToken().then(function(token) {
        expect(token.access_token).not.toEqual(mockGoodResponse.access_token);
        expect(token.expires_in).not.toEqual(mockGoodResponse.expires_in);
        expect(token.appTokenBaseURL).toEqual(configuration.appTokenBaseURL);
        expect(token.arcgisUserId.length).toBeGreaterThan(0);
        expect(fs.existsSync(configuration.cacheFile)).toBeTruthy();
    });
});
