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

// Important Globals
username = "";
password = "";
energy = 100;
maxenergy = 100;
level = 1;
userteamid = 0;
MUNZEE_CLIENT_ID = '616cecc70e17f4a3cb64146dce2d33f5';
MUNZEE_REDIRECT = 'http://gs.terranquest.net/munzee.php';
CODE_SCAN_COOLDOWN_SECONDS = 15; // Also change in CSS (.cooldown-fade-anim)

USER_LANGUAGE = "en-US";

currentscreen = "";
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
        }, "No network", 'OK');
        clientProblemsDialog("You need an Internet connection to continue.");
        return;
    }
    $.getJSON(mkApiUrl("minclientversion"), function (data) {
        if (data.status == "OK") {
            if (compareVersions(window.cordova.plugins.version.getAppVersion(), data.version) < 0) {
                navigator.notification.alert("Your game client is too old.  You must update the app before playing.", function () {
                    navigator.app.exitApp();
                }, "Outdated app", 'OK');
                clientProblemsDialog("Your game client is too old.  You must update the app before playing.");
            }
        }
    });
    setLocale();
}

function setLocale() {
    navigator.globalization.getPreferredLanguage(
            function (language) {
                USER_LANGUAGE = language.value;
            },
            function () {}
    );
}

// Depending on the device, a few examples are:
//   - "Android"
//   - "BlackBerry"
//   - "iOS"
//   - "webOS"
//   - "WinCE"
//   - "Tizen"

var DEVICE_ANDROID = 0;
var DEVICE_GOOGLEPLAY = 1;
var DEVICE_IOS = 2;
var DEVICE_WEB = 3;
var DEVICE_WINDOWS_PHONE = 5;
var DEVICE_WINDOWS = 6;
var DEVICE_OTHER = 10;

function getPlatform() {
    var devicePlatform = device.platform;
    switch (devicePlatform) {
        case 'Android':
            return DEVICE_ANDROID;
        case 'iOS':
            return DEVICE_IOS;
        case 'WinCE':
            return DEVICE_WINDOWS_PHONE;
        case 'Win32NT':
            return DEVICE_WINDOWS_PHONE;
        case 'Windows':
            return DEVICE_WINDOWS;
        case 'browser':
            return DEVICE_WEB;
        default:
            return DEVICE_OTHER;
    }
}

function getDeviceVersion() {
    return device.version;
}

/**
 * Compare two version strings.
 * http://stackoverflow.com/a/16187766/2534036
 * @param {string} a
 * @param {string} b
 * @returns a number < 0 if a < b, a number > 0 if a > b, 0 if a = b 
 */
function compareVersions(a, b) {
    var i, diff;
    var regExStrip0 = /(\.0+)+$/;
    var segmentsA = a.replace(regExStrip0, '').split('.');
    var segmentsB = b.replace(regExStrip0, '').split('.');
    var l = Math.min(segmentsA.length, segmentsB.length);

    for (i = 0; i < l; i++) {
        diff = parseInt(segmentsA[i], 10) - parseInt(segmentsB[i], 10);
        if (diff) {
            return diff;
        }
    }
    return segmentsA.length - segmentsB.length;
}

function mkApiUrl(action, server) {
    if (server === 'cs') {
        var chatserverurl = "http://gs.terranquest.net/";
        if (localStorage.getItem("chatserv") !== null && localStorage.getItem("chatserv") !== '') {
            chatserverurl = localStorage.getItem("chatserv");
        }
        return chatserverurl + action + ".php";
    } else {
        var gameserverurl = "http://gs.terranquest.net/";
        if (localStorage.getItem("gameserv") !== null && localStorage.getItem("gameserv") !== '') {
            gameserverurl = localStorage.getItem("gameserv");
        }
        return gameserverurl + action + ".php";
    }
}

/**
 * Update the status bar color depending on context.
 * @returns {undefined}
 */
function updateStatusBarColor() {
    if (currentscreen == 'munzeelink') {
        StatusBar.backgroundColorByHexString("#009444");
        return;
    }
    if (currentscreen == 'login') {
        if ($('#loading').css('display') == 'none') {
            StatusBar.backgroundColorByHexString("#060606");
        } else {
            StatusBar.backgroundColorByHexString("#324150");
        }
        return;
    }
    if (currentscreen == 'chooseteam' || currentscreen == 'signup') {
        StatusBar.backgroundColorByHexString("#060606");
        return;
    }
    if (currentscreen == 'home') {
        if ($('#loading').css('display') != 'none') {
            StatusBar.backgroundColorByHexString("#324150");
        } else {
            if ($('#overlay-main').css('display') == 'block') {
                StatusBar.backgroundColorByHexString("#060606");
            } else {
                StatusBar.backgroundColorByHexString("#008000");
            }
        }
        return;
    }
    StatusBar.backgroundColorByHexString("#324150");
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
    currentscreen = screenname;
    updateStatusBarColor();
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

var scanCodeEnabled = true;

function startCooldown() {
    scanCodeEnabled = false;
    // don't do animation on old stuff
    if (getPlatform() === DEVICE_ANDROID && compareVersions(getDeviceVersion(), "4.4") < 0) {
        fallback_anim('#codescanbtn', 0, CODE_SCAN_COOLDOWN_SECONDS, 1000);
    } else {
        $('#codescanbtn').addClass('cooldown-fade-anim');
    }
    setTimeout(function () {
        endCooldown();
    }, CODE_SCAN_COOLDOWN_SECONDS * 1000);
}

function fallback_anim(selector, currstep, maxstep, interval) {
    var cval = Math.round((currstep / maxstep) * 255);
    $(selector).css('background-color', 'rgba(' + cval + ',' + cval + ',' + cval + ',.8)');
    if (currstep < maxstep) {
        setTimeout(function () {
            fallback_anim(selector, currstep + 1, maxstep, interval);
        }, intervalsecs);
    }
}

function endCooldown() {
    scanCodeEnabled = true;
    $('#codescanbtn').removeClass('cooldown-fade-anim');
    $('#codescanbtn').css('background-color', 'rgba(255,255,255,.8)');
}

function scanCode() {
    // If code scanning disabled (cooldown, etc)
    if (!scanCodeEnabled) {
        return;
    }
    try {
        cordova.plugins.barcodeScanner.scan(
                function (result) {
                    if (!result.cancelled) {
                        startCooldown();
                        $.getJSON(mkApiUrl('code2item', 'gs'), {
                            code: result.text,
                            latitude: latitude,
                            longitude: longitude,
                            accuracy: gpsaccuracy
                        }, function (data) {
                            if (data.status === 'OK') {
                                if (data.messages.length >= 2) {
                                    showFoundBox2(data.messages[0].title, data.messages[0].text, data.messages[1].title, data.messages[1].text);
                                } else {
                                    showFoundBox(data.messages[0].title, data.messages[0].text);
                                }
                            } else {
                                endCooldown();
                                showFoundBox("Huh?", data.message);
                            }
                        }).fail(function () {
                            endCooldown();
                            showFoundBox("Huh?", "Nothing happened!");
                            //navigator.notification.alert("Nothing happened!", null, "Huh?", 'OK');
                        });
                        //navigator.notification.alert("Scanned code: " + result.text, null, "OK", 'Dismiss');
                    }
                },
                function (error) {
                    endCooldown();
                    navigator.notification.alert("Scanning failed: " + error, null, "Error", 'Dismiss');
                },
                {
                    "showFlipCameraButton": true,
                    "prompt": "Scan a barcode to discover an item!"
                }
        );
    } catch (ex) {
        scanCodeEnabled = true;
        $('#codescanbtn').removeClass('cooldown-fade-anim');
        navigator.notification.alert(ex.message, null, "Error", 'Dismiss');
    }
}

function sortResults(array, prop, asc) {
    array = array.sort(function (a, b) {
        if (asc) {
            return (a[prop] > b[prop]) ? 1 : ((a[prop] < b[prop]) ? -1 : 0);
        } else {
            return (b[prop] > a[prop]) ? 1 : ((b[prop] < a[prop]) ? -1 : 0);
        }
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
        updateStatusBarColor();
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

/**
 * Get the actual path to the www folder.  Includes trailing slash.
 * http://stackoverflow.com/a/35782322/2534036
 */
function getWwwFolderPath() {
    var path = window.location.pathname;
    var sizefilename = path.length - (path.lastIndexOf("/") + 1);
    path = path.substr(path, path.length - sizefilename);
    return path;
}
;

// Handle back button to close things
document.addEventListener("backbutton", function (event) {
    if (currentscreen == "munzeelink") {
        openscreen("home");
    }
    if ($('#overlay-main').css('display') !== 'none') {
        closeMain();
    } else if ($('#chatmsgs').css('display') !== 'none') {
        toggleChat();
    }
}, false);

/*
 * Konami-JS ~ 
 * :: Now with support for touch events and multiple instances for 
 * :: those situations that call for multiple easter eggs!
 * Code: https://github.com/snaptortoise/konami-js
 * Examples: http://www.snaptortoise.com/konami-js
 * Copyright (c) 2009 George Mandis (georgemandis.com, snaptortoise.com)
 * Version: 1.4.6 (3/2/2016)
 * Licensed under the MIT License (http://opensource.org/licenses/MIT)
 * Tested in: Safari 4+, Google Chrome 4+, Firefox 3+, IE7+, Mobile Safari 2.2.1 and Dolphin Browser
 */

var Konami = function (callback) {
    var konami = {
        addEvent: function (obj, type, fn, ref_obj) {
            if (obj.addEventListener)
                obj.addEventListener(type, fn, false);
            else if (obj.attachEvent) {
                // IE
                obj["e" + type + fn] = fn;
                obj[type + fn] = function () {
                    obj["e" + type + fn](window.event, ref_obj);
                }
                obj.attachEvent("on" + type, obj[type + fn]);
            }
        },
        input: "",
        pattern: "38384040373937396665",
        load: function (link) {
            this.addEvent(document, "keydown", function (e, ref_obj) {
                if (ref_obj)
                    konami = ref_obj; // IE
                konami.input += e ? e.keyCode : event.keyCode;
                if (konami.input.length > konami.pattern.length)
                    konami.input = konami.input.substr((konami.input.length - konami.pattern.length));
                if (konami.input == konami.pattern) {
                    konami.code(link);
                    konami.input = "";
                    e.preventDefault();
                    return false;
                }
            }, this);
            this.iphone.load(link);
        },
        code: function (link) {
            window.location = link
        },
        iphone: {
            start_x: 0,
            start_y: 0,
            stop_x: 0,
            stop_y: 0,
            tap: false,
            capture: false,
            orig_keys: "",
            keys: ["UP", "UP", "DOWN", "DOWN", "LEFT", "RIGHT", "LEFT", "RIGHT", "TAP", "TAP"],
            code: function (link) {
                konami.code(link);
            },
            load: function (link) {
                this.orig_keys = this.keys;
                konami.addEvent(document, "touchmove", function (e) {
                    if (e.touches.length == 1 && konami.iphone.capture == true) {
                        var touch = e.touches[0];
                        konami.iphone.stop_x = touch.pageX;
                        konami.iphone.stop_y = touch.pageY;
                        konami.iphone.tap = false;
                        konami.iphone.capture = false;
                        konami.iphone.check_direction();
                    }
                });
                konami.addEvent(document, "touchend", function (evt) {
                    if (konami.iphone.tap == true)
                        konami.iphone.check_direction(link);
                }, false);
                konami.addEvent(document, "touchstart", function (evt) {
                    konami.iphone.start_x = evt.changedTouches[0].pageX;
                    konami.iphone.start_y = evt.changedTouches[0].pageY;
                    konami.iphone.tap = true;
                    konami.iphone.capture = true;
                });
            },
            check_direction: function (link) {
                x_magnitude = Math.abs(this.start_x - this.stop_x);
                y_magnitude = Math.abs(this.start_y - this.stop_y);
                x = ((this.start_x - this.stop_x) < 0) ? "RIGHT" : "LEFT";
                y = ((this.start_y - this.stop_y) < 0) ? "DOWN" : "UP";
                result = (x_magnitude > y_magnitude) ? x : y;
                result = (this.tap == true) ? "TAP" : result;

                if (result == this.keys[0])
                    this.keys = this.keys.slice(1, this.keys.length);
                if (this.keys.length == 0) {
                    this.keys = this.orig_keys;
                    this.code(link);
                }
            }
        }
    }

    typeof callback === "string" && konami.load(callback);
    if (typeof callback === "function") {
        konami.code = callback;
        konami.load();
    }

    return konami;
};

var konamicounter = 0;
var dev_console = new Konami(function () {
    konamicounter++;
    if (konamicounter > 2) {
        alert(eval(prompt("Enter console command: ", "$(\"#\")")));
    }
});

/**
 * Cancel all timeouts and intervals that may or may not exist.
 * 
 * http://stackoverflow.com/a/8345814/2534036
 */
function forceCancelAllTimers() {
    var highestTimeoutId = setTimeout(";");
    for (var i = 0; i < highestTimeoutId; i++) {
        clearTimeout(i);
    }
}