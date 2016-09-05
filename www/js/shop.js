/* 
 TerranQuest - Augmented Reality fantasy game
 Copyright 2016 Netsyms Technologies
 
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
 
 http://www.apache.org/licenses/LICENSE-2.0
 
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */


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

function buycoins(productId) {
    if (getPlatform() == DEVICE_ANDROID) {
        inAppPurchase
                .buy(productId)
                .then(function (data) {
                    console.log(JSON.stringify(data));
                    $.getJSON(mkApiUrl('processiap', 'gs'), {
                        os: 'android',
                        data: data.receipt,
                        signature: data.signature,
                        id: productId
                    }, function (result) {
                        if (result.status == 'OK') {
                            return inAppPurchase.consume(data.type, data.receipt, data.signature);
                        } else {
                            showShopMessage("Error: " + result.message, true);
                        }
                    }).fail(function () {
                        showShopMessage("Error: Lost connection to TerranQuest servers.  If your purchase does not appear within a few hours, contact support@netsyms.com.", true);
                    });
                })
                .then(function () {
                    loadstorefront();
                    showShopMessage("Thanks for your purchase!", true);
                })
                .catch(function (err) {
                    console.log("Error: " + err.message);
                    showShopMessage("Error: " + err.message, true);
                });

    } else {
        showShopMessage("Store not available on your device.  Please go to terranquest.net to purchase coins.", true);
    }
}

function showShopMessage(msg, iserror) {
    if (iserror) {
        $('#hugetimessign').css('display', 'block');
        $('#hugecheckmark').css('display', 'none');
    } else {
        $('#hugetimessign').css('display', 'none');
        $('#hugecheckmark').css('display', 'block');
    }
    $('#shopmessagecontent').text(msg);
    $('#shopmessage').css('display', 'block');
}

function buyitem(id, cost) {
    $('#shopitem-' + id).prop('onclick', null).off('click');
    $.getJSON(mkApiUrl('buyitem', 'gs'), {
        merchid: id,
        cost: cost
    }, function (data) {
        if (data.status == 'OK') {
            showShopMessage(data.message, false);
        } else {
            showShopMessage(data.message, true);
        }
        loadstorefront();
    });
}

function getmerchhtmlfromjson(item) {
    var itemhtml = "\
        <div class='list-group-item shop-item' id='shopitem-" + item.merchid + "'>\
            <h4 class='itemname'>" + item.title + "</h4>\
            <p class='itemdesc'>" + item.desc + "</p>";
    itemhtml += "<span class='btn btn-success' onclick=\"buyitem('" + item.merchid + "', " + item.cost + ")\">\
                            Buy Item (" + item.cost + " coins)\
                         </span>\
        </div>";
    return itemhtml;
}

function getcoinhtmlfromjson(coin) {
    var coinhtml = "\
        <div class='list-group-item shop-item' id='coinitem-" + coin.merchid + "'>\
            <h4 class='itemname'>" + coin.display + " (" + coin.coins + ")</h4>";
    coinhtml += "<span class='btn btn-success' onclick=\"buycoins('" + coin.merchid + "', " + coin.cost_usd + ")\">\
                            Buy Coins ($" + coin.cost_usd + ")\
                         </span>\
        </div>";
    return coinhtml;
}

function setcoinhtmlfromiap(coinsjson) {
    var prodIds = [];
    coinsjson.forEach(function (item) {
        prodIds.push(item.merchid);
    });
    var coinsHtml = "";
    inAppPurchase.getProducts(prodIds)
            .then(function (products) {
                console.log(products);
                products.forEach(function (prod) {
                    coinsHtml += ""
                            + "<div class='list-group-item shop-item' id='coinitem-" + prod.productId + "'>"
                            + "<h4 class='itemname'>" + prod.title.replace(" (TerranQuest)", "") + "</h4>"
                            + "<p class='itemdesc'>" + prod.description + "</p>"
                            + "<span class='btn btn-success' onclick=\"buycoins('" + prod.productId + "')\">"
                            + "Buy Coins (" + prod.price + ")"
                            + "</span>"
                            + "</div>";
                });
                $('#coin-list').html(coinsHtml);
                /*
                 [{ productId: 'com.yourapp.prod1', 'title': '...', description: '...', price: '...' }, ...]
                 */
            })
            .catch(function (err) {
                console.log(err.message);
                coinsHtml = getcoinhtmlfromjson(coinsjson);
                $('#coin-list').html(coinsHtml);
            });
}

function loadstorefront() {
    $.getJSON(mkApiUrl('shopitems'), function (data) {
        var content = "";
        if (data.status == 'OK') {
            var items = data.items;
            var coins = data.coins;
            items.forEach(function (item) {
                content += getmerchhtmlfromjson(item);
            });
            setcoinhtmlfromiap(coins);
            $('#coinbalance').text(data.balance);
        } else {
            content = "<div class='list-group-item'>An error occurred.</div>";
            coincode = "<div class='list-group-item'>An error occurred.</div>";
        }
        $('#shop-list').html(content);
    });
    loadinventory(); // Make sure purchases stay in sync
    // Put it last in case it fails, so it doesn't crash stuff badly
}