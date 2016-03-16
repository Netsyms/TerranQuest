/* global PositionError */

/**
 * Handles GPS and terrain data.
 */

var lockGot = false;
var terrainGot = false;

var latitude = 0.0000;
var longitude = 0.0000;
var lastgpstime = 0;
var gpsaccuracy = 9999;
var terraintypeid = 0;
var map = L.map('map');
var tileurl = "http://tile.stamen.com/terrain/{z}/{x}/{y}.jpg";
map.setZoom(16);
map.dragging.disable();
map.touchZoom.disable();
map.doubleClickZoom.disable();
map.scrollWheelZoom.disable();
map.keyboard.disable();
$(".leaflet-control-zoom").css("visibility", "hidden");
// Disable tap handler, if present.
if (map.tap)
    map.tap.disable();
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
    markerStyle: {},
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
map.addLayer(new L.tileLayer(tileurl, {minZoom: 16, maxZoom: 16}));
//map.setView(new L.LatLng(46, -112), 15);
lc.start();

function mapPos(lat, lon) {
    lockGot = true;
    hideLoading();
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

/**
 * Hide the loading overlay if everything is loaded, otherwise do nothing
 */
function hideLoading() {
    if (lockGot && terrainGot) {
        $('#loading').css('display', 'none');
    }
}

var updatePosition = function (position) {
    latitude = position.coords.latitude;
    longitude = position.coords.longitude;
    lastgpstime = position.timestamp;
    gpsaccuracy = position.coords.accuracy;
    if (gpsaccuracy > 30) {
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
    if (lockGot && gpsaccuracy < 30) {
        $.get(mkApiUrl('ping') + "?user=" + username + "&lat=" + latitude + "&long=" + longitude);
    }
}
;

function onError(error) {
    $('#loading-error').text("GPS lock is taking longer than expected.  Check your device's network and location settings, and ensure a clear view of the sky.");
}

// Initial GPS position and stuff
navigator.geolocation.getCurrentPosition(updateTerrain, onError, {timeout: 10000, enableHighAccuracy: true});
// Update position
setInterval(function () {
    navigator.geolocation.getCurrentPosition(updatePosition, onError, {timeout: 10000, enableHighAccuracy: true});
}, 1000);
// Update position + terrain
setInterval(function () {
    navigator.geolocation.getCurrentPosition(updateTerrain, onError, {timeout: 10000, enableHighAccuracy: true});
}, 1000 * 10);
// Ping the server with coordinates
setInterval(pingServer, 5000);
// Show error if it's taking too long
setTimeout(function () {
    onError();
}, 10000);