// Constants
username = "";
password = "";
energy = 100;
maxenergy = 100;
level = 1;

/*
 * Runs when the app opens
 */
$(document).ready(function () {
    document.addEventListener('deviceready', onDeviceReady, false);
});

function onDeviceReady() {
    openscreen("login");
    if (navigator.network.connection.type === Connection.NONE) {
        navigator.notification.alert("You need an Internet connection to continue.", function () {
            navigator.app.exitApp();
        }, "No network", 'Dismiss');
    }
}

function mkApiUrl(action, server) {
    server = typeof server !== 'undefined' ? server : "gs";
    return "http://" + server + ".terranquest.net/" + action + ".php";
    //return "config/" + action + ".json";
}

/**
 * Switches the app to the given screen.
 * @param {String} screenname The name of the screen to show.
 * @param {String} effect FADE, SLIDE, or nothing
 * @returns {undefined}
 */
function openscreen(screenname, effect) {
    if (effect === 'FADE') {
        $('#content-zone').fadeOut('slow', function () {
            $('#content-zone').load("screens/" + screenname + ".html", function () {
                $('#content-zone').fadeIn('slow');
            });
        });
    } else if (effect === 'SLIDE') {
        $('#content-zone').slideToggle('400', function () {
            $('#content-zone').load("screens/" + screenname + ".html", function () {
                $('#content-zone').slideToggle('400');
            });
        });
    } else {
        $('#content-zone').load("screens/" + screenname + ".html");
    }
}

/**
 * Opens a modal dialog over the top of everything else.
 * @param {String} filename screens/[filename].html
 * @param {String} modalselector [#id-of-the-modal]
 * @returns {undefined}
 */
function openmodal(filename, modalselector) {
    $('#modal-load-box').load("screens/" + filename + ".html", null, function (x) {
        $(modalselector).css('z-index', 9999999);
        $(modalselector).modal('show');
    });
}

/**
 * Close a modal (see openmodal)
 * @param {String} modalselector
 * @returns {undefined}
 */
function closemodal(modalselector) {
    $(modalselector).modal(hide);
}

function scanCode() {
    try {
        cordova.plugins.barcodeScanner.scan(
                function (result) {
                    if (!result.cancelled) {
                        navigator.notification.alert("Scanned code: " + result.text, null, "OK", 'Dismiss');
                    }
                },
                function (error) {
                    navigator.notification.alert("Scanning failed: " + error, null, "Error", 'Dismiss');
                }
        );
    } catch (ex) {
        alert(ex.message);
    }
}

function sortResults(array, prop, asc) {
    array = array.sort(function(a, b) {
        if (asc) return (a[prop] > b[prop]) ? 1 : ((a[prop] < b[prop]) ? -1 : 0);
        else return (b[prop] > a[prop]) ? 1 : ((b[prop] < a[prop]) ? -1 : 0);
    });
    return array;
}