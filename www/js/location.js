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
//  GPS and terrain stuff
//////////////////////////////////////////////

/**
 * Handles GPS and terrain data.
 */

// Globals
var lockGot = false;
var terrainGot = false;
var latitude = 0.0000;
var longitude = 0.0000;
var gpsaccuracy = 9999;
var requiredaccuracy = 40;
// End Globals

var fetchplacecounter = 0;
var lastgpstime = 0;
var terraintypeid = 0;
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
    showCoverageOnHover: false,
    zoomToBoundsOnClick: false
});
placemarkers.addLayer(placeLayer);
map.addLayer(placemarkers);

var lc = L.control.locate({
    position: 'topleft', // set the location of the control
    layer: undefined, // use your own layer for the location marker, creates a new layer by default
    drawCircle: false, // controls whether a circle is drawn that shows the uncertainty about the location
    follow: true, // follow the user's location
    setView: true, // automatically sets the map view to the user's location, enabled if `follow` is true
    keepCurrentZoomLevel: true, // keep the current map zoom level when displaying the user's location. (if `false`, use maxZoom)
    stopFollowingOnDrag: false, // stop following when the map is dragged if `follow` is true (deprecated, see below)
    remainActive: true, // if true locate control remains active on click even if the user's location is in view.
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
    //map.setView(new L.LatLng(lat, lon), 16, {animate: true});
    //map.panTo(new L.LatLng(lat, lon));
    //map.invalidateSize();
    //redraw('.leaflet-map-pane');
//    $('.leaflet-map-plane').css('height', '90%');
//    setTimeout(function () {
//        $('#map').css('width', '100%');
//        $('#map').css('height', '100%');
//    }, 100);
}

function onPlaceTap(feature, layer) {
    layer.on('click', function (e) {
        openPlace(feature);
    });
}

function loadPlaces(lat, long) {
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
    if (lockGot && terrainGot && gpsaccuracy < requiredaccuracy && $('#loading').css('display') !== 'none') {
        getWeather();
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
var updateTerrain = function (position) {
    latitude = position.coords.latitude;
    longitude = position.coords.longitude;
    lastgpstime = position.timestamp;
    gpsaccuracy = position.coords.accuracy;
    var rasterurl = "http://earth.apis.netsyms.net/terrain.php?format=json&lat="
            + latitude + "&long=" + longitude;
    $.get(rasterurl, function (data) {
        if (data.status === 'OK') {
            terraintypeid = data.typeid;
            terraintypename = data.typename;
            $('#terrain-image').attr('src', 'assets/terrain/' + terraintypeid + '.png');
            terrainGot = true;
            hideLoading();
        }
    }, "json").fail(function (err) {
        $('#terrain-image').attr('src', 'assets/terrain/0.png');
    });
};
function pingServer() {
    if (lockGot && gpsaccuracy < requiredaccuracy) {
        $.get(mkApiUrl('ping') + "?user=" + username + "&lat=" + latitude + "&long=" + longitude);
    }
}

function onError(error) {
    $('#loading-error').text("Check your device's network and location settings, and ensure a clear view of the sky.");
}

function popGPS() {
    navigator.notification.alert("Latitude: " + latitude +
            "\nLongitude: " + longitude +
            "\nAccuracy: " + gpsaccuracy +
            "\nTerrain: " + terraintypename + " (" + terraintypeid + ")",
            null,
            "GPS Information",
            "Close");
}
$('#terrain-image').click(function () {
    popGPS();
});
// Initial GPS position and stuff
navigator.geolocation.getCurrentPosition(updateTerrain, onError, {timeout: 10000, enableHighAccuracy: true});
// Update position
setInterval(function () {
    navigator.geolocation.getCurrentPosition(updatePosition, onError, {timeout: 10000, enableHighAccuracy: true});
}, 1000);
// Update position + terrain
setInterval(function () {
    navigator.geolocation.getCurrentPosition(updateTerrain, onError, {timeout: 10000, enableHighAccuracy: true});
    loadPlaces(latitude, longitude);
}, 1000 * 20);
// Ping the server with coordinates
setInterval(pingServer, 5000);
// Show error if it's taking too long
setTimeout(function () {
    onError();
}, 15 * 1000);