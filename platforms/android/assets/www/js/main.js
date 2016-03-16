/*
 * This file loads after JQuery and sets up variables and whatnot.
 */


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

function mkApiUrl(action) {
    return "http://gs.terranquest.net/" + action + ".php";
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

function syncEnergy() {
    //$('.progress-bar').css('width', valeur+'%').attr('aria-valuenow', valeur);
}

/**
 * Function to enable forcing redraw of elements
 * 
 * redraw('#theElement');
 */
function redraw(element) {
    var n = document.createTextNode(' ');
    $(element).append(n);
    setTimeout(function () {
        n.parentNode.removeChild(n)
    }, 0);
}