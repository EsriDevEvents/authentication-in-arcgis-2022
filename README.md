# Authentication in ArcGIS

We produce technical talks at Esri Developer Summit every year to explain what's new about how to authenticate in ArcGIS plus we use different approaches. On this repo you will find all these resources.

## Related talks

|Developer Summit Edition|Resources|
|---|---|
|DevSummit Europe 2022|[Authentication in ArcGIS: A Practical Approach](./devsummit-europe-22)|
|DevSummit USA 2022|[Authentication in ArcGIS](./devsummit-palm-sprints-22)|


## Resources

* [Security and Authentication conceptual guide](https://developers.arcgis.com/documentation/mapping-apis-and-services/security/)
* [Authentication in ArcGIS workspace | Postman workspace](https://www.postman.com/arcgis-developer/workspace/3e1be892-6475-4b95-b880-d713856e4180/overview)
* [Esri community developer questions](https://community.esri.com/t5/forums/tagdetailpage/tag-cloud-grouping/message/tag-cloud-style/frequent/message-scope/core-node/board-id/arcgis-rest-api-questions/user-scope/all/tag-scope/single/tag-id/3197/timerange/all/tag-visibility-scope/public)
* REST API endpoints:
  * [/oauth2/registerApp](https://developers.arcgis.com/rest/users-groups-and-items/register-app.htm)
  * [/oauth2/authorize](https://developers.arcgis.com/rest/users-groups-and-items/authorize.htm)
  * [/oauth2/revokeToken](https://developers.arcgis.com/rest/users-groups-and-items/revoke-token.htm)
  * [/oauth2/token](https://developers.arcgis.com/rest/users-groups-and-items/token.htm)
  * [/generateToken](https://developers.arcgis.com/rest/users-groups-and-items/generate-token.htm)
* ArcGIS Maps SDKs guides:
  * ArcGIS Web SDKs: [ArcGIS Maps SDK for JavaScript > Authenticate with ArcGIS Identity](https://developers.arcgis.com/javascript/latest/authenticate-with-an-arcgis-identity/), [Leaflet](https://developers.arcgis.com/esri-leaflet/authentication/apikeys/), [MapLibre GL JS](https://developers.arcgis.com/maplibre-gl-js/authentication/apikeys/), [OpenLayers](https://developers.arcgis.com/openlayers/authentication/apikeys/).
  * ArcGIS Native SDKs | Security and authentication: [Android](https://developers.arcgis.com/android/security-and-authentication/), [.NET](https://developers.arcgis.com/net/security-and-authentication/), [Qt](https://developers.arcgis.com/qt/security-and-authentication/), [iOS](https://developers.arcgis.com/ios/security-and-authentication/), [Java](https://developers.arcgis.com/java/security-and-authentication/)...
  * ArcGIS Game Engine SDKs: [Unity](https://developers.arcgis.com/unity/authentication/), [Unreal engine](https://developers.arcgis.com/unreal-engine/authentication/)
* Scripting and automation guides:
  * [ArcGIS API for Python | Working with different authentication schemes](https://developers.arcgis.com/python/guide/working-with-different-authentication-schemes/)
    * [Python: API key manager class](https://developers.arcgis.com/python/api-reference/arcgis.gis.toc.html#apikeymanager) (creates, manages and updates API keys)
  * [ArcGIS REST JS | Authentication](https://developers.arcgis.com/arcgis-rest-js/authentication/)
* Other samples:
  * [PHP and JavaScript/Node OAuth code samples](https://github.com/esri-es/arcgis-oauth-samples)
* [Get API key usage statistics | Using Python](https://github.com/esrinederland/CoolScripts/tree/main/BillingAPI)
* [How to create an API key tutorial](https://developers.arcgis.com/documentation/mapping-apis-and-services/security/tutorials/create-and-manage-an-api-key/)