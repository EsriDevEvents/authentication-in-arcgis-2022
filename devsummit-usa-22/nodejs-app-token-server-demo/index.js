/**
 * Node.js server app used to demonstrate a server-based process for generating ArcGIS application tokens
 * and handing them out to client apps. See README for details how this app works.
 * Run this with `npm start`.
 */
const esriAppAuth = require("./auth");
const Express = require('express');
const ClientSession = require("express-session");
const FileStore = require("session-file-store")(ClientSession);
const CORS = require('cors');
const webServer = Express();
require("dotenv").config();
const configuration = require("./server-configuration.json");

const port = process.env.PORT || 3080;
webServer.use(CORS());
webServer.use(Express.json());
webServer.use(Express.urlencoded({ extended: true }));

/**
 * Add some logic to the app to make sure a client calling this endpoint is authorized to do so.
 * Typical methods are to verify CORS, origin of request, and including a session_id. For example,
 * use express-session https://www.npmjs.com/package/express-session to save a session id, and
 * then make sure the client requesting the token is the same one that was assigned the matching session id.
 * @returns {boolean} True when authorized to call this endpoint.
 */
function isClientAuthorized(request) {
    // verify the correct session id is in the request.
    const nonce = request.body.nonce;
    return nonce == "1234";
};

/**
 * Create a session handler to make sure the requesting client
 * securely gets the session information.
 */
var clientSession = ClientSession({
    name: "arcgis-client-session",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: configuration.tokenExpirationMinutes * 60000, // convert minutes to milliseconds
    },

    // store session data in a secure, encrypted file
    // sessions will be loaded from these files and decrypted
    // at the end of every request the state of `request.session`
    // will be saved back to disk.
    store: new FileStore({
      ttl: configuration.tokenExpirationMinutes * 60, // convert minutes to seconds
      retries: 1,
      secret: process.env.ENCRYPTION_KEY,

      // custom encoding and decoding for sessions means we can
      // initialize a single `UserSession` object for use with rest js
      encoder: (session) => {
        if (typeof session.userSession !== "string") {
          session.userSession = sessionObj.userSession.serialize();
        }
        return JSON.stringify(sessionObj);
      },
      decoder: (sessionContents) => {
        if (!sessionContents) {
          return { userSession: null };
        }

        const session =
          typeof sessionContents === "string"
            ? JSON.parse(sessionContents)
            : sessionContents;

        if (typeof session.userSession === "string") {
          session.userSession = UserSession.deserialize(
            session.userSession
          );
        }
        return session;
      },
    }),
});
webServer.use(clientSession);

/**
 * Define the /auth route to get a token.
 */
webServer.post('/auth', function (request, response) {
    if ( ! isClientAuthorized(request)) {
        response.send(esriAppAuth.errorResponse(403, "Unauthorized."));
        return;
    }

    const forceRefresh = (request.body.force || '0') == '1';
    esriAppAuth.getToken(forceRefresh)
    .then(function(token) {
        response.json(token);
        console.log("Giving a token to " + request.headers["referer"]);
    })
    .catch(function(error) {
        response.json(error);
    });
});
 
webServer.listen(port);
console.log("Token service is listening on port " + port);
