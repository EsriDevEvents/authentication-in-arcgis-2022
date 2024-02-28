# ArcGIS REST JS demo using Vite bundler

Demonstration how to perform OAuth authentication using the [ArcGIS REST JS](https://developers.arcgis.com/arcgis-rest-js/) modules. This is the same demo as [Implement user authentication (browser)](https://developers.arcgis.com/arcgis-rest-js/authentication/tutorials/implement-user-authentication-rest-js-browser/) only using ESM module packaging with Vite.

Load `/index.html` in a browser. When you click **Sign In**, the app redirects to ArcGIS Online to ask for credentials and log you in. Once log in completes, your call back URL, `http://localhost:3000/authenticate.html`, is called with the access token. `/authenticate.html` parses the access token from the URL, saves it in local storage, and then redirects back to `/index.html`.

> NOTE: `http://localhost:3000/` will depend on the Vite configuration and may changed based on your local environment.

## Installation

1. Clone or fork this repository and `cd` into the `./arcgis-rest-js-auth`, or copy all the files in `./arcgis-rest-js-auth` into a new folder.
2. Install the dependencies:

```bash
npm install
```

3. Go to your [developer dashboard](https://developers.arcgis.com/applications), select an application, and copy your **client ID**.
    - Set the **Redirect URLs** to include `http://localhost:3000/authenticate.html` or the exact URL Vite is running that page at on your local environment.
    - If you do not have an ArcGIS Developer account you can [create on for free](https://developers.arcgis.com/sign-up).
    - If you do not have an application definition then create a new one, set the Redirect URL, and copy that **client ID**.

4. Open `index.html` in a text editor and paste your **client ID** in place of `YOUR_CLIENT_ID`:

```javascript
const clientId = "YOUR_CLIENT_ID";
```

5. Run the app:

```bash
npm start
```

This will start the local development server and indicate the URL of your app:

```txt
vite vx.x.x dev server running at:

  > Local: http://localhost:3000/
```

Open a web browser at that URL to display your app.

## Troubleshooting

- `Error: 400: Invalid client_id` - make sure you create your own OAuth application and set the `clientId` variable with your **client ID** in `/index.html`.
- `Error: 498: Invalid token` - the access token expired, sign out and sign in again.
- Login does not complete or the page does not refresh - make sure your Redirect URL set in your application is registered and set to match the URL in your running app.
