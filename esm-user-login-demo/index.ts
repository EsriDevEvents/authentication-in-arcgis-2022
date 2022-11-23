/**
 * ArcGIS API for JavaScript demo app with OAuth user login.
 * This app fills the `appDiv` element in index.html with the map app that searches the map for places
 * and then finds the 3 closest places to the location clicked on the map.
 */
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import Graphic from "@arcgis/core/Graphic";
import Point from "@arcgis/core/geometry/Point";
import * as route from "@arcgis/core/rest/route";
import RouteParameters from "@arcgis/core/rest/support/RouteParameters";
import FeatureSet from "@arcgis/core/rest/support/FeatureSet";
import IdentityManager from "@arcgis/core/identity/IdentityManager";
import OAuthInfo from "@arcgis/core/identity/OAuthInfo";

// @ts-ignore
import { clientID } from "./secret";
const mapStartLocation = new Point({
  longitude: -116.5414418,
  latitude: 33.8258333,
});
const demoDestination = new Point({
  longitude: -116.3697003,
  latitude: 33.7062298,
});
const routeUrl =
  "https://route-api.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World";

const routeSymbol = {
  type: "simple-line",
  color: [50, 150, 255, 0.75],
  width: "5",
} as unknown as __esri.SimpleLineSymbol;

function addGraphic(type: any, point: Point, view: MapView) {
  const graphic = new Graphic({
    symbol: {
      type: "simple-marker",
      color: type === "start" ? "green" : "red",
      size: "12px",
      outline: {
        color: "black",
        width: "2px",
      },
    } as __esri.SimpleMarkerSymbolProperties,
    geometry: point,
  });
  view.graphics.add(graphic);
}

function getRoute(view: MapView) {
  const routeParams = new RouteParameters({
    stops: new FeatureSet({
      features: view.graphics.toArray(),
    }),
    returnDirections: true,
  });

  function showRoutes(routes: __esri.RouteResult[]) {
    routes.forEach((result) => {
      result.route.symbol = routeSymbol;
      view.graphics.add(result.route, 0);
    });
  }

  function showDirections(directions: Graphic[]) {
    function showRouteDirections(directions: Graphic[]) {
      const directionsList = document.createElement("ol");
      directions.forEach((result: Graphic) => {
        const direction = document.createElement("li");
        direction.innerHTML =
          result.attributes.text +
          (result.attributes.length > 0
            ? " (" + result.attributes.length.toFixed(2) + " miles)"
            : "");
        directionsList.appendChild(direction);
      });
      directionsElement.appendChild(directionsList);
    }

    const directionsElement = document.createElement("div");
    directionsElement.innerHTML = "<h3>Directions</h3>";
    // @ts-ignore
    directionsElement.classList =
      "esri-widget esri-widget--panel esri-directions__scroller directions";
    directionsElement.style.marginTop = "0";
    directionsElement.style.padding = "0 15px";
    directionsElement.style.minHeight = "365px";

    showRouteDirections(directions);

    view.ui.empty("top-right");
    view.ui.add(directionsElement, "top-right");
  }

  route
    .solve(routeUrl, routeParams)
    // reponse of type __esri.DirectionsLastRoute
    .then((response: any) => {
      showRoutes(response.routeResults);
      showDirections(response.routeResults[0].directions.features);
    })
    .catch((error) => {
      console.log(error);
    });
}

function setupMapView() {
  const map = new Map({
    basemap: "arcgis-navigation",
  });

  const mapView = new MapView({
    map,
    container: "appDiv",
    center: mapStartLocation,
    zoom: 11,
    constraints: {
      snapToZoom: false,
    },
  });

  mapView.when(() => {
    // create a demo route once the view is loaded
    addGraphic("start", mapView.center, mapView);
    setTimeout(() => {
      addGraphic("finish", demoDestination, mapView);
      getRoute(mapView);
    }, 1000);
  });

  mapView.on("click", (event) => {
    if (mapView.graphics.length === 0) {
      addGraphic("start", event.mapPoint, mapView);
    } else if (mapView.graphics.length === 1) {
      addGraphic("finish", event.mapPoint, mapView);
      getRoute(mapView);
    } else {
      mapView.graphics.removeAll();
      mapView.ui.empty("top-right");
      addGraphic("start", event.mapPoint, mapView);
    }
  });
}

function configureApp() {
  const oauthInfo = new OAuthInfo({
    appId: clientID,
    popup: false,
  });
  IdentityManager.registerOAuthInfos([oauthInfo]);

  IdentityManager.checkSignInStatus(oauthInfo.portalUrl + "/sharing")
    .then(function (userCredential) {
      // @ts-ignore
      document.getElementById("userId").innerText = userCredential.userId;
      // @ts-ignore
      document.getElementById("personalizedPanel").style.display = "block";
      // once user is logged in we can show map and route
      setupMapView();
    })
    .catch(function (error) {
      // Anonymous view
      // @ts-ignore
      document.getElementById("loginPanel").style.display = "block";
      // @ts-ignore
      document.getElementById("loginMessage").innerText =
        "You are not logged in. " + error.toString();
    });

  // @ts-ignore
  document.getElementById("sign-in").addEventListener("click", function () {
    // Redirect to OAuth Sign In page
    IdentityManager.getCredential(oauthInfo.portalUrl + "/sharing");
  });

  // @ts-ignore
  document.getElementById("sign-out").addEventListener("click", function () {
    IdentityManager.destroyCredentials();
    window.location.reload();
  });
}

configureApp();
