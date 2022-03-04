/**
 * ArcGIS API for JavaScript demo app with OAuth user login.
 * This app fills the `appDiv` element in index.html with the map app that searches the map for places
 * and then finds the 3 closest places to the location clicked on the map.
 */
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import Graphic from "@arcgis/core/Graphic";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import FeatureSet from "@arcgis/core/rest/support/FeatureSet";
import ClosestFacilityParameters from "@arcgis/core/rest/support/ClosestFacilityParameters";
import * as closestFacility from "@arcgis/core/rest/closestFacility";
import * as locator from "@arcgis/core/rest/locator";
import IdentityManager from "@arcgis/core/identity/IdentityManager";
import OAuthInfo from "@arcgis/core/identity/OAuthInfo";

import { clientID } from "./secret";
const mapStartLocation = [-123.18586, 49.24824];
const locatorUrl = "http://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer";
const closestFacilityUrl = "https://route-api.arcgis.com/arcgis/rest/services/World/ClosestFacility/NAServer/ClosestFacility_World/solveClosestFacility/";

const startSymbol = {
    type: "simple-marker",
    color: "red",
    size: "10px",
    outline: {
        color: "black",
        width: "2px",
    },
};

const facilitySymbol = {
    type: "simple-marker",
    color: "black",
    size: "11px",
    outline: {
        color: "white",
        width: "1px",
    },
};

const routeSymbol = {
    type: "simple-line",
    color: [50, 150, 255, 0.75],
    width: "5",
};

// Define searchable places
const places = [
    {category: "Gas station", icon: "gas-station"},
    {category: "College", icon: "school"},
    {category: "Grocery", icon: "grocery-store"},
    {category: "Hotel", icon: "hotel"},
    {category: "Hospital", icon: "hospital"},
    {category: "Police station", icon: "police-station"}
];
let placeCategory = places[0].category;

function getPlaceIconName(category) {
    for (let i = 0; i < places.length; i += 1) {
        if (places[i].category == category) {
            return places[i].icon;
        }
    }
    return "";
}

function setupMapView() {
    const routeLayer = new GraphicsLayer();
    const facilitiesLayer = new GraphicsLayer();
    const selectedFacilitiesLayer = new GraphicsLayer();
    const startLayer = new GraphicsLayer();

    // Build the place select UI
    const select = document.createElement("select", "");
    select.setAttribute("class", "esri-widget esri-select");
    select.setAttribute(
        "style",
        "width: 175px; font-family: 'Avenir Next'; font-size: 1em"
    );

    places.forEach((place) => {
        const option = document.createElement("option");
        option.value = place.category;
        option.innerHTML = place.category;
        select.appendChild(option);
    });

    select.addEventListener("change", (event) => {
        placeCategory = event.target.value;
        findFacilities(startLayer.graphics.getItemAt(0).geometry, true);
    });

    const map = new Map({
        basemap: "arcgis-navigation",
        layers: [routeLayer, facilitiesLayer, selectedFacilitiesLayer, startLayer]
    });

    const mapView = new MapView({
        map,
        container: "appDiv",
        center: mapStartLocation,
        zoom: 12,
        constraints: {
            snapToZoom: false
        }
    });
    mapView.popup.actions = [];

    mapView.ui.add(select, "top-right");
    mapView.when(() => {
        addStart(mapView.center);
        findFacilities(mapView.center, true);
    });

    mapView.on("click", (event)=> {
        mapView.hitTest(event).then((response)=> {
            if (response.results.length === 1) {
                findFacilities(event.mapPoint, false);
            }
        });
    });

    // Find places and add them to the map
    function findFacilities(pt, refresh) {
        mapView.popup.close();
        addStart(pt);
        if (refresh) {
            // Add facilities
            locator.addressToLocations(locatorUrl, {
                location: pt,
                searchExtent: mapView.extent,
                categories: [placeCategory],
                maxLocations: 25,
                outFields: ["Place_addr", "PlaceName"],
                outSpatialReference: mapView.spatialReference
            })
            .then((results)=> {
                facilitiesLayer.removeAll();
                routeLayer.removeAll();
                selectedFacilitiesLayer.removeAll();
                if (results.length > 0) {
                    // Add graphics
                    showFacilities(results);
                    // Find closest place
                    findClosestFacility(startLayer.graphics.getItemAt(0), facilitiesLayer.graphics);
                }
            });
        } else {
            findClosestFacility(startLayer.graphics.getItemAt(0), facilitiesLayer.graphics);
        }
    }

    function addStart(pt) {
        startLayer.graphics.removeAll();
        startLayer.add(new Graphic({
            geometry: pt,
            symbol: startSymbol
        }));
    }

    function findClosestFacility(startGraphic, facilityGraphics) {
        routeLayer.removeAll();
        selectedFacilitiesLayer.removeAll();
        let params = new ClosestFacilityParameters({
            incidents: new FeatureSet({
                features: [startGraphic],
            }),
            facilities: new FeatureSet({
                features: facilityGraphics.toArray(),
            }),
            returnRoutes: true,
            returnFacilities: true,
            defaultTargetFacilityCount: 3,
        });

        closestFacility.solve(closestFacilityUrl, params).then(
            (results) => {
                results.routes.forEach((route, i)=> {
                    // Add closest route
                    route.symbol = routeSymbol;
                    routeLayer.add(route);
                    // Add closest facility
                    const facility = results.facilities[route.attributes.FacilityID - 1];
                    addSelectedFacility(i + 1, facility.latitude, facility.longitude, route.attributes);
                });
            },
            (error) => {
                console.log(error.details);
            }
        );
    }

    function showFacilities(results) {
        results.forEach((result,i)=> {
            facilitiesLayer.add(
                new Graphic({
                    attributes: result.attributes,
                    geometry: result.location,
                    symbol: {
                        type: "web-style",
                        name: getPlaceIconName(placeCategory),
                        styleName: "Esri2DPointSymbolsStyle",
                    },
                    popupTemplate: {
                        title: "{PlaceName}",
                        content: "{Place_addr}" +
                            "<br><br>" +
                            result.location.longitude.toFixed(5) +
                            "," +
                            result.location.latitude.toFixed(5)
                    },
                })
            );
        });
    }

    function addSelectedFacility(number, latitude, longitude, attributes) {
        selectedFacilitiesLayer.add(new Graphic({
            symbol: {
                type: "simple-marker",
                color: [255, 255, 255,1.0],
                size: 18,
                outline: {
                    color: [50,50,50],
                    width: 1
                }
            },
            geometry: {
                type: "point",
                latitude: latitude,
                longitude: longitude
            },
            attributes: attributes
        }));
        selectedFacilitiesLayer.add(new Graphic({
            symbol: {
                type: "text",
                text: number,
                font: { size: 11, weight: "bold" },
                yoffset: -4,
                color: [50,50,50]
            },
            geometry: {
                type: "point",
                latitude: latitude,
                longitude: longitude
            },
            attributes: attributes
        }));
    }
}

function configureApp() {

    const oauthInfo = new OAuthInfo({
        appId: clientID,
        popup: false
    });
    IdentityManager.registerOAuthInfos([oauthInfo]);

    IdentityManager.checkSignInStatus(oauthInfo.portalUrl + "/sharing")
    .then(function(userCredential) {
        document.getElementById("userId").innerText = userCredential.userId;
        document.getElementById("personalizedPanel").style.display = "block";
        setupMapView();
    })
    .catch(function(error) {
        // Anonymous view
        document.getElementById("loginPanel").style.display = "block";
        document.getElementById("loginMessage").innerText = "You are not logged in. " + error.toString();
    });

    document.getElementById("sign-in").addEventListener("click", function() {
        // Redirect to OAuth Sign In page
        IdentityManager.getCredential(oauthInfo.portalUrl + "/sharing");
    });

    document.getElementById("sign-out").addEventListener("click", function() {
        IdentityManager.destroyCredentials();
        window.location.reload();
    });
};

configureApp();
