/*
 * Handles general server communication.
 */

/**
 * Syncs the user's stats with the server and calls refreshStats().
 */
function syncStats() {
    $.getJSON(mkApiUrl('getstats') + "?user=" + username, null, function (data) {
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


syncStats();
setInterval(function () {
    syncStats();
}, 10 * 1000);