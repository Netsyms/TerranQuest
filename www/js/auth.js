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

/*
 * Authentication and signup codez
 */

var authOpInProgress = false;

function askLogout() {
    navigator.notification.confirm(
            'Do you really want to logout?', // message
            function (btn) {
                if (btn === 1) {
                    logout();
                }
            },
            'Logout?',
            ['Logout', 'Cancel']
            );
}

function logout() {
    $.getJSON(mkApiUrl('deletesession'), {}, function (data) {
        if (data.status === 'OK') {
            localStorage.setItem("username", '');
            localStorage.setItem("password", '');
            username = null;
            password = null;
            $('#content-zone').load("screens/login.html");
        } else {
            navigator.notification.alert("Server did not properly acknowledge logout.  You might have problems for the next few hours if you switch accounts.", null, "Error", 'Dismiss');
        }
    }).fail(function () {
        navigator.notification.alert("Cannot connect to authentication server.  Check your Internet connection and try again.  If that fails, clear the app data or reinstall TerranQuest.", null, "Error", 'Dismiss');
    });
}

function checkUserHasTeamOpenChooserIfNot(username) {
    $.getJSON(mkApiUrl('getstats'), {
        user: username
    }, function (data) {
        if (data.status === 'OK') {
            if (data.stats.teamid !== null && data.stats.teamid > 0) {
                // We're all good.
                userteamid = data.stats.teamid;
                openscreen("home");
            } else {
                // Open the team intro thingy
                openscreen('chooseteam');
            }
        } else {
            serverProblemsDialog("Got a bad answer from the server.  Restart the app and try again.");
        }
    }).fail(function () {
        serverProblemsDialog("Cannot get player data from server.");
    });
}

function loginOK() {
    username = $('#usernameBox').val().toLowerCase();
    password = $('#passwordBox').val();
    localStorage.setItem("username", username);
    localStorage.setItem("password", password);
    navigator.splashscreen.hide();
    checkUserHasTeamOpenChooserIfNot(username);
}

function dosignup() {
    if (authOpInProgress) {
        return;
    }
    authOpInProgress = true;
    $('#errorbase').hide();
    $('#signupBtn').html('<i class="fa fa-cog fa-spin fa-fw"></i> Please wait...');
    $('#signupBtn').attr('disabled', true);
    if ($('#usernameBox').val() === "") {
        $('#errormsg').text("Error:  Missing username.");
        $('#errorbase').css('display', 'block');
        $('#signupBtn').html('<i class="fa fa-user-plus"></i> Sign Up');
        $('#signupBtn').attr('disabled', false);
        authOpInProgress = false;
        return;
    }
    if ($('#passwordBox').val() !== $('#passwordBox2').val()) {
        $('#errormsg').text("Error:  Passwords do not match.");
        $('#errorbase').css('display', 'block');
        $('#signupBtn').html('<i class="fa fa-user-plus"></i> Sign Up');
        $('#signupBtn').attr('disabled', false);
        authOpInProgress = false;
        return;
    }
    $.post("https://sso.netsyms.com/api/adduser.php",
            {
                user: $('#usernameBox').val(),
                pass: $('#passwordBox').val(),
                name: $('#nameBox').val(),
                email: $('#emailBox').val()
            },
            function (data) {
                if (data === 'OK') {
                    $.post(mkApiUrl('login'), {
                        user: $('#usernameBox').val(),
                        pass: $('#passwordBox').val(),
                    }, function (out) {
                        if (out.status === 'OK') {
                            loginOK();
                        } else {
                            navigator.notification.alert("You've signed up successfully, but we can't log you in.  Restart the app and try again.", null, "Error", 'Dismiss');
                            authOpInProgress = false;
                        }
                    }).fail(function (err) {
                        navigator.notification.alert("You've signed up successfully, but we can't log you in.  Restart the app and try again.", null, "Error", 'Dismiss');
                        authOpInProgress = false;
                    });
                } else {
                    $('#signupBtn').html('<i class="fa fa-user-plus"></i> Sign Up');
                    $('#signupBtn').attr('disabled', false);
                    $('#errormsg').text("Error: " + data);
                    $('#errorbase').css('display', 'block');
                }
                authOpInProgress = false;
            }).fail(function () {
        $('#signupBtn').html('<i class="fa fa-user-plus"></i> Sign Up');
        $('#signupBtn').attr('disabled', false);
        $('#errormsg').text("Error: Network failure.");
        $('#errorbase').css('display', 'block');
        authOpInProgress = false;
    });
}

function dologin() {
    if (authOpInProgress) {
        return;
    }
    authOpInProgress = true;
    $('#errorbase').hide();
    if ($('#usernameBox').val() === "") {
        $('#errormsg').text("Error:  Missing username.");
        $('#errorbase').css('display', 'block');
        $('#loginBtn').html('<i class="fa fa-sign-in"></i> Login');
        $('#loginBtn').attr('disabled', false);
        authOpInProgress = false;
        return;
    }
    $('#loginBtn').attr('disabled', true);
    $('#loginBtn').html('<i class="fa fa-cog fa-spin fa-fw"></i> Logging in...');

    $.post(mkApiUrl("login"),
            {
                user: $('#usernameBox').val(),
                pass: $('#passwordBox').val()
            },
            function (data) {
                if (data.status === 'OK') {
                    loginOK();
                } else {
                    $('#loginBtn').html('<i class="fa fa-sign-in"></i> Login');
                    $('#loginBtn').attr('disabled', false);
                    $('#errormsg').text("Error: " + data.message);
                    $('#errorbase').css('display', 'block');
                    $('#loading').css('display', 'none');
                }
                authOpInProgress = false;
            }, "json").fail(function () {
        $('#loginBtn').html('<i class="fa fa-sign-in"></i> Login');
        $('#loginBtn').attr('disabled', false);
        $('#errormsg').text("Error: Cannot connect to server.");
        $('#errorbase').css('display', 'block');
        $('#loading').css('display', 'none');
        authOpInProgress = false;
        serverProblemsDialog("Cannot connect to server.");
    });
}

