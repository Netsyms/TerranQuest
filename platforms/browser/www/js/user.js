//////////////////////////////////////////////
//  Profile, stats, and chat stuff
//////////////////////////////////////////////


/*
 * Handles general server communication.
 */

/**
 * Syncs the user's stats with the server and calls refreshStats().
 */
function syncStats() {
    $.getJSON(mkApiUrl('getstats'), {
        user: username
    }, function (data) {
        if (data.status === 'OK') {
            maxenergy = data.stats.maxenergy;
            energy = data.stats.energy;
            level = data.stats.level;
            refreshStats();
        }
    });
}

/**
 * Display the current stats on the home screen.
 */
function refreshStats() {
    energypercent = (energy * 1.0 / maxenergy * 1.0) * 100.0;
    $('#energybar').css('width', String(energypercent) + '%');
}

function getChat() {
    if (lockGot) {
        $.getJSON(mkApiUrl('chat', 'cs'), {
            lat: latitude,
            long: longitude
        }, function (data) {
            data = sortResults(data, 'time', true);
            var content = "";
            data.forEach(function (msg) {
                content += "<span class='chat-username' onclick='openProfile(\"" + msg.username + "\");'>" + msg.username + "</span> " + msg.message + "<br />";
            });
            $('#chatmsgs').html(content);
        });
    }
}


syncStats();
setInterval(function () {
    syncStats();
}, 10 * 1000);
setInterval(function () {
    getChat();
}, 2000);
// Send chat messages
$("#chatsendform").submit(function (event) {
    message = $('#chatbox-input').val();
    if (message !== '') {
        $.post(mkApiUrl('chat', 'cs'), {
            user: username,
            lat: latitude,
            long: longitude,
            msg: message
        }, function (data) {
            if (data.status === 'OK') {
                $('#chatbox-input').val("");
                $("#chatmsgs").animate({scrollTop: $('#chatmsgs').prop("scrollHeight")}, 1000);
            }
        }, "json");
    }
    event.preventDefault();
    return false;
});
function toggleChat() {
    if ($('#chatmsgs').css('display') === 'none') {
        openChat();
    } else {
        closeChat();
    }
}

function closeChat() {
    $('#chatmsgs').css('display', 'none');
    $('#chatbox').css('height', 'auto');
}

function openChat() {
    $('#chatbox').css('height', '50%');
    $('#chatmsgs').css('display', 'block');
    $("#chatmsgs").animate({scrollTop: $('#chatmsgs').prop("scrollHeight")}, 1000);
}

function openProfile(user) {
    user = typeof user !== 'undefined' ? user : username;
    $('#main-content').load("screens/profile.html", null, function (x) {
        $('#overlay-main').css('display', 'block');
        loadProfile(user);
    });
}

function openRules() {
    openmodal('rules', '#rules-modal');
}

function openIntro() {
    openmodal('intro', '#intro-modal');
}

function openMenu(topage) {
    topage = typeof topage !== 'undefined' ? topage : "";
    $('#main-content').load("screens/menu.html", null, function (x) {
        $('#overlay-main').css('display', 'block');
        if (topage !== '') {
            $('#' + topage + '-tab').tab('show');
        }
    });
}
