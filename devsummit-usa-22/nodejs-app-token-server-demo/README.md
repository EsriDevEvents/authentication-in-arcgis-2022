# Node.js ArcGIS Application Credentials Server

This is a demo implementation of a Node.js server that acts as a proxy service for ArcGIS application credentials.

Learn more about [ArcGIS application credentials](https://developers.arcgis.com/documentation/mapping-apis-and-services/security/application-credentials/).

## The problem

If you use ArcGIS and need a more secure authentication method than API keys, application credentials are a possible choice. This uses the OAuth protocol `client_credentials` grant type with ArcGIS location services to request an authentication token and use it to authenticate services in your client app. However, you do not want to bake in your `clientID` and `clientSecret` in a client app as that could expose your credentials to hijacking. If a nefarious entity gets hold of your credentials they could create tokens on your behalf. To avoid that and keep your credentials secure, your client app requests authentication tokens from an app like this one. The token also expires, requiring frequent refreshing and updating the client app with valid tokens. It is also expected your server will run over HTTPS.

## Install

Make a copy of this folder.

1. Install the dependencies with `nm install`.

2. Log in with your ArcGIS Developer account at https://developers.arcgis.com. Create a new [OAuth 2.0 application definition](https://developers.arcgis.com/applications) (you can use an existing app.) Copy the **Client ID** and **Client Secret**.

3. Rename `.env.sample` to `.env`. Note `.env` is not committed to version control via `.gitignore` so your secrets are not shared. Edit this file to replace `YOUR_CLIENT_ID` and `YOUR_CLIENT_SECRET` with the values from your registered application.

4. Run the app with `npm start`. The app will listen on port 3080 at the `/auth` endpoint where it expects authorized clients to request authentication tokens.

> You can set the port by setting the environment variable `PORT` in your `.env` file, the command line environment, or by editing the code.

5. Use a client app to request an application token that can then be used to authenticate with ArcGIS location services. An example client app implementation can be found in [JavaScript demo using application token authentication](../esm-app-token-demo/README.md).
