/* 
 * Copyright 2016 Netsyms Technologies.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


var AUDIO_WAIT_SECONDS = 10;
var audio_stay_stopped = false;
var audio_doneplaying = true;
var audio_isplaying = false;
var audio;

var MUSIC_DIR = getWwwFolderPath() + "assets/audio/";

function queuesong(song) {
    if (audio_isplaying) {
        return;
    }
    audio = new Media(MUSIC_DIR + song, null, null, function (status) {
        if ((status == Media.MEDIA_NONE || status == Media.MEDIA_STOPPED) && !audio_stay_stopped) {
            audio_doneplaying = true;
            audio_isplaying = false;
            audio.release();
            setTimeout(playAudio, AUDIO_WAIT_SECONDS * 1000);
        }
    });
    audio_isplaying = true;
}

function playAudio() {
    if (localStorage.getItem("music") === "mute") {
        return;
    }
    // If something is going on, come back in 10 seconds.
    if (audio_doneplaying && audio_isplaying) {
        setTimeout(playAudio, 10 * 1000);
        return;
    }
    if (audio_doneplaying) {
        if (rawWeatherData.icon == "snow" || rawWeatherData.icon == "fog") {
            queuesong("Sisters of Snow Assent.mp3");
        } else if (rawWeatherData.icon == "rain" || terrainType == 0) {
            queuesong("We Dream of Booty.mp3");
        } else if (terrainType >= 1 && terrainType <= 5) {
            queuesong("Enter the Woods.mp3");
        } else {
            queuesong("Heroes March.mp3");
        }
    }
    audio.play({playAudioWhenScreenIsLocked: false});
}

document.addEventListener("pause", function () {
    audio.pause();
    audio_doneplaying = false;
    audio_stay_stopped = true;
});
document.addEventListener("resume", function () {
    audio_stay_stopped = false;
    playAudio();
});