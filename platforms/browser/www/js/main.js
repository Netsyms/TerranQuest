// Constants
username = "";
password = "";
energy = 100;
maxenergy = 100;
level = 1;
userteamid = 0;

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

function serverProblemsDialog() {
    openscreen("servererror");
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
                        $.getJSON(mkApiUrl('code2item', 'gs'), {
                            code: result.text
                        }, function (data) {
                            if (data.status === 'OK') {
                                navigator.notification.alert("Found one " + data.message, null, "Found an item!", 'OK');
                            } else {
                                navigator.notification.alert(data.message, null, "Huh?", 'OK');
                            }
                        }).fail(function () {
                            navigator.notification.alert("Nothing happened!", null, "Huh?", 'OK');
                        });
                        //navigator.notification.alert("Scanned code: " + result.text, null, "OK", 'Dismiss');
                    }
                },
                function (error) {
                    navigator.notification.alert("Scanning failed: " + error, null, "Error", 'Dismiss');
                },
                {
                    "showFlipCameraButton": true,
                    "prompt": "Scan a barcode to discover an item!"
                }
        );
    } catch (ex) {
        navigator.notification.alert(ex.message, null, "Error", 'Dismiss');
    }
}

function sortResults(array, prop, asc) {
    array = array.sort(function (a, b) {
        if (asc)
            return (a[prop] > b[prop]) ? 1 : ((a[prop] < b[prop]) ? -1 : 0);
        else
            return (b[prop] > a[prop]) ? 1 : ((b[prop] < a[prop]) ? -1 : 0);
    });
    return array;
}

//////////////////////////////////////////////
//  Other things
//////////////////////////////////////////////

function closeMain() {
    $('#overlay-main').slideDown(100, function () {
        $('#overlay-main').css('display', 'none');
        $('#main-content').html("");
    });
}

function getTeamInfoFromId(id) {
    id = id + "";
    var team_string = "None";
    var team_color = "FFFFFF";
    switch (id) {
        case "1":
            team_string = "Water";
            team_color = "00BFFF";
            break;
        case "2":
            team_string = "Fire";
            team_color = "FF4000";
            break;
        case "3":
            team_string = "Earth";
            team_color = "D1A000";
            break;
        case "4":
            team_string = "Wind";
            team_color = "96FFFF";
            break;
        case "5":
            team_string = "Light";
            team_color = "FFFF96";
            break;
        case "6":
            team_string = "Dark";
            team_color = "ABABAB";
            break;
        default:
            team_string = "None";
            team_color = "FFFFFF";
            break;
    }
    return {'name': team_string, 'color': team_color};
}

function getTeamNameFromId(id) {
    return getTeamInfoFromId(id)['name'];
}

function getTeamColorFromId(id) {
    return getTeamInfoFromId(id)['color'];
}

// Handle back button to close things
document.addEventListener("backbutton", function (event) {
    if ($('#overlay-main').css('display') !== 'none') {
        closeMain();
    } else if ($('#chatmsgs').css('display') !== 'none') {
        toggleChat();
    }
}, false);
// Show the rules
if (localStorage.getItem("seenintro") !== 'yes') {
    openIntro();
    localStorage.setItem("seenintro", 'yes');
}