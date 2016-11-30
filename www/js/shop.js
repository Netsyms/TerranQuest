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
                            showErrorMessage("Error: " + result.message);
                        }
                    }).fail(function () {
                        showErrorMessage("Error: Lost connection to TerranQuest servers.  If your purchase does not appear within a few hours, contact support@netsyms.com.");
                    });
                })
                .then(function () {
                    showSuccessMessage("Thanks for your purchase!");
                    refreshcoins();
                })
                .catch(function (err) {
                    console.log("Error: " + err.message);
                    showErrorMessage("Error: " + err.message);
                });
    } else if (getPlatform() == DEVICE_IOS) {
        inAppPurchase
                .buy(productId)
                .then(function (data) {
                    console.log(JSON.stringify(data));
                    $.getJSON(mkApiUrl('processiap', 'gs'), {
                        os: 'ios',
                        data: data.receipt,
                        signature: data.signature,
                        id: productId
                    }, function (result) {
                        if (result.status == 'OK') {
                            return inAppPurchase.consume(data.type, data.receipt, data.signature);
                        } else {
                            showErrorMessage("Error: " + result.message);
                        }
                    }).fail(function () {
                        showErrorMessage("Error: Lost connection to TerranQuest servers.  If your purchase does not appear within a few hours, contact support@netsyms.com.");
                    });
                })
                .then(function () {
                    showSuccessMessage("Thanks for your purchase!");
                    refreshcoins();
                })
                .catch(function (err) {
                    console.log("Error: " + err.message);
                    showErrorMessage("Error: " + err.message);
                });
    } else {
        showErrorMessage("Store not available on your device.  Please go to terranquest.net to purchase coins.");
    }
}

function buyitem(id, cost) {
    $('#shopitem-' + id).prop('onclick', null).off('click');
    $.getJSON(mkApiUrl('buyitem', 'gs'), {
        merchid: id,
        cost: cost
    }, function (data) {
        if (data.status == 'OK') {
            showSuccessMessage(data.message);
        } else {
            showErrorMessage(data.message);
        }
        loadstorefront();
    });
}

function getmerchhtmlfromjson(item) {
    var itemhtml = "<div class='list-group-item shop-item' id='shopitem-" + item.merchid + "'>"
            + "<h4 class='itemname'>" + item.title + "</h4>"
            + "<p class = 'itemdesc' > " + item.desc + " </p>"
            + "<span class='btn btn-success' onclick=\"buyitem('" + item.merchid + "', " + item.cost + ")\">"
            + "Buy Item (" + item.cost + " coins)"
            + "</span>"
            + "</div>";
    return itemhtml;
}

function getcoinhtmlfromjson(coin) {
    var coinhtml = "<div class='list-group-item shop-item' id='coinitem-" + coin.merchid + "'>"
            + "<h4 class='itemname'>" + coin.display + " (" + coin.coins + ")</h4>"
            + "<span class='btn btn-success' onclick=\"buycoins('" + coin.merchid + "', " + coin.cost_usd + ")\">"
            + "Buy Coins ($" + coin.cost_usd + ")"
            + "</span>"
            + "</div>";
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

function refreshcoins() {
    $.getJSON(mkApiUrl('shopitems'), function (data) {
        if (data.status == 'OK') {
            $('#coinbalance').text(data.balance);
        }
    });
}