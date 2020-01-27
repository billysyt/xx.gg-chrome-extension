function save_options() {
    var riot_path = document.getElementById('riot_path').value;
    var region = document.getElementById('region').value;

    chrome.storage.local.set({
        riot_path: riot_path,
        region: region
    }, function() {
        var save = document.getElementById('save');
        save.textContent = 'complete';
        save.style.backgroundColor = '#46bb61';

        chrome.extension.sendMessage({cmd: "changeDirectory", data: {riot_path: riot_path}});
        chrome.extension.sendMessage({cmd: "changeRegion", data: {region: region}});
    });
}

function restore_options() {
    chrome.storage.local.get(['riot_path', 'region', 'state', 'multisearch', 'champion', 'rune', 'items', 'ban', 'localhost', 'fileurl', 'summonerName', 'networkservice', 'quick_menus', 'profileIcon', 'summonerLevel', 'performance'], function(items) {
        if (items.performance === "low") {
            document.getElementById('low').style.backgroundColor = '#4c8cff';
            document.getElementById('low').style.color = '#ffffff';
            document.getElementById('medium').style.backgroundColor = '#ffffff';
            document.getElementById('medium').style.color = '#4c8cff';
            document.getElementById('high').style.backgroundColor = '#ffffff';
            document.getElementById('high').style.color = '#4c8cff';
            chrome.storage.local.set({
                "refresh_rate": 7000
            });
        } else if (items.performance === "medium") {
            document.getElementById('low').style.backgroundColor = '#ffffff';
            document.getElementById('low').style.color = '#4c8cff';
            document.getElementById('medium').style.backgroundColor = '#4c8cff';
            document.getElementById('medium').style.color = '#ffffff';
            document.getElementById('high').style.backgroundColor = '#ffffff';
            document.getElementById('high').style.color = '#4c8cff';
            chrome.storage.local.set({
                "refresh_rate": 5000
            });
        } else {
            document.getElementById('low').style.backgroundColor = '#ffffff';
            document.getElementById('low').style.color = '#4c8cff';
            document.getElementById('medium').style.backgroundColor = '#ffffff';
            document.getElementById('medium').style.color = '#4c8cff';
            document.getElementById('high').style.backgroundColor = '#4c8cff';
            document.getElementById('high').style.color = '#ffffff';
            chrome.storage.local.set({
                "performance": "high"
            });
            chrome.storage.local.set({
                "refresh_rate": 2000
            });
        }

        if (items.summonerName){
            document.getElementsByClassName('summonerArea')[0].style.display = "block";
            if (items.region == "www") {
                document.getElementById('ifiPage').style.display = "inline-block";
            }
        }
        document.getElementsByClassName('currentSummoner')[0].textContent = items.summonerName;
        document.getElementsByClassName('profile_icon')[0].src = "https://opgg-static.akamaized.net/images/profile_icons/profileIcon"+items.profileIcon+".jpg";
        document.getElementsByClassName('profile_level')[0].textContent = items.summonerLevel;
        document.getElementById('summonerPage').href = "http://"+items.region+".op.gg/summoner/userName="+items.summonerName;
        document.getElementById('ifiPage').href = "http://ifi.gg/summoner/"+items.summonerName;

        document.getElementById('riot_path').value = items.riot_path;

        if (items.quick_menus) {
            for (var i = 0; i < items.quick_menus.length; i++) {
                let menu = items.quick_menus[i];

                document.getElementById('img_'+menu).style.display = 'inline-block';
            }
        } else {
            chrome.storage.local.set({quick_menus: ["multisearch", "champion", "rune", "items", "ban"]});
        }

        if (items.localhost == "off" || items.localhost == "ing" || !items.fileurl) {
            document.getElementsByTagName('body')[0].style.width = "278px";
            document.getElementById('settings').style.display = "none";
            document.getElementById('allow').style.display = "block";

            if (items.localhost == "on") {
                var btn_localhost = document.getElementById('btn_localhost');
                document.getElementById('img_localhost').src = 'images/icon_check_on.png';
                btn_localhost.disabled = true;
                btn_localhost.style.cursor = "default";
                btn_localhost.style.color = "#ffffff";
                btn_localhost.textContent = "Ok";
                btn_localhost.style.border = "1px solid #46bb61";
                btn_localhost.style.backgroundColor = '#46bb61';
            } else if (items.localhost == "ing") {
                document.getElementById('img_localhost').src = 'images/icon_check_ing.png';
            }

            if (items.fileurl) {
                var btn_fileurl = document.getElementById('btn_fileurl');
                document.getElementById('img_fileurl').src = 'images/icon_check_on.png';
                btn_fileurl.disabled = true;
                btn_fileurl.style.cursor = "default";
                btn_fileurl.style.color = "#ffffff";
                btn_fileurl.textContent = "Ok";
                btn_fileurl.style.backgroundColor = '#46bb61';
            }
        }

        if (items.networkservice == "ing") {
            var btn_hotfix = document.getElementById('btn_hotfix');
            document.getElementById('img_hotfix').src = 'images/icon_check_ing.png';
        }

        if (items.region) {
            document.getElementById('region').value = items.region;
        }
        
        if (items.state == "on") {
            document.getElementById('ext_onoff').checked = true;
             if (items.multisearch == "on") {
                document.getElementById('img_multisearch').src = "images/icon_multi_o_none.png";
            } else {
                document.getElementById('img_multisearch').src = "images/icon_multi_d_none.png";
            }

            if (items.champion == "on") {
                document.getElementById('img_champion').src = "images/icon_cham_o_none.png";
            } else {
                document.getElementById('img_champion').src = "images/icon_cham_d_none.png";
            }

            if (items.rune == "on") {
                document.getElementById('img_rune').src = "images/icon_rune_o_none.png";
            } else {
                document.getElementById('img_rune').src = "images/icon_rune_d_none.png";
            }

            if (items.items == "on") {
                document.getElementById('img_items').src = "./images/icon_item_o_none.png";
            } else {
                document.getElementById('img_items').src = "./images/icon_item_d_none.png";
            }

            if (items.ban == "on") {
                document.getElementById('img_ban').src = "./images/icon_ban_o_none.png";
            } else {
                document.getElementById('img_ban').src = "./images/icon_ban_d_none.png";
            }
        } else {
            document.getElementById('ext_onoff').checked = false;
            document.getElementById('img_multisearch').src = "images/icon_multi_d_none.png";
            document.getElementById('img_champion').src = "images/icon_cham_d_none.png";
            document.getElementById('img_rune').src = "images/icon_rune_d_none.png";
            document.getElementById('img_items').src = "./images/icon_item_d_none.png";
            document.getElementById('img_ban').src = "./images/icon_ban_d_none.png";
        }

       
    });
}

function i18n() {
    document.getElementById('pathDesc').textContent = chrome.i18n.getMessage("pathDescription");
    document.getElementById('save').textContent = chrome.i18n.getMessage("save");
    // document.getElementById('multisearch').textContent = chrome.i18n.getMessage("labelMultisearch");
    // document.getElementById('champions').textContent = chrome.i18n.getMessage("labelChampion");
    // document.getElementById('runes').textContent = chrome.i18n.getMessage("labelAutoRune");
    // document.getElementById('items').textContent = chrome.i18n.getMessage("labelItemRecommend");
    document.getElementById('extension').textContent = chrome.i18n.getMessage("labelExtensionOnOff");
    document.getElementsByClassName('allow_title')[0].textContent = chrome.i18n.getMessage('pleaseCheck');
    document.getElementById('descFileUrl').textContent = chrome.i18n.getMessage("labelAllowFileUrl");
    document.getElementById('descLocalhost').textContent = chrome.i18n.getMessage("labelAllowLocalhost");
    document.getElementById('descHotfix').textContent = chrome.i18n.getMessage("labelNetworkService");
    document.getElementById('descRunLeague').textContent = chrome.i18n.getMessage("labelRunLeague");
    document.getElementById('descPath').textContent = chrome.i18n.getMessage("labelPath");
    document.getElementsByClassName('path_set')[0].textContent = chrome.i18n.getMessage('pathSet');
    document.getElementById('autoDetect').textContent = chrome.i18n.getMessage("autoDetection");
    document.getElementById('descServer').textContent = chrome.i18n.getMessage("descServer");
    document.getElementById('myPageLabel').textContent = chrome.i18n.getMessage("myPageLabel");
    document.getElementById('ifiLabel').textContent = chrome.i18n.getMessage("ifiLabel");
    document.getElementById('hotfix_label').textContent = chrome.i18n.getMessage("hotfixDesc");
    document.getElementById('title-refresh-rate').textContent = chrome.i18n.getMessage('performance');
    document.getElementById('low').textContent = chrome.i18n.getMessage('low');
    document.getElementById('medium').textContent = chrome.i18n.getMessage('medium');
    document.getElementById('high').textContent = chrome.i18n.getMessage('high');

}

function multi_onoff() {
    chrome.storage.local.get(['multisearch'], function(item) {
        if (item.multisearch == 'on') {
            document.getElementById('img_multisearch').src = "images/icon_multi_d_none.png";
            chrome.storage.local.set({multisearch: "off"});
            chrome.extension.sendMessage({cmd: "multi_off"});
        } else {
            document.getElementById('img_multisearch').src = "images/icon_multi_o_none.png";
            chrome.storage.local.set({multisearch: "on"});
            chrome.extension.sendMessage({cmd: "multi_on"});
        }
    }); 
}

function champ_onoff() {
    chrome.storage.local.get(['champion'], function(item) {
        if (item.champion == 'on') {
            document.getElementById('img_champion').src = "images/icon_cham_d_none.png";
            chrome.storage.local.set({champion: "off"});
            chrome.extension.sendMessage({cmd: "champ_off"});
        } else {
            document.getElementById('img_champion').src = "images/icon_cham_o_none.png";
            chrome.storage.local.set({champion: "on"});
            chrome.extension.sendMessage({cmd: "champ_on"});
        }
    }); 
}

function rune_onoff() {
    chrome.storage.local.get(['rune'], function(item) {
        if (item.rune == 'on') {
            document.getElementById('img_rune').src = "images/icon_rune_d_none.png";
            chrome.storage.local.set({rune: "off"});
            chrome.extension.sendMessage({cmd: "rune_off"});
        } else {
            document.getElementById('img_rune').src = "images/icon_rune_o_none.png";
            chrome.storage.local.set({rune: "on"});
            chrome.extension.sendMessage({cmd: "rune_on"});
        }
    }); 
}

function items_onoff() {
    chrome.storage.local.get(['items'], function(item) {
        if (item.items == 'on') {
            document.getElementById('img_items').src = "./images/icon_item_d_none.png";
            chrome.storage.local.set({items: "off"});
            chrome.extension.sendMessage({cmd: "items_off"});
        } else {
            document.getElementById('img_items').src = "./images/icon_item_o_none.png";
            chrome.storage.local.set({items: "on"});
            chrome.extension.sendMessage({cmd: "items_on"});
        }
    });
}

function ban_onoff() {
    chrome.storage.local.get(['ban'], function(item) {
        if (item.ban == 'on') {
            document.getElementById('img_ban').src = "./images/icon_ban_d_none.png";
            chrome.storage.local.set({ban: "off"});
            chrome.extension.sendMessage({cmd: "ban_off"});
        } else {
            document.getElementById('img_ban').src = "./images/icon_ban_o_none.png";
            chrome.storage.local.set({ban: "on"});
            chrome.extension.sendMessage({cmd: "ban_on"});
        }
    });
}

function ext_onoff() {
    chrome.storage.local.get(['state', 'multisearch', 'champion', 'rune', 'items'], function(items) {
        if (items.state == "on") {
            document.getElementById('ext_onoff').checked = false;
            chrome.storage.local.set({state: "off"});
            chrome.extension.sendMessage({cmd: "ext_off"});
            document.getElementById('img_multisearch').src = "images/icon_multi_d_none.png";
            document.getElementById('img_champion').src = "images/icon_cham_d_none.png";
            document.getElementById('img_rune').src = "images/icon_rune_d_none.png";
            document.getElementById('img_items').src = "./images/icon_item_d_none.png";
            document.getElementById('img_ban').src = "./images/icon_ban_d_none.png";
        } else {
            document.getElementById('ext_onoff').checked = true;
            chrome.storage.local.set({state: "on"});
            chrome.extension.sendMessage({cmd: "ext_on"});
            if (items.multisearch == "on") {
                document.getElementById('img_multisearch').src = "images/icon_multi_o_none.png";
            } else {
                document.getElementById('img_multisearch').src = "images/icon_multi_d_none.png";
            }

            if (items.champion == "on") {
                document.getElementById('img_champion').src = "images/icon_cham_o_none.png";
            } else {
                document.getElementById('img_champion').src = "images/icon_cham_d_none.png";
            }

            if (items.rune == "on") {
                document.getElementById('img_rune').src = "images/icon_rune_o_none.png";
            } else {
                document.getElementById('img_rune').src = "images/icon_rune_d_none.png";
            }

            if(items.items == "on") {
                document.getElementById('img_items').src = "./images/icon_item_o_none.png";
            } else {
                document.getElementById('img_items').src = "./images/icon_item_d_none.png";
            }

            if(items.ban == "on") {
                document.getElementById('img_ban').src = "./images/icon_ban_o_none.png";
            } else {
                document.getElementById('img_ban').src = "./images/icon_ban_d_none.png";
            }
        }
    }); 
}

function riot_path_clicked() {
    var save = document.getElementById('save');
    save.style.backgroundColor = "#4c8cff";
    save.textContent = chrome.i18n.getMessage("save");
    save.disabled = false;
}

function region_clicked() {
    var save = document.getElementById('save');
    save.style.backgroundColor = "#4c8cff";
    save.textContent = chrome.i18n.getMessage("save");
    save.disabled = false;
}

function btn_fileurl_clicked() {
    chrome.tabs.create({
        url: 'chrome://extensions/?id=' + chrome.runtime.id
    });
}

function btn_localhost_clicked() {
    chrome.tabs.create({
        url: 'chrome://flags/#allow-insecure-localhost'
    });
    chrome.storage.local.set({localhost: "ing"});
}

function btn_set_path_clicked() {
    document.getElementsByTagName('body')[0].style.width = "320px";
    document.getElementById('settings').style.display = "block";
    document.getElementById('allow').style.display = "none";
}

function btn_hotfix_clicked() {
    chrome.tabs.create({
        url: 'chrome://flags/#network-service'
    });
    chrome.storage.local.set({networkservice: "ing"});
}

function btn_settings_clicked() {
    chrome.tabs.create({
        url: 'chrome-extension://'+chrome.runtime.id+'/settings.html'
    });
}

function btn_low_clicked() {
    document.getElementById('low').style.backgroundColor = '#4c8cff';
    document.getElementById('low').style.color = '#ffffff';
    document.getElementById('medium').style.backgroundColor = '#ffffff';
    document.getElementById('medium').style.color = '#4c8cff';
    document.getElementById('high').style.backgroundColor = '#ffffff';
    document.getElementById('high').style.color = '#4c8cff';
    chrome.storage.local.set({
        "performance": "low"
    });
    chrome.storage.local.set({
        "refresh_rate": 7000
    });
    chrome.extension.sendMessage({cmd: "refresh-rate-changed"});
}

function btn_medium_clicked() {
    document.getElementById('low').style.backgroundColor = '#ffffff';
    document.getElementById('low').style.color = '#4c8cff';
    document.getElementById('medium').style.backgroundColor = '#4c8cff';
    document.getElementById('medium').style.color = '#ffffff';
    document.getElementById('high').style.backgroundColor = '#ffffff';
    document.getElementById('high').style.color = '#4c8cff';
    chrome.storage.local.set({
        "performance": "medium"
    });
    chrome.storage.local.set({
        "refresh_rate": 5000
    });
    chrome.extension.sendMessage({cmd: "refresh-rate-changed"});
}

function btn_high_clicked() {
    document.getElementById('low').style.backgroundColor = '#ffffff';
    document.getElementById('low').style.color = '#4c8cff';
    document.getElementById('medium').style.backgroundColor = '#ffffff';
    document.getElementById('medium').style.color = '#4c8cff';
    document.getElementById('high').style.backgroundColor = '#4c8cff';
    document.getElementById('high').style.color = '#ffffff';
    chrome.storage.local.set({
        "performance": "high"
    });
    chrome.storage.local.set({
        "refresh_rate": 2000
    });
    chrome.extension.sendMessage({cmd: "refresh-rate-changed"});
}

document.addEventListener('DOMContentLoaded', i18n);
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
document.getElementById('img_multisearch').addEventListener('click', multi_onoff);
document.getElementById('img_champion').addEventListener('click', champ_onoff);
document.getElementById('img_rune').addEventListener('click', rune_onoff);
document.getElementById('img_items').addEventListener('click', items_onoff);
document.getElementById('img_ban').addEventListener('click', ban_onoff);
document.getElementById('ext_onoff').addEventListener('click', ext_onoff);
document.getElementById('riot_path').addEventListener('click', riot_path_clicked);
document.getElementById('region').addEventListener('click', region_clicked);
document.getElementById('btn_fileurl').addEventListener('click', btn_fileurl_clicked);
document.getElementById('btn_localhost').addEventListener('click', btn_localhost_clicked);
document.getElementById('descPath').addEventListener('click', btn_set_path_clicked);
document.getElementById('btn_hotfix').addEventListener('click', btn_hotfix_clicked);
document.getElementById('btn_settings').addEventListener('click', btn_settings_clicked);
document.getElementById('low').addEventListener('click', btn_low_clicked);
document.getElementById('medium').addEventListener('click', btn_medium_clicked);
document.getElementById('high').addEventListener('click', btn_high_clicked);

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.cmd === 'loggedIn') {
        var summoner = request.summoner;
        chrome.storage.local.set({summonerName: summoner["displayName"]});
        chrome.storage.local.set({profileIcon: summoner["profileIconId"]});
        chrome.storage.local.set({summonerLevel: summoner["summonerLevel"]});

        document.getElementsByClassName('currentSummoner')[0].textContent = summoner["displayName"];
        document.getElementsByClassName('profile_icon')[0].src = "https://opgg-static.akamaized.net/images/profile_icons/profileIcon"+summoner["profileIconId"]+".jpg";
        document.getElementsByClassName('profile_level')[0].textContent = summoner["summonerLevel"];
        chrome.storage.local.get(['region'], function(data) {
            document.getElementById('summonerPage').href = "http://"+data.region+".op.gg/summoner/userName="+summoner["displayName"];
            document.getElementById('ifiPage').href = "http://ifi.gg/summoner/"+summoner["displayName"];
            if (data.region == "www") {
                document.getElementById('ifiPage').style.display = "inline-block";
            }
        });
        
        document.getElementsByClassName('summonerArea')[0].style.display = "block";
    }
});