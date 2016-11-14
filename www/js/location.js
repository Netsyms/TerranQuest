/*
 * TerranQuest - Augmented Reality fantasy game
 *
 * Copyright 2016 Netsyms Technologies
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


//////////////////////////////////////////////
//  GPS and map stuff
//////////////////////////////////////////////

/**
 * Handles GPS and map data.
 */

// Globals
var lockGot = false;
var latitude = 0.0000;
var longitude = 0.0000;
var gpsaccuracy = 9999;
var requiredaccuracy = 40;
// End Globals

var fetchplacecounter = 0;
var lastgpstime = 0;
var map = L.map('map');
var tileurl = "http://tile.stamen.com/terrain/{z}/{x}/{y}.jpg";
map.setZoom(17);
map.dragging.disable();
//map.touchZoom.disable();
//map.doubleClickZoom.disable();
//map.scrollWheelZoom.disable();
map.keyboard.disable();
$(".leaflet-control-zoom").css("visibility", "hidden");
// Disable tap handler, if present.
//if (map.tap) {
//    map.tap.disable();
//}

// Tile layer
map.addLayer(new L.tileLayer(tileurl, {minZoom: 16, maxZoom: 18}));
// Places layer
var placeLayer = L.geoJson(
        {"name": "Places", "type": "FeatureCollection", "features": [{"type": "Feature", "geometry": {"type": "Point", "coordinates": [0, 0]}, "properties": {"osm_id": -1, "name": null, 'gameinfo': {'teamid': "0"}}}]},
        {
            onEachFeature: onPlaceTap,
            pointToLayer: function (feature, latlng) {
                var teamcolor = "#" + getTeamColorFromId(feature.properties.gameinfo.teamid);
                return L.circleMarker(latlng, {
                    radius: 14,
                    fillColor: teamcolor,
                    color: "#000",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.6
                });
            }
        });//.addTo(map);

var placemarkers = L.markerClusterGroup({
    spiderfyDistanceMultiplier: 2,
    spiderfyOnMaxZoom: false,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: false,
    maxClusterRadius: 30
});
placemarkers.on('clusterclick', function (a) {
    a.layer.spiderfy();
});
placemarkers.addLayer(placeLayer);
map.addLayer(placemarkers);

var lc = L.control.locate({
    position: 'topleft', // set the location of the control
    layer: undefined, // use your own layer for the location marker, creates a new layer by default
    drawCircle: false, // controls whether a circle is drawn that shows the uncertainty about the location
    setView: 'always',
    keepCurrentZoomLevel: true, // keep the current map zoom level when displaying the user's location. (if `false`, use maxZoom)
    remainActive: {inView: 'setView', outOfView: 'setView'},
    markerClass: L.circleMarker, // L.circleMarker or L.marker
    circleStyle: {}, // change the style of the circle around the user's location
    markerStyle: {color: '#008000', fillColor: '#32CD32'},
    followCircleStyle: {}, // set difference for the style of the circle around the user's location while following
    followMarkerStyle: {},
    icon: 'fa fa-map-marker', // class for icon, fa-location-arrow or fa-map-marker
    iconLoading: 'fa fa-spinner fa-pulse', // class for loading icon
    iconElementTag: 'span', // tag for the icon element, span or i
    circlePadding: [0, 0], // padding around accuracy circle, value is passed to setBounds
    metric: true, // use metric or imperial units
    onLocationError: function (err) {
    }, // define an error callback function
    onLocationOutsideMapBounds: function (context) { // called when outside map boundaries
    },
    showPopup: false, // display a popup when the user click on the inner marker
    strings: {
        title: ".", // title of the locate control
        metersUnit: "meters", // string for metric units
        feetUnit: "feet", // string for imperial units
        popup: "You are within {distance} {unit} from this point", // text to appear if user clicks on circle
        outsideMapBoundsMsg: "You seem located outside the boundaries of the map" // default message for onLocationOutsideMapBounds
    },
    locateOptions: {}  // define location options e.g enableHighAccuracy: true or maxZoom: 10
}).addTo(map);
lc.start();


function mapPos(lat, lon) {
    lockGot = true;
    hideLoading();
    // Don't update places every time
    if (fetchplacecounter === 0) {
        loadPlaces(latitude, longitude);
    }
    fetchplacecounter++;
    if (fetchplacecounter > 10) {
        fetchplacecounter = 0;
    }
}

function onPlaceTap(feature, layer) {
    layer.on('click', function (e) {
        openPlace(feature);
    });
}

function loadPlaces(lat, long) {
    if (!lockGot) {
        return;
    }
    var url = mkApiUrl('places', 'gs') + "?lat=" + lat + "&long=" + long + "&radius=.5&names=1";
    try {
        $.getJSON(
                url,
                function (data) {
                    if (data.type === 'FeatureCollection') {
                        placeLayer.clearLayers();
                        placemarkers.clearLayers();
                        data.features.forEach(function (item) {
                            item.properties.popupContent = "<span class='marker-popup-text' onclick='openPlace(" + item.properties.osm_id + ")'>" + item.properties.name + "</span>";
                            placeLayer.addData(item);
                        });
                        placemarkers.addLayer(placeLayer);
                    }
                }
        );
    } catch (ex) {
        serverProblemsDialog();
    }
}

function openPlace(feature) {
    $('#main-content').load("screens/place.html", null, function () {
        loadPlace(feature);
        $('#overlay-main').css('display', 'block');
    });
}

/**
 * Hide the loading overlay if everything is loaded, otherwise do nothing
 */
function hideLoading() {
    if (lockGot && gpsaccuracy < requiredaccuracy && $('#loading').css('display') !== 'none') {
        getWeather();
        getTerrain();
        $('#loading').fadeOut('slow', function () {
            $('#loading').css('display', 'none');
            updateStatusBarColor();
        });
    }
}

var updatePosition = function (position) {
    latitude = position.coords.latitude;
    longitude = position.coords.longitude;
    lastgpstime = position.timestamp;
    gpsaccuracy = position.coords.accuracy;
    if (gpsaccuracy > requiredaccuracy) {
        $('#no-lock').css('display', 'block');
    } else {
        $('#no-lock').css('display', 'none');
    }
    mapPos(latitude, longitude);
};

function pingServer() {
    if (lockGot && gpsaccuracy < requiredaccuracy) {
        $.getJSON(mkApiUrl('ping') + "?user=" + username + "&lat=" + latitude + "&long=" + longitude, function (data) {
            if (data.status == "ERROR") {
                localStorage.setItem("no_autologin", "true");
                username = null;
                password = null;
                document.location.href = "index.html";
                navigator.notification.alert("Your session status has changed, and you have been logged out.  \n\nReason: " + data.message, null, "Sign-in Status Changed", "OK");
            }
        });
    }
}

var errorMsgShown = false;
function onError(error) {
    if (!errorMsgShown) {
        var msg = error.message;
        if (msg.toLowerCase().includes("timeout")) {
            msg = "no lock within 15 seconds";
        }
        $('#loading-error').text("Check your device's network and location settings, and ensure a clear view of the sky (" + msg + ").");
        errorMsgShown = true;
    }
}

function popDiagData() {
    navigator.notification.alert("Latitude: " + latitude +
            "\nLongitude: " + longitude +
            "\nAccuracy: " + gpsaccuracy +
            "\nWeather: " + rawWeatherData.temperature + " F, " + rawWeatherData.summary + ", " + rawWeatherData.windSpeed + " mph" +
            "\nTerrain: " + terrainName + " (" + terrainType + ")",
            null,
            "World Info",
            "Close");
}
// Initial GPS position and stuff
navigator.geolocation.getCurrentPosition(updatePosition, onError, {timeout: 15000, enableHighAccuracy: true});
// Update position
setInterval(function () {
    navigator.geolocation.getCurrentPosition(updatePosition, onError, {timeout: 1000, enableHighAccuracy: true});
}, 1000);
// Update places
setInterval(function () {
    loadPlaces(latitude, longitude);
}, 1000 * 15);
// Ping the server with coordinates
setInterval(pingServer, 5000);
// Show error if it's taking too long
setTimeout(function () {
    onError();
}, 15 * 1000);

setTimeout(function () {
    $('#loading-error').text("If you're outside and the settings are OK, something has gone wrong.  Try restarting or reinstalling the app.");
}, 45 * 1000);