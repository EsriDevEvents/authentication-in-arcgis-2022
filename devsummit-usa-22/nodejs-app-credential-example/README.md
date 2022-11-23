# Node.js ArcGIS Application Credentials Example

This is an example used to demonstrate a Node.js server service that uses an ArcGIS application credential to authenticate with an ArcGIS location service.

Learn more about [ArcGIS application credentials](https://developers.arcgis.com/documentation/mapping-apis-and-services/security/application-credentials/). The example code here is an implementation of the Node.js example code snippets on that page.

## The problem

If you use ArcGIS and need a more secure authentication method than API keys, application credentials are a possible choice. This example uses the OAuth protocol `client_credentials` grant type with the ArcGIS Platform server to request an authentication token and use it to authenticate with ArcGIS Platform location services in your server app.

This is a server-based app and it is not intended to demonstrate a client-based app workflow. If you are looking to deploy a client app then consider [Node.js ArcGIS Application Credentials Server](../nodejs-app-token-server-demo/README.md).

## Install

Make a copy of this folder.

1. Install the dependencies with `npm install`.

2. Log in with your ArcGIS Developer account at https://developers.arcgis.com. Create a new [OAuth 2.0 application definition](https://developers.arcgis.com/applications) (you can use an existing app.) Copy the **Client ID** and **Client Secret**.

3. Rename `.env.sample` to `.env`. Note `.env` is not committed to version control via `.gitignore` so your secrets are not shared. Edit this file to replace `YOUR_CLIENT_ID` and `YOUR_CLIENT_SECRET` with the values from your registered application.

4. Run the app with `npm start`. The app will request an application token from the ArcGIS Platform server and then use it in a request to the GeoEnrichment service.
