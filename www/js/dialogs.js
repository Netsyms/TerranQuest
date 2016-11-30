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

function showSuccessMessage(text) {
    $('#hugetimessign').css('display', 'none');
    $('#hugecheckmark').css('display', 'block');
    $('#alertmessagecontent').html(text);
    $('#alertmessagebox').css('display', 'block');
}

function showErrorMessage(text) {
    $('#hugetimessign').css('display', 'block');
    $('#hugecheckmark').css('display', 'none');
    $('#alertmessagecontent').html(text);
    $('#alertmessagebox').css('display', 'block');
}

function dismissMessageBox() {
    $('#alertmessagebox').css('display', 'none');
}

function serverProblemsDialog(errmsg) {
    StatusBar.backgroundColorByHexString("#324150");
    window.location = "servererror.html?errmsg=" + errmsg;
}

function clientProblemsDialog(errmsg) {
    StatusBar.backgroundColorByHexString("#324150");
    window.location = "clienterror.html?errmsg=" + errmsg;
}