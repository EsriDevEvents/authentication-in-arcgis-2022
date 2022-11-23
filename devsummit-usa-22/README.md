# Authentication in ArcGIS

> Developer Summit Palm Springs - March 2022


Two main authentication mechanisms exist for applications built with ArcGIS services. API keys allow quick access to popular locations services such as basemaps, routing and geocoding, and ArcGIS Identities provide access to private user and organization content for richer experiences. This session will cover the key differences and use cases between these approaches and how to integrate each into your applications

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  

- [Recording](#recording)
- [Slides](#slides)
- [Sample code](#sample-code)
- [Additional resources](#additional-resources)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

---

## Recording

[Watch the recording](https://mediaspace.esri.com/playlist/dedicated/259237542/1_gqom4ry7/1_gnry42em):

[![Talk thumbnail](https://cfvod.kaltura.com/p/3057483/sp/305748300/thumbnail/entry_id/1_gnry42em/version/100001/width/478/height/269/width/478/height/269/type/3/quality/100)](https://mediaspace.esri.com/playlist/dedicated/259237542/1_gqom4ry7/1_gnry42em)

## Slides
[Download the slides on PDF](https://static.rainfocus.com/esri/epcds/sess/1645210562162001juHB/SPDF/13912-authentication-in-arcgis_16488378275660015E0z.pdf)

## Sample code

Companion example code for the [Authentication in ArcGIS technical session](https://web.archive.org/web/20220308162553/https://www.esri.com/en-us/about/events/devsummit/agenda/agenda/detail?date=2022-03-09) at Esri Developer Summit 2022.

This repository has sample projects that help demonstrate some of the authentication techniques you can use with ArcGIS servers. Review the documentation at [Security and authentication](https://developers.arcgis.com/documentation/mapping-apis-and-services/security/) to learn more about the methods of authentication:

- [API keys](https://developers.arcgis.com/documentation/mapping-apis-and-services/security/api-keys/)
- [ArcGIS identity](https://developers.arcgis.com/documentation/mapping-apis-and-services/security/arcgis-identity/), or logging users in
- [Application credentials](https://developers.arcgis.com/documentation/mapping-apis-and-services/security/application-credentials/)
- [Other authentication methods](https://developers.arcgis.com/documentation/mapping-apis-and-services/security/arcgis-identity/other-authentication-methods/)

There are 6 projects here that demonstrate 3 of the authentication methods:

- [esm-api-key-demo](./esm-api-key-demo/README.md) demonstrates using [API keys](https://developers.arcgis.com/documentation/mapping-apis-and-services/security/api-keys/) with basemaps and routing services in an [ArcGIS API for JavaScript](https://developers.arcgis.com/javascript/) browser-based application using ES modules.
- [arcgis-rest-js-auth](./arcgis-rest-js-auth/README.md) demonstrates using [ArcGIS identity](https://developers.arcgis.com/documentation/mapping-apis-and-services/security/arcgis-identity/) with OAuth 2.0 to log a user in with [ArcGIS REST JS](https://developers.arcgis.com/arcgis-rest-js/) browser-based application using Vite.
- [esm-user-login-demo](./esm-user-login-demo/README.md) demonstrates using [ArcGIS identity](https://developers.arcgis.com/documentation/mapping-apis-and-services/security/arcgis-identity/) with OAuth 2.0 to log a user in to use basemaps and routing services in an [ArcGIS API for JavaScript](https://developers.arcgis.com/javascript/) browser-based application using ES modules.
- [nodejs-app-credential-example](./nodejs-app-credential-example/README.md) is an implementation of the application credentials Node.js example code shown on [ArcGIS application credentials](https://developers.arcgis.com/documentation/mapping-apis-and-services/security/application-credentials/).
- [esm-app-token-demo](./esm-app-token-demo/README.md) demonstrates using [ArcGIS application credentials](https://developers.arcgis.com/documentation/mapping-apis-and-services/security/application-credentials/) with a back-end server and OAuth 2.0 to get an application token to use basemaps and routing services in an [ArcGIS API for JavaScript](https://developers.arcgis.com/javascript/) browser-based application using ES modules. This project requires a running server to handle the token negotiation, and there are two options provided here:

    - [nodejs-app-token-server-demo](./nodejs-app-token-server-demo/README.md) is a server written with Node.js.
    - [php-app-token-server-demo](./nodejs-app-token-server-demo/README.md) is a server written with PHP.

The example servers are minimal implementations designed to demonstrate the necessary building blocks for such a service, but require additional security and operational considerations that are beyond the scope of this demo.

## Additional resources

* [Developers.arcgis.com](https://developers.arcgis.com/)
* [Security and Authentication](https://developers.arcgis.com/documentation/mapping-apis-and-services/security/)
* [Esri community developer questions](https://community.esri.com/t5/developers-questions/bd-p/developers-questions)
* [ArcGIS API for JavaScript](https://developers.arcgis.com/javascript/latest/authenticate-with-an-arcgis-identity/)
* [ArcGIS Runtime APIs](https://developers.arcgis.com/net/security-and-authentication/)
* [ArcGIS API for Python](https://developers.arcgis.com/python/guide/working-with-different-authentication-schemes/)
* [ArcGIS REST JS](https://developers.arcgis.com/arcgis-rest-js/authenticate/authenticate-with-an-arcgis-identity-rest-js-browser/)