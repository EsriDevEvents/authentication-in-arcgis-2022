# PHP ArcGIS Application Credentials

This is a demo implementation of a PHP server that acts as a proxy service for ArcGIS application credentials.

Learn more about [ArcGIS application credentials](https://developers.arcgis.com/documentation/mapping-apis-and-services/security/application-credentials/).

## The problem

If you use ArcGIS and need a more secure authentication method than API keys, application credentials are a possible choice. This uses an OAuth type handshake with the ArcGIS services to request an authentication token and use it to authenticate services in your client app. However, you do not want to bake in your `clientID` and `clientSecret` in a client app as that could expose your credentials to hijacking. If a nefarious entity gets hold of your credentials they can create tokens on your behalf. To avoid that, your client app requests authentication tokens from an app like this one. The token also expires requiring frequent refreshing and updating the client app with valid tokens. It is also expected your server will run on HTTPS.

## Install

Make a copy of this folder.

1. Log in with your ArcGIS Developer account at https://developers.arcgis.com. Create a new [OAuth 2.0 application](https://developers.arcgis.com/applications) (you can use an existing app.) Copy the **Client ID** and **Client Secret**.

2. Rename `secret.sample.php` to `secret.php`. Note `secret.php` is not committed to version control via `.gitignore` so your secrets are not shared. Edit this file to replace `YOUR_CLIENT_ID` and `YOUR_CLIENT_SECRET` with the values from your application.

3. Install the app on your PHP-based webserver. The endpoint is `auth.php` depending on the path you install this project at.
