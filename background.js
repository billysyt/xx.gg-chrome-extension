var r = null;
var t = null;
var tftTimer = null;
var prevRoomName = "";

var riot_path = "C:/Riot Games/League of Legends";
var riot_url = "";

var multiSearchTabId = 0;
var championSearchTabId = 0;
var settingsTabId = 0;
var banpickTabId = 0;
var tftTabId = 0;

var currentSummoner = {};
var currentChampionId = 0;

var currentGameQueueId = 0;

var directoryWrong = 0;
var minRuneLevel = 15;

var isSettingMessage = false;
var isSettingMessage2 = false;

var refresh_rate = 2000;

var region = "";
var regionMap = {
    "cs_CZ": "eune",
    "el_GR": "eune",
    "pl_PL": "eune",
    "ro_RO": "eune",
    "hu_HU": "eune",
    "en_GB": "euw",
    "de_DE": "euw",
    "es_ES": "euw",
    "it_IT": "euw",
    "fr_FR": "euw",
    "ja_JP": "jp",
    "ko_KR": "www",
    "es_MX": "lan",
    "es_AR": "las",
    "pt_BR": "br",
    "en_US": "na",
    "en_AU": "oce",
    "ru_RU": "ru",
    "tr_TR": "tr",
    "ms_MY": "sg",
    "en_PH": "ph",
    "en_SG": "sg",
    "th_TH": "th",
    "vn_VN": "vn",
    "id_ID": "id",
    "zh_MY": "",
    "zh_CN": "",
    "zh_TW": "tw"
};

var regionReal = "";
var regionMapReal = {
    "KR": "www",
    "JP": "jp",
    "NA": "na",
    "EUW": "euw",
    "EUNE": "eune",
    "OCE": "oce",
    "BR": "br",
    "LAS": "las",
    "LAN": "lan",
    "RU": "ru",
    "TR": "tr",
    "SG": "sg",
    "ID": "id",
    "PH": "ph",
    "TW": "tw",
    "VN": "vn",
    "TH": "th",
    "LA1": "lan",
    "LA2": "las",
    "OC1": "oce",
}

var builds = ['item_start', 'item_recommend', 'item_boots'];

var isMultisearchAllowed = true;
var isChampionAllowed = true;
var isAutoRuneAllowed = false;
var isItemRecommendAllowed = false;
var isBanAllowed = true;

var isFileUrlAllowed = true;
var isLocalhostAllowed = true;

var team1 = [0, 1, 2, 3, 4];
var team2 = [5, 6, 7, 8 ,9];
var prevActions = "";
var isFirstRun = true;

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-37377845-16']);
_gaq.push(['_trackPageview']);

(function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function updatePick(tabid, team, pos, champ) {
    chrome.tabs.executeScript(tabid, {
        "code": "var myScript = document.createElement('script');"
            + "myScript.textContent = \"updateChampion('"+team+"', "+pos+", "+champ+");\";"
            + "document.head.appendChild(myScript);"
    });
}

function updateBan(tabid, team, pos, champ) {
    chrome.tabs.executeScript(tabid, {
        "code": "var myScript = document.createElement('script');"
            + "myScript.textContent = \"updateBan('"+team+"', "+pos+", "+champ+");\";"
            + "document.head.appendChild(myScript);"
    });
}

function openChampionTab(currentChampionId, lineType, gameType, isUrf=false) {
    var championName = "";

    $.ajax({
        type: 'GET',
        async: false,
        dataType: 'json',
        url: riot_url+'/lol-champions/v1/inventories/'+currentSummoner["summonerId"]+'/champions/'+currentChampionId,
        success: function(json) {
            if(isChampionAllowed) {
                _gaq.push(['_trackEvent', 'champions_'+gameType, 'opened']);
                chrome.windows.getAll(function(windows) {
                    if (windows.length == 0) {
                        chrome.windows.create({url: "chrome://newtab"});
                    }

                    var opggUrl = "https://"+region+".op.gg/champion/"+json['alias'];
                    if (isUrf) {
                        opggUrl = "https://"+region+".op.gg/urf/"+json['alias']+"/statistics";
                    }

                    if (championSearchTabId == 0) {
                        chrome.tabs.create({url: opggUrl}, function(newTab) {
                            championSearchTabId = newTab.id;
                        });
                    } else {
                        // chrome.tabs.update(championSearchTabId, {url: "http://"+region+".op.gg/champion/"+json['alias']+"/statistics/"+lineType, active:true, highlighted:true});
                        chrome.tabs.update(championSearchTabId, {url: opggUrl, active:true, highlighted:true});
                    }
                });
            }
           championName = json['alias'];
        }
    });

    return championName;
}

function parseChampion(championName, type, championId=0, isUrf=false) {
    var opggUrl = "https://"+region+".op.gg/champion/"+championName+"/statistics";
    if (isUrf) {
        opggUrl = "https://"+region+".op.gg/urf/"+championName+"/statistics";
    }

    $.ajax({
        type: 'GET',
        dataType: 'text',
        url: opggUrl,
        success: function(data) {
            if (type == "perk") {
                var page = {
                  "autoModifiedSelections": [
                    0
                  ],
                  "current": true,
                  "id": 0,
                  "isActive": true,
                  "isDeletable": true,
                  "isEditable": true,
                  "isValid": true,
                  "lastModified": 0,
                  "name": "OP.GG",
                  "order": 0,
                  "primaryStyleId": 0,
                  "selectedPerkIds": [
                  ],
                  "subStyleId": 0
                };

                var perk_page_wrap = data.split('perk-page-wrap')[1];
                var primary_perk = perk_page_wrap.split('perk-page__item--mark')[1].split('perkStyle/')[1].split('.png')[0];
                var sub_perk = perk_page_wrap.split('perk-page__item--mark')[2].split('perkStyle/')[1].split('.png')[0];
                page["primaryStyleId"] = primary_perk;
                page["subStyleId"] = sub_perk;
                let perkids2 = perk_page_wrap.split('perk-page__item--active');
                for (let i = 1; i < perkids2.length; i++) {
                    let perkid = perkids2[i].split('perk/')[1].split('.png')[0];
                    page["selectedPerkIds"].push(perkid);
                }

                let fragments = perk_page_wrap.split('fragment__row');
                for (let i = 1; i < fragments.length; i++) {
                    let tmp = fragments[i].split('active')[0].split('perkShard/');
                    let shardid = tmp[tmp.length-1].split('.png')[0];
                    page["selectedPerkIds"].push(shardid);
                }
                newPerkPage(JSON.stringify(page));
            } 

            if (type == "item") {
                var totalItems = {};

                var itemBuilds = data.split('champion-overview__sub-header');

                for (var l = 1; l < itemBuilds.length; l++) {
                    var buildName = builds[l-1];
                    if (buildName != builds[0]) {
                        totalItems[buildName] = [];
                    }
                    var itemBuild = itemBuilds[l].split('champion-overview__data champion-overview__border champion-overview__border--first');

                    for (var i = 1; i < itemBuild.length; i++) {
                        if (buildName == builds[0]) {
                            totalItems[buildName+i] = [];
                        }

                        var items = "";
                        if (itemBuild[i].indexOf('/img/item') >= 0) {
                            items = itemBuild[i].split('/img/item/');
                        } else {
                            items = itemBuild[i].split('/lol/item/');
                        }

                        for (var k = 1; k < items.length; k++) {
                            var item = items[k].split('.png')[0];

                            if (buildName != builds[0]) {
                                if (totalItems[buildName].indexOf(item) === -1) {
                                    totalItems[buildName].push(item)
                                }
                            } else {
                                totalItems[buildName+i].push(item);
                            }
                        }
                    }
                }

                updateItemBuild(championName, totalItems, championId, isUrf);
            }
        }
    });
}

function updateItemBuild(championName, totalItems, championId, isUrf=false) {
    $.ajax({
        type: 'GET',
        dataType: 'json',
        url: riot_url+'/lol-item-sets/v1/item-sets/'+currentSummoner["summonerId"]+'/sets',
        success: function(json) {
            var blocks = [];

            for (var buildName in totalItems) {
                var block = {};
                var itemType = buildName;
                if (buildName.indexOf(builds[0]) >= 0) {
                    itemType = builds[0];
                }
                block["items"] = [];

                for (var k = 0; k < totalItems[buildName].length; k++) {
                    var tmp = {};
                    tmp["count"] = 1;
                    tmp["id"] = totalItems[buildName][k];
                    block["items"].push(tmp);
                }

                block["hideIfSummonerSpell"] = "";
                block["showIfSummonerSpell"] = "";
                block["type"] = chrome.i18n.getMessage(itemType);

                blocks.push(block);
            }

            var title = 'OP.GG ' + championName;
            if (isUrf) {
                title = title + " URF";
            }
            var itemSet = {
                "associatedChampions": championId == 0 ? [] : [championId],
                "associatedMaps": [],
                "blocks": blocks,
                "map": "any",
                "mode": "any",
                "preferredItemSlots": [],
                "sortrank": 0,
                "startedFrom": "blank",
                "title": title,
                "type": "custom",
                "uid": guid()
            };

            var buildUpdated = false;

            if (Object.keys(json["itemSets"]).length == 0) {
                json["itemSets"].push(itemSet);
            } else {
                 for (var i = 0; i < Object.keys(json["itemSets"]).length; i++) {
                    if (json["itemSets"][i]["title"] == title) {
                        json["itemSets"][i]["blocks"] = blocks;
                        buildUpdated = true;
                        break;
                    }
                }

                if (!buildUpdated) {
                    json["itemSets"].push(itemSet);
                }
            }

            $.ajax({
                type: 'PUT',
                dataType: 'json',
                data: JSON.stringify(json),
                contentType: 'application/json',
                processData: false,
                url: riot_url+'/lol-item-sets/v1/item-sets/'+currentSummoner["summonerId"]+'/sets',
                success: function(json) {

                }
            });
        }
    });
}

function newPerkPage(page) {
    $.ajax({
        type: 'POST',
        dataType: 'json',
        data: page,
        contentType: 'application/json',
        processData: false,
        url: riot_url+'/lol-perks/v1/pages',
        success: function(json) {
        },
        error: function(json) {

        }
    });
}

function updatePerkPage(championName, isUrf=false) {
    $.ajax({
        type: 'GET',
        dataType: 'json',
        url: riot_url+'/lol-perks/v1/currentpage',
        success: function(json) {
            if (json["isDeletable"] == true) {
                $.ajax({
                    type: 'DELETE',
                    url: riot_url+'/lol-perks/v1/pages/'+json["id"],
                    success: function() {
                        parseChampion(championName, "perk", 0, isUrf);
                    },
                    error: function() {

                    }
                });
            } else {
                parseChampion(championName, "perk", 0, isUrf);
            }
        }
    });
}

function updatePerkPages(championName, isUrf=false) {
    $.ajax({
        type: 'GET',
        dataType: 'json',
        url: riot_url+'/lol-perks/v1/pages',
        success: function(json) {
            var isOPGGPageAvailable = false;

            for (var i = 0; i < Object.keys(json).length; i++) {
                var pageName = json[i]["name"];

                if (pageName == 'OP.GG') {
                    isOPGGPageAvailable = true;
                    $.ajax({
                        type: 'DELETE',
                        async: false,
                        url: riot_url+'/lol-perks/v1/pages/'+json[i]["id"],
                        success: function() {
                            parseChampion(championName, "perk", 0, isUrf);
                        },
                        error: function() {

                        }
                    });

                    break;   
                }
            }

            if (!isOPGGPageAvailable) {
                updatePerkPage(championName, isUrf);
            }
        }
    });
}

function updateTFT(tabid, json) {
    chrome.tabs.executeScript(tabid, {
        "code": "var myScript = document.createElement('script');"
            + "myScript.textContent = \"updateTFT('"+json+"');\";"
            + "document.head.appendChild(myScript);"
    });
}

function updateTFTRank(tabid, json) {
	chrome.tabs.executeScript(tabid, {
        "code": "var myScript = document.createElement('script');"
            + "myScript.textContent = \"updateTFTRank('"+json+"');\";"
            + "document.head.appendChild(myScript);"
    });
}

function tftMockProcess() {
	var tftData = {"gameId":3754459663,"gameLength":2048,"isRanked":false,"localPlayer":{"boardPieces":[{"icon":"/lol-game-data/assets/v1/champion-icons/150.png","level":2,"name":"나르","price":4},{"icon":"/lol-game-data/assets/v1/champion-icons/63.png","level":2,"name":"브랜드","price":4},{"icon":"/lol-game-data/assets/v1/champion-icons/113.png","level":2,"name":"세주아니","price":4},{"icon":"/lol-game-data/assets/v1/champion-icons/106.png","level":2,"name":"볼리베어","price":3},{"icon":"/lol-game-data/assets/v1/champion-icons/22.png","level":2,"name":"애쉬","price":3},{"icon":"/lol-game-data/assets/v1/champion-icons/85.png","level":2,"name":"케넨","price":3},{"icon":"/lol-game-data/assets/v1/champion-icons/201.png","level":2,"name":"브라움","price":2},{"icon":"/lol-game-data/assets/v1/champion-icons/34.png","level":1,"name":"애니비아","price":5}],"companion":{"colorName":"","icon":"/lol-game-data/assets/ASSETS/Loadouts/Companions/Tooltip_Griffin_Parrot_Tier1.Companions.png","speciesName":"짹짹이"},"ffaStanding":3,"health":0,"iconId":3478,"isLocalPlayer":true,"puuid":"113a3ea7-e65b-5804-aba7-663a9d3894fe","rank":3,"summonerId":11043262,"summonerName":"쥐에프디"},"players":[{"boardPieces":[{"icon":"/lol-game-data/assets/v1/champion-icons/67.png","level":3,"name":"베인","price":1},{"icon":"/lol-game-data/assets/v1/champion-icons/89.png","level":2,"name":"레오나","price":4},{"icon":"/lol-game-data/assets/v1/champion-icons/113.png","level":2,"name":"세주아니","price":4},{"icon":"/lol-game-data/assets/v1/champion-icons/22.png","level":2,"name":"애쉬","price":3},{"icon":"/lol-game-data/assets/v1/champion-icons/236.png","level":2,"name":"루시안","price":2},{"icon":"/lol-game-data/assets/v1/champion-icons/86.png","level":2,"name":"가렌","price":1},{"icon":"/lol-game-data/assets/v1/champion-icons/114.png","level":2,"name":"피오라","price":1},{"icon":"/lol-game-data/assets/v1/champion-icons/10.png","level":1,"name":"케일","price":5}],"companion":{"colorName":"","icon":"/lol-game-data/assets/ASSETS/Loadouts/Companions/Tooltip_Ghosty_Green_Tier3.Companions.png","speciesName":"유령이"},"ffaStanding":1,"health":20,"iconId":4218,"isLocalPlayer":false,"puuid":"2d769585-3491-5b47-a55f-719c1b402497","rank":1,"summonerId":32000468,"summonerName":"툰드라힐"},{"boardPieces":[{"icon":"/lol-game-data/assets/v1/champion-icons/41.png","level":3,"name":"갱플랭크","price":3},{"icon":"/lol-game-data/assets/v1/champion-icons/104.png","level":3,"name":"그레이브즈","price":1},{"icon":"/lol-game-data/assets/v1/champion-icons/38.png","level":3,"name":"카사딘","price":1},{"icon":"/lol-game-data/assets/v1/champion-icons/421.png","level":2,"name":"렉사이","price":2},{"icon":"/lol-game-data/assets/v1/champion-icons/121.png","level":2,"name":"카직스","price":1},{"icon":"/lol-game-data/assets/v1/champion-icons/18.png","level":2,"name":"트리스타나","price":1},{"icon":"/lol-game-data/assets/v1/champion-icons/21.png","level":1,"name":"미스 포츈","price":5}],"companion":{"colorName":"","icon":"/lol-game-data/assets/ASSETS/Loadouts/Companions/Tooltip_MiniGolem_Grey_Tier1.Companions.png","speciesName":"룬정령"},"ffaStanding":2,"health":0,"iconId":579,"isLocalPlayer":false,"puuid":"5fbb87ad-be45-599c-b377-b0c519106b5e","rank":2,"summonerId":2912023,"summonerName":"A858001"},{"boardPieces":[{"icon":"/lol-game-data/assets/v1/champion-icons/150.png","level":2,"name":"나르","price":4},{"icon":"/lol-game-data/assets/v1/champion-icons/63.png","level":2,"name":"브랜드","price":4},{"icon":"/lol-game-data/assets/v1/champion-icons/113.png","level":2,"name":"세주아니","price":4},{"icon":"/lol-game-data/assets/v1/champion-icons/106.png","level":2,"name":"볼리베어","price":3},{"icon":"/lol-game-data/assets/v1/champion-icons/22.png","level":2,"name":"애쉬","price":3},{"icon":"/lol-game-data/assets/v1/champion-icons/85.png","level":2,"name":"케넨","price":3},{"icon":"/lol-game-data/assets/v1/champion-icons/201.png","level":2,"name":"브라움","price":2},{"icon":"/lol-game-data/assets/v1/champion-icons/34.png","level":1,"name":"애니비아","price":5}],"companion":{"colorName":"","icon":"/lol-game-data/assets/ASSETS/Loadouts/Companions/Tooltip_Griffin_Parrot_Tier1.Companions.png","speciesName":"짹짹이"},"ffaStanding":3,"health":0,"iconId":3478,"isLocalPlayer":true,"puuid":"113a3ea7-e65b-5804-aba7-663a9d3894fe","rank":3,"summonerId":11043262,"summonerName":"쥐에프디"},{"boardPieces":[{"icon":"/lol-game-data/assets/v1/champion-icons/84.png","level":2,"name":"아칼리","price":4},{"icon":"/lol-game-data/assets/v1/champion-icons/107.png","level":2,"name":"렝가","price":3},{"icon":"/lol-game-data/assets/v1/champion-icons/28.png","level":2,"name":"이블린","price":3},{"icon":"/lol-game-data/assets/v1/champion-icons/55.png","level":2,"name":"카타리나","price":3},{"icon":"/lol-game-data/assets/v1/champion-icons/555.png","level":2,"name":"파이크","price":2},{"icon":"/lol-game-data/assets/v1/champion-icons/38.png","level":2,"name":"카사딘","price":1},{"icon":"/lol-game-data/assets/v1/champion-icons/121.png","level":2,"name":"카직스","price":1},{"icon":"/lol-game-data/assets/v1/champion-icons/31.png","level":1,"name":"초가스","price":4}],"companion":{"colorName":"","icon":"/lol-game-data/assets/ASSETS/Loadouts/Companions/Tooltip_Miner_Rainbow_Tier2.Companions.png","speciesName":"두더지 광부"},"ffaStanding":4,"health":0,"iconId":4084,"isLocalPlayer":false,"puuid":"bc88effe-4ed6-5a8e-af42-3e70f6a47d97","rank":4,"summonerId":1361393,"summonerName":"MegaStudy"},{"boardPieces":[{"icon":"/lol-game-data/assets/v1/champion-icons/19.png","level":3,"name":"워윅","price":1},{"icon":"/lol-game-data/assets/v1/champion-icons/18.png","level":3,"name":"트리스타나","price":1},{"icon":"/lol-game-data/assets/v1/champion-icons/41.png","level":2,"name":"갱플랭크","price":3},{"icon":"/lol-game-data/assets/v1/champion-icons/236.png","level":2,"name":"루시안","price":2},{"icon":"/lol-game-data/assets/v1/champion-icons/53.png","level":2,"name":"블리츠크랭크","price":2},{"icon":"/lol-game-data/assets/v1/champion-icons/104.png","level":2,"name":"그레이브즈","price":1}],"companion":{"colorName":"","icon":"/lol-game-data/assets/ASSETS/Loadouts/Companions/Tooltip_TFT_Avatar_Blue.Companions.png","speciesName":"강도깨비"},"ffaStanding":5,"health":0,"iconId":3614,"isLocalPlayer":false,"puuid":"6b2292f3-aeae-563c-862d-cf9177cea5b8","rank":5,"summonerId":54470985,"summonerName":"풍우하하"},{"boardPieces":[{"icon":"/lol-game-data/assets/v1/champion-icons/18.png","level":3,"name":"트리스타나","price":1},{"icon":"/lol-game-data/assets/v1/champion-icons/41.png","level":2,"name":"갱플랭크","price":3},{"icon":"/lol-game-data/assets/v1/champion-icons/266.png","level":2,"name":"아트록스","price":3},{"icon":"/lol-game-data/assets/v1/champion-icons/236.png","level":2,"name":"루시안","price":2},{"icon":"/lol-game-data/assets/v1/champion-icons/104.png","level":2,"name":"그레이브즈","price":1},{"icon":"/lol-game-data/assets/v1/champion-icons/119.png","level":1,"name":"드레이븐","price":4}],"companion":{"colorName":"","icon":"/lol-game-data/assets/ASSETS/Loadouts/Companions/Tooltip_Griffin_Cream_Tier1.Companions.png","speciesName":"짹짹이"},"ffaStanding":6,"health":0,"iconId":3478,"isLocalPlayer":false,"puuid":"7d0a555c-f316-5c9a-87c5-76d287e5a0a1","rank":6,"summonerId":5274713,"summonerName":"궁 뎅 e"},{"boardPieces":[{"icon":"/lol-game-data/assets/v1/champion-icons/25.png","level":2,"name":"모르가나","price":3},{"icon":"/lol-game-data/assets/v1/champion-icons/266.png","level":2,"name":"아트록스","price":3},{"icon":"/lol-game-data/assets/v1/champion-icons/28.png","level":2,"name":"이블린","price":3},{"icon":"/lol-game-data/assets/v1/champion-icons/110.png","level":2,"name":"바루스","price":2},{"icon":"/lol-game-data/assets/v1/champion-icons/63.png","level":1,"name":"브랜드","price":4},{"icon":"/lol-game-data/assets/v1/champion-icons/60.png","level":1,"name":"엘리스","price":2}],"companion":{"colorName":"","icon":"/lol-game-data/assets/ASSETS/Loadouts/Companions/Tooltip_Griffin_Cream_Tier1.Companions.png","speciesName":"짹짹이"},"ffaStanding":7,"health":0,"iconId":3478,"isLocalPlayer":false,"puuid":"cae1d353-032f-5b2b-9d6b-c4eb3a287121","rank":7,"summonerId":1679964,"summonerName":"권오중약속장인"},{"boardPieces":[{"icon":"/lol-game-data/assets/v1/champion-icons/136.png","level":2,"name":"아우렐리온 솔","price":4},{"icon":"/lol-game-data/assets/v1/champion-icons/25.png","level":2,"name":"모르가나","price":3},{"icon":"/lol-game-data/assets/v1/champion-icons/45.png","level":2,"name":"베이가","price":3},{"icon":"/lol-game-data/assets/v1/champion-icons/103.png","level":2,"name":"아리","price":2},{"icon":"/lol-game-data/assets/v1/champion-icons/38.png","level":2,"name":"카사딘","price":1},{"icon":"/lol-game-data/assets/v1/champion-icons/117.png","level":1,"name":"룰루","price":2}],"companion":{"colorName":"","icon":"/lol-game-data/assets/ASSETS/Loadouts/Companions/Tooltip_Griffin_Cream_Tier1.Companions.png","speciesName":"짹짹이"},"ffaStanding":8,"health":0,"iconId":3795,"isLocalPlayer":false,"puuid":"cab7d828-5df6-5829-bfe2-466e049b660a","rank":8,"summonerId":79741306,"summonerName":"뿅망치든너부리"}],"queueId":1090};
	var tftPlayers = tftData["players"];
	for (var i = 0; i < tftPlayers.length; i++) {
		$.ajax({
			type: 'GET',
			url: riot_url+"/lol-ranked/v1/ranked-stats/"+tftPlayers[i]["summonerId"],
			dataType: 'json',
			async: false,
			success: function(json) {
				var tmpTFTRank = [];
				for (var k = 0; k < json["tftQueues"].length; k++) {
					var tftQueue = json["tftQueues"][k];

					if (tftQueue["queueType"] == "RANKED_TFT") {
						var tftTier = tftQueue["tier"] +" "+ tftQueue["division"] +" "+ tftQueue["leaguePoints"];

						var tmp = {
							"name": tftPlayers[i]["summonerName"],
							"tier": tftTier
						};

						tmpTFTRank.push(tmp);
					}
				}

				updateTFTRank(tftTabId, JSON.stringify(tmpTFTRank));
			}
		});
	}

	// updateTFT(tftTabId, tftData);
}

function tftMock() {
	if (tftTabId == 0) {
		chrome.tabs.create({
        	url: 'chrome-extension://'+chrome.runtime.id+'/tft.html'
    	}, function(tab) {
    		tftTabId = tab.id;

    		tftMockProcess();
    	});
	} else {
		chrome.tabs.update(tftTabId, {
        	url: 'chrome-extension://'+chrome.runtime.id+'/tft.html',
        	active: true,
        	highlighted: true
    	}, function() {
    		tftMockProcess();
    	});
	}
}

var tftGameLength = 0;
var tftRankSent = 0;
var tftRankData = {};
var tftCurrentData = {};
function tftEndOfGame(riot_url) {
    // console.log("Waiting TFT to finish.");
    $.ajax({
        type: 'GET',
        dataType: 'text',
        url: riot_url+"/lol-gameflow/v1/gameflow-phase",
        async: true,
        success: function(data) {
            $.ajax({
                type: 'GET',
                dataType: 'json',
                url: riot_url+"/lol-end-of-game/v1/tft-eog-stats",
                async: true,
                success: function(json) {
                    if (tftRankSent == 0) {
                        $.ajax({
                            type: 'GET',
                            url: riot_url+"/lol-ranked/v1/current-ranked-stats",
                            dataType: 'json',
                            async: true,
                            success: function(json) {
                                tftRankSent = 1;
                                tftRankData = json["tftQueues"];
                            }
                        });
                    }

                    if (data == '"EndOfGame"') {
                        clearInterval(tftTimer);
                        tftTimer = null;

                        var tmpJson = {
                            "match": json,
                            "tftQueues": tftRankData
                        };

                        $.ajax({
                            type: 'POST',
                            url: "https://tft.lol/api/l/matches/"+regionReal+"/"+json["gameId"]+"/import?end=1",
                            data: JSON.stringify(tmpJson),
                            dataType: 'json',
                            contentType: 'application/json',
                            processData: false,
                            success: function(res) {
                            }
                        });
                    } else {
                        if (tftGameLength != json["gameLength"]) {
                        	tftCurrentData = json;
                        	updateTFT(JSON.stringify(json));

                            var tmpJson = {
                                "match": json,
                                "tftQueues": tftRankData
                            };

                            $.ajax({
                                type: 'POST',
                                url: "https://tft.lol/api/l/matches/"+regionReal+"/"+json["gameId"]+"/import",
                                data: JSON.stringify(tmpJson),
                                dataType: 'json',
                                contentType: 'application/json',
                                processData: false,
                                success: function(res) {
                                    tftGameLength = json["gameLength"];
                                }
                            });
                        }
                    }
                }
            });
        }
    });
}

var tftMode = 0;
function leagueClientRunning(riot_url) {
    $.ajax({
        type: "GET",
        url: riot_url+"/riotclient/auth-token",
        success: function(res) {
            if (Object.keys(currentSummoner).length === 0) {
                $.ajax({
                    type: 'GET',
                    url: riot_url+'/lol-summoner/v1/current-summoner',
                    dataType: 'json',
                    success: function(json) {
                        currentSummoner = json;
                        chrome.extension.sendMessage({cmd: "loggedIn", summoner: currentSummoner});
                    }
                });
            } else {
                chrome.extension.sendMessage({cmd: "loggedIn", summoner: currentSummoner});
            }

            $.ajax({
                type: 'GET',
                url: riot_url+'/riotclient/region-locale',
                dataType: 'json',
                success: function(json) {
                    regionReal = json["region"];
                    region = regionMapReal[json["region"]];

                    if (region == undefined) {
                        region = regionMap[json["locale"]];
                    }

                    chrome.storage.local.set({region: region});
                    if (region == "www") {
                        chrome.storage.local.get(['notice_kr_server_down'], function(data) {
                            if (data.notice_kr_server_down == 1 || data.notice_kr_server_down == undefined) {
                                chrome.storage.local.set({notice_kr_server_down: 0});
                                // chrome.tabs.create({url: "https://talk.op.gg/s/lol/opgg/959208"}, function(newTab) {});
                            }
                        });

                        clearInterval(r);
                        r = null;
                        t = setInterval(isLeagueClientOpened, refresh_rate);
                        return;
                    }

                    var gameType = "";

                    $.ajax({
                        type: 'GET',
                        dataType: 'json',
                        url: riot_url+"/lol-champ-select/v1/session",
                        success: function(json) {
                            if (currentGameQueueId == 0) {
                                $.ajax({
                                    type: 'GET',
                                    dataType: 'json',
                                    url: riot_url+"/lol-gameflow/v1/gameflow-metadata/player-status",
                                    async: false,
                                    success: function(json) {
                                        currentGameQueueId = json["currentLobbyStatus"]["queueId"];
                                    }
                                });
                            }

                            // TFT Mode
                            if (currentGameQueueId == 1090 || currentGameQueueId == 1100) {
                                tftGameLength = 0;
                                tftRankSent = 0;
                                tftRankData = {};
                                tftCurrentData = {};

                                if(tftMode == 0) {
                                    tftMode = 1;
                                    _gaq.push(['_trackEvent', 'tft', 'opened']);

                                    // clearInterval(tftTimer);
                                    // tftTimer = null;
                                    // tftTimer = setInterval(function() { tftEndOfGame(riot_url); }, 2000);

                                    // Coming Soon....
                                    // if (tftTabId == 0) {
                                    //     chrome.tabs.create({url: "https://tft.lol"}, function(newTab) {
                                    //         tftTabId = newTab.id;
                                    //     });
                                    // } else {
                                    //     chrome.tabs.update(tftTabId, {url: "https://tft.lol", active:true, highlighted:true});
                                    // }
                                }
                            } else {
                                var cellLoc = json["localPlayerCellId"];
                                var lineType = "";
                                var summonerLevel = currentSummoner["summonerLevel"];

                                var myTeam = [];

                                if (team1.includes(cellLoc)) {
                                    myTeam = team1;
                                } else {
                                    myTeam = team2;
                                }

                                for (var i = 0; i < json["myTeam"].length; i++) {
                                    if (json["myTeam"][i]["cellId"] == cellLoc) {
                                        switch (json["myTeam"][i]["assignedPosition"]) {
                                            case "TOP":
                                                lineType = "top"
                                                break
                                            case "JUNGLE":
                                                lineType = "jungle"
                                                break
                                            case "MIDDLE":
                                                lineType = "mid"
                                                break
                                            case "BOTTOM":
                                                lineType = "bot"
                                                break
                                            case "UTILITY":
                                                lineType = "support"
                                                break
                                            default:
                                                lineType = ""
                                        }
                                    }
                                }

                                if (isBanAllowed) {
                                    if (json["actions"].length !== 0) {
                                        if (json["actions"][0][0]["type"] == "ban") {
                                            actions = json["actions"]

                                            if (isFirstRun) {
                                                _gaq.push(['_trackEvent', 'banpick_ranked', 'opened']);

                                                chrome.tabs.create({url: "https://www.op.gg/banpick"}, function(newTab) {
                                                    banpickTabId = newTab.id;

                                                    chrome.windows.create({
                                                        tabId: banpickTabId,
                                                        type: 'popup',
                                                        focused: true,
                                                        width: 500,
                                                        height: 950,
                                                        top: 50,
                                                        left: 0,
                                                    }, function(newWindow){
                                                        // console.log(newWindow);
                                                    });

                                                    isFirstRun = false;
                                                    var summonerNames = [];
                                                    var summonerLines = [];
                                                    var recent20games = [];
                                                    var recent10games = [];
                                                    var allGames = [];
                                                    var puuids = [];
                                                    var victories = [];
                                                    var rankedStats = [];
                                                    var lanes = [];
                                                    var cellIds = [];
                                                    var selfLoc = 0;
                                                    var masteries = [];

                                                    if (cellLoc >= 5) {
                                                        selfLoc = cellLoc - 5
                                                    } else {
                                                        selfLoc = cellLoc
                                                    }

                                                    for (var i = 0; i < json["myTeam"].length; i++) {
                                                        var puuid = "";
                                                        var rankedStat = "";

                                                        $.ajax({
                                                            type: "GET",
                                                            async: false,
                                                            dataType: 'json',
                                                            url: riot_url+"/lol-summoner/v1/summoners/"+json["myTeam"][i]["summonerId"],
                                                            success: function(data) {
                                                                puuid = data["puuid"];
                                                                puuids.push(puuid);
                                                                
                                                                $.ajax({
                                                                    type: 'GET',
                                                                    async: false,
                                                                    dataType: 'json',
                                                                    url: riot_url+'/lol-ranked/v1/ranked-stats/'+json["myTeam"][i]["summonerId"],
                                                                    success:function(data) {
                                                                        for (var q = 0; q < data["queues"].length; q++) {
                                                                            var tmpRankedStat = [];
                                                                            if (data["queues"][q]["queueType"] == "SOLO5V5") {
                                                                                if (data["queues"][q]["tier"] == "NONE") {
                                                                                    rankedStat = "Unranked";
                                                                                } else {
                                                                                    if (data["queues"][q]["division"] == "NA") {
                                                                                        tmpRankedStat = [data["queues"][q]["tier"], "", data["queues"][q]["leaguePoints"]];
                                                                                    } else {
                                                                                        tmpRankedStat = [data["queues"][q]["tier"], data["queues"][q]["division"], data["queues"][q]["leaguePoints"]];
                                                                                    }
                                                                                }
                                                                                rankedStats.push(tmpRankedStat);
                                                                                break;
                                                                            }
                                                                        }
                                                                    }
                                                                });

                                                                $.ajax({
                                                                    type: 'GET',
                                                                    async: false,
                                                                    dataType: 'json',
                                                                    url: riot_url+'/lol-career-stats/v1/summoner-games/'+puuid,
                                                                    success:function(data) {
                                                                        var cnt = 0;
                                                                        var cnt_10 = 0;
                                                                        var tmpGames = [];
                                                                        var tmpRecent = [];
                                                                        var won = 0;
                                                                        var tmpvictories = [];
                                                                        var tmplanes = {"BOTTOM":0, "MID":0, "TOP":0, "JUNGLE":0, "SUPPORT":0, "UNKNOWN":0, "ALL":0, "NONE":0};
                                                                        var tmpGames2 = [];

                                                                        data = data.reverse();
                                                                        for (var q = 0; q < data.length; q++) {
                                                                            if (cnt == 20) {
                                                                                break;
                                                                            }
                                                                            
                                                                            if (data[q]["queueType"] == "rank5solo") {
                                                                                if (cnt_10 < 10) {
                                                                                    if (data[q]["stats"]['CareerStats.js']["victory"] == 1) {
                                                                                        won += 1;
                                                                                        tmpvictories.push(1);
                                                                                    } else {
                                                                                        tmpvictories.push(0);
                                                                                    }

                                                                                    tmplanes[data[q]["lane"]] += 1;
                                                                                }

                                                                                tmpGames.push(data[q]);
                                                                                cnt += 1;
                                                                                cnt_10 += 1;
                                                                            }
                                                                        }
                                                                        lanes.push(tmplanes);
                                                                        victories.push(tmpvictories);
                                                                        recent20games.push(tmpGames);

                                                                        for (var q = 0; q < data.length; q++) {
                                                                            if (data[q]["queueType"] == "rank5solo") {
                                                                                tmpGames2.push(data[q]);
                                                                            }
                                                                        }

                                                                        allGames.push(tmpGames2);
                                                                    }
                                                                });

                                                                $.ajax({
                                                                    type: 'GET',
                                                                    async: false,
                                                                    dataType: 'json',
                                                                    url: riot_url+'/lol-collections/v1/inventories/'+json["myTeam"][i]["summonerId"]+'/champion-mastery',
                                                                    success: function(data) {
                                                                        masteries.push(data);
                                                                    }
                                                                });

                                                                cellIds.push(json["myTeam"][i]["cellId"]);
                                                                summonerNames.push(data["internalName"]);
                                                                summonerLines.push(json["myTeam"][i]["assignedPosition"]);
                                                            }
                                                        });
                                                    }

                                                    summonerNamesString = JSON.stringify(summonerNames);
                                                    summonerLinesString = JSON.stringify(summonerLines);
                                                    cellIdsString = JSON.stringify(cellIds);
                                                    rankedStatsString = JSON.stringify(rankedStats);
                                                    recent20gamesString = JSON.stringify(recent20games);
                                                    victoriesString = JSON.stringify(victories);
                                                    lanesString = JSON.stringify(lanes);
                                                    masteriesString = JSON.stringify(masteries);
                                                    allGamesString = JSON.stringify(allGames);
                                                    
                                                    chrome.tabs.executeScript(banpickTabId, {
                                                        "code": "var myScript = document.createElement('script');"
                                                            + 'myScript.textContent = \'updateSummoner('+summonerNamesString+', '+summonerLinesString+', '+cellIdsString+', \"'+summonerNames[selfLoc]+'\", '+selfLoc+', '+rankedStatsString+', '+recent20gamesString+', '+victoriesString+', '+lanesString+', '+masteriesString+', '+allGamesString+');\';'
                                                            + "document.head.appendChild(myScript);"
                                                    });
                                                    // console.log(summonerNames, summonerLines, cellIds, summonerNames[selfLoc], rankedStats, recent20games, victories, lanes, masteries, allGames);
                                                });
                                            }


                                            for (var i = 0; i < actions.length; i++) {
                                                action = actions[i]
                                                for (var k = 0; k < action.length; k++) {
                                                    event = action[k]

                                                    if (prevActions) {
                                                        prevEvent = prevActions[i][k]
                                                    }

                                                    if (event["type"] == "ban") {
                                                        if (prevActions) {
                                                            if (event["completed"] != prevEvent["completed"]) {
                                                                if (myTeam.includes(event["actorCellId"])) {
                                                                    // console.log("ban", "my", event["championId"], event["actorCellId"]);
                                                                    updateBan(banpickTabId, "my", event["actorCellId"], event["championId"]);
                                                                } else {
                                                                    // console.log("ban", "their", event["championId"], event["actorCellId"]);
                                                                    updateBan(banpickTabId, "their", event["actorCellId"], event["championId"]);
                                                                }
                                                            }
                                                        }
                                                    }

                                                    if (event["type"] == "pick") {
                                                        if (prevActions) {
                                                            if (event["completed"] != prevEvent["completed"]) {
                                                                if (myTeam.includes(event["actorCellId"])) {
                                                                    // console.log("pick", "my", event["championId"], event["actorCellId"]);
                                                                    updatePick(banpickTabId, "my", event["actorCellId"], event["championId"]);
                                                                } else {
                                                                    // console.log("pick", "their", event["championId"], event["actorCellId"]);
                                                                    updatePick(banpickTabId, "their", event["actorCellId"], event["championId"]);
                                                                }
                                                            }   
                                                        }
                                                    }
                                                }
                                            }

                                            prevActions = actions;
                                        }
                                    }
                                }
                                
                                
                                if (json["actions"].length !== 0) {
                                    for (var i = 0; i < json["actions"][0].length; i++) {
                                        // ranked game
                                        if (json["actions"][0][i]["type"] == "ban") {
                                            for (var k = 0; k < json["myTeam"].length; k++) {
                                                if (json["myTeam"][k]["cellId"] == cellLoc) {
                                                    gameType = "ranked";
                                                    if(json["myTeam"][k]["championPickIntent"] == 0) {
                                                        for (var m = 0; m < json["actions"].length; m++) {
                                                            var champFound = false;
                                                            var isAram = false;
                                                            for (var n = 0; n < json["actions"][m].length; n++) {
                                                                if (json["actions"][m][n]["type"] == "pick" && json["actions"][m][n]["actorCellId"] == cellLoc) {
                                                                    if(currentChampionId != json["actions"][m][n]["championId"]) {
                                                                        currentChampionId = json["actions"][m][n]["championId"];
                                                                        championName = openChampionTab(currentChampionId, lineType, gameType);    
                                                                        
                                                                        if (isAutoRuneAllowed) {
                                                                            if (summonerLevel >= minRuneLevel) {
                                                                                updatePerkPages(championName);
                                                                            }
                                                                            
                                                                        }

                                                                        if (isItemRecommendAllowed) {
                                                                            parseChampion(championName, "item", currentChampionId);
                                                                        }

                                                                        champFound = true;
                                                                        isAram = false;
                                                                        
                                                                        break;
                                                                    }
                                                                } else {
                                                                    isAram = true;
                                                                }
                                                            }

                                                            // aram
                                                            if (isAram) {
                                                                if (json["myTeam"][k]["championId"] != 0 && currentChampionId != json["myTeam"][k]["championId"]) {
                                                                    gameType = "aram";
                                                                    currentChampionId = json["myTeam"][k]["championId"];
                                                                    championName = openChampionTab(currentChampionId, lineType, gameType);
                                                                    if (isAutoRuneAllowed) {
                                                                        if (summonerLevel >= minRuneLevel) {
                                                                            updatePerkPages(championName);
                                                                        }
                                                                    }

                                                                    if (isItemRecommendAllowed) {
                                                                        parseChampion(championName, "item", currentChampionId);
                                                                    }

                                                                    break;
                                                                }
                                                            }

                                                            if (champFound) {
                                                                break;
                                                            }
                                                        }
                                                    } else if (currentChampionId != json["myTeam"][k]["championPickIntent"]) {
                                                        currentChampionId = json["myTeam"][k]["championPickIntent"];
                                                        championName = openChampionTab(currentChampionId, lineType, gameType);
                                                        if (isAutoRuneAllowed) {
                                                            if (summonerLevel >= minRuneLevel) {
                                                                updatePerkPages(championName);
                                                            }
                                                        }

                                                        if (isItemRecommendAllowed) {
                                                            parseChampion(championName, "item", currentChampionId);
                                                        }

                                                        break;
                                                    }
                                                } 
                                            }

                                            break;
                                        } else { 
                                        // normal
                                            if (json["actions"][0][i]["actorCellId"] == cellLoc) {
                                                if (currentChampionId != json["actions"][0][i]["championId"]) {
                                                    currentChampionId = json["actions"][0][i]["championId"];
                                                    gameType = "normal";
                                                    championName = openChampionTab(currentChampionId, lineType, gameType);
                                                    if (isAutoRuneAllowed) {
                                                        if (summonerLevel >= minRuneLevel) {
                                                            updatePerkPages(championName);
                                                        }
                                                    }

                                                    if (isItemRecommendAllowed) {
                                                        parseChampion(championName, "item", currentChampionId);
                                                    }

                                                    break;
                                                }
                                            }
                                        }
                                    }
                                } else { 
                                // aram legacy
                                    for (var i = 0; i < json["myTeam"].length; i++) {
                                        if(json["myTeam"][i]["cellId"] == cellLoc) {
                                            if (currentChampionId != json["myTeam"][i]["championId"]) {
                                                currentChampionId = json["myTeam"][i]["championId"];

                                                var isUrf = false;
                                                gameType = "aram";

                                                if (currentGameQueueId == 900) {
                                                    gameType = "urf";
                                                    isUrf = true
                                                }

                                                championName = openChampionTab(currentChampionId, lineType, gameType, isUrf);
                                                if (isAutoRuneAllowed) {
                                                    if (summonerLevel >= minRuneLevel) {
                                                        updatePerkPages(championName, isUrf);
                                                    }
                                                }

                                                if (isItemRecommendAllowed) {
                                                    parseChampion(championName, "item", currentChampionId, isUrf);
                                                }

                                                break;
                                            }
                                        }
                                    }
                                }

                                var roomName = json["chatDetails"]["chatRoomName"];
                                if(roomName != prevRoomName) {
                                    var summonerIds = [];
                                    var summonerid_one = "";

                                    myTeam = json["myTeam"];
                                    for (var i = 0; i < myTeam.length; i++) {
                                        summonerId = myTeam[i]["summonerId"];
                                        summonerIds.push(summonerId);
                                        
                                        $.ajax({
                                            type: "GET",
                                            async: false,
                                            dataType: 'json',
                                            url: riot_url+"/lol-summoner/v1/summoners/"+summonerId,
                                            success: function(json) {
                                                internalName = json["internalName"];
                                                summonerid_one += internalName + ", ";
                                            }
                                        });
                                    }

                                    chrome.windows.getAll(function(windows) {
                                        if (windows.length == 0) {
                                            chrome.windows.create({url: "chrome://newtab"});
                                        }
                                        if (gameType == "") {
                                            gameType = "normal";
                                        }

                                        if (isMultisearchAllowed) {
                                            _gaq.push(['_trackEvent', 'multisearch_'+gameType, 'opened']);
                                            if (multiSearchTabId == 0) {
                                                chrome.tabs.create({url: "https://"+region+".op.gg/multi/query="+summonerid_one}, function(newTab) {
                                                    multiSearchTabId = newTab.id;
                                                });
                                            } else {
                                                chrome.tabs.update(multiSearchTabId, {url: "https://"+region+".op.gg/multi/query="+summonerid_one, active:true, highlighted:true});
                                            }
                                        }
                                    });

                                    prevRoomName = roomName;
                                }
                            }
                        },
                        error: function(res) {
                            chrome.storage.local.set({fileurl: true});
                            chrome.storage.local.set({localhost: "on"});
                            // console.log('game not started');
                            currentChampionId = 0;
                            prevRoomName = "";
                            currentGameQueueId = 0;
                            prevActions = "";
                            isFirstRun = true;
                            tftMode = 0;
                        }
                    });
                }
            });
        },
        error: function(res) {
            clearInterval(r);
            r = null;
            t = setInterval(isLeagueClientOpened, refresh_rate);
        }
    });
}

function isLeagueClientOpened() {
    $.ajax({
        type: "GET",
        url: "file://"+riot_path+"/Logs/LeagueClient Logs",
        success: function(res) {
            chrome.storage.local.set({fileurl: true});
            files = res.split('<script>addRow("')
            for(var i = files.length-1; i > files.length-8; i--) {
                file = files[i].split('"')[0];
                if(file.indexOf('LeagueClientUx.log') > 0) {
                    $.ajax({
                        type: "GET",
                        url: "file://"+riot_path+"/Logs/LeagueClient Logs/"+file,
                        success: function(res) {
                            try {
                                riot_url = res.split('https://riot:')[1].split('/')[0]
                                riot_url = 'https://riot:'+riot_url
                                $.ajax({
                                    type: "GET",
                                    url: riot_url+"/riotclient/auth-token",
                                    success: function(res) {
                                        chrome.storage.local.set({localhost: "on"});
                                        r = setInterval(function() { leagueClientRunning(riot_url); }, refresh_rate);
                                        clearInterval(t);
                                        t = null;
                                    },
                                    error: function(res, status, error) {
                                        currentSummoner = {};
                                        prevRoomName = "";
                                    }
                                });
                            }
                            catch(err) {
                            }
                        }
                    });

                    break;
                }
            }
        },
        error: function(err) {
            if (directoryWrong == false && isFileUrlAllowed == true) {
                directoryWrong = true;
                // alert(chrome.i18n.getMessage("pathError")+riot_path);
            }
        }
    });
}

chrome.runtime.getPlatformInfo(function(info) {
    if (info.os == "win") {
        chrome.storage.local.get(['riot_path'], function(data) {
            if (data.riot_path == null) {
                chrome.storage.local.set({riot_path: riot_path});
            } else {
                riot_path = data.riot_path;
            }
        });
    } else if (info.os == "mac") {
        riot_path = "/Applications/League of Legends.app/Contents/LoL";
    } else {
        console.log("os not supported");
    }
});

chrome.storage.local.get(['region'], function(data) {
    if (data.region == "detection") {
        region = "";
    } else if (data.region == "www") {
        chrome.storage.local.get(['notice_kr_server_down'], function(data) {
            if (data.notice_kr_server_down == 1 || data.notice_kr_server_down == undefined) {
                chrome.storage.local.set({notice_kr_server_down: 0});
                // chrome.tabs.create({url: "https://talk.op.gg/s/lol/opgg/959208"}, function(newTab) {});
            }
        });
        region = data.region;
    } else if (data.region != null) {
        region = data.region;
    }
});

chrome.storage.local.get(['state'], function(data) {
    if (data.state == null) {
        chrome.storage.local.set({state: 'on'});
        t = setInterval(isLeagueClientOpened, refresh_rate);
    } else if (data.state == "on") {
        t = setInterval(isLeagueClientOpened, refresh_rate);
    }
});

chrome.storage.local.get(['rune'], function(data) {
    if (data.rune == null) {
        chrome.storage.local.set({rune: 'off'});
    } else if (data.rune == "off") {
        isAutoRuneAllowed = false;
    } else {
        isAutoRuneAllowed = true;
    }
});

chrome.storage.local.get(['multisearch'], function(data) {
    if (data.multisearch == null) {
        chrome.storage.local.set({multisearch: 'on'});
    } else if (data.multisearch == "off") {
        isMultisearchAllowed = false;
    }
});

chrome.storage.local.get(['champion'], function(data) {
    if (data.champion == null) {
        chrome.storage.local.set({champion: 'on'});
    } else if (data.champion == "off") {
        isChampionAllowed = false;
    }
});

chrome.storage.local.get(['items'], function(data) {
    if (data.items == null) {
        chrome.storage.local.set({items: 'off'});
    } else if (data.items == "off") {
        isItemRecommendAllowed = false;
    } else {
        isItemRecommendAllowed = true;
    }
});

chrome.storage.local.get(['ban'], function(data) {
	if (data.ban == null) {
        chrome.storage.local.set({ban: 'on'});
    } else if (data.ban == "off") {
        isBanAllowed = false;
    } else {
        isBanAllowed = true;
    }
});

chrome.storage.local.get(['refresh_rate'], function(data) {
    if (data.refresh_rate == null) {
        chrome.storage.local.set({
            "refersh_rate": 2000
        });
        refresh_rate = 2000;
    } else {
        refresh_rate = data.refresh_rate;
    }
});

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.cmd === 'ext_off') {
        chrome.storage.local.set({state: 'off'});
        clearInterval(t);
        t = null;

        clearInterval(r);
        r = null;
    } else if (request.cmd === 'ext_on') {
        chrome.storage.local.set({state: 'on'});
        t = setInterval(isLeagueClientOpened, refresh_rate);
    } else if (request.cmd === 'changeDirectory') {
        riot_path = request.data.riot_path;
        clearInterval(t);
        t = null;

        clearInterval(r);
        r = null;
        t = setInterval(isLeagueClientOpened, refresh_rate);
    } else if (request.cmd === "changeRegion") {
        region = request.data.region;
        if (region === "detection") {
            region = "";
        }
    } else if (request.cmd === "rune_on") {
        isAutoRuneAllowed = true;
    } else if (request.cmd === "rune_off") {
        isAutoRuneAllowed = false;
    } else if (request.cmd === "multi_on") {
        isMultisearchAllowed = true;
    } else if (request.cmd === "multi_off") {
        isMultisearchAllowed = false;
    } else if (request.cmd === "champ_on") {
        isChampionAllowed = true;
    } else if (request.cmd === "champ_off") {
        isChampionAllowed = false;
    } else if (request.cmd === "items_on") {
        isItemRecommendAllowed = true;
    } else if (request.cmd === "items_off") {
        isItemRecommendAllowed = false;
    } else if (request.cmd === "ban_on") {
    	isBanAllowed = true;
    } else if (request.cmd === "ban_off") {
    	isBanAllowed = false;
    } else if (request.cmd === "refresh-rate-changed") {
        clearInterval(t);
        t = null;
        clearInterval(r);
        r = null;
        chrome.storage.local.get(['refresh_rate'], function(data) {
            if (data.refresh_rate == null) {
                chrome.storage.local.set({
                    "refersh_rate": 2000
                });
                refresh_rate = 2000;
                t = setInterval(isLeagueClientOpened, data.refresh_rate);
            } else {
                refresh_rate = data.refresh_rate;
                t = setInterval(isLeagueClientOpened, data.refresh_rate);
            }
        });
    }
});

chrome.tabs.onRemoved.addListener(function(tabId) {
    switch (tabId) {
        case multiSearchTabId:
            multiSearchTabId = 0;
            break;

        case championSearchTabId:
            championSearchTabId = 0;
            break;

        case settingsTabId:
            settingsTabId = 0;
            break;

        case banpickTabId:
            banpickTabId = 0;
            break;
        case tftTabId:
            tftTabId = 0;
            break
    }
});

chrome.webRequest.onErrorOccurred.addListener(function(details) {
    if (details["error"] == "net::ERR_CONNECTION_REFUSED") {
        isSettingMessage = false;
    } else if (details["error"] == "net::ERR_CERT_AUTHORITY_INVALID") {
        isLocalhostAllowed = false;
        chrome.storage.local.set({localhost: "off"});

        if (!isSettingMessage) {
            alert(chrome.i18n.getMessage("checkSettings"));
            isSettingMessage = true;
        }
    }
}, {urls: ["https://127.0.0.1:*/*"]});

chrome.extension.isAllowedFileSchemeAccess(function(isAllowedAccess) {
    if (!isAllowedAccess) {
        chrome.storage.local.set({fileurl: false});
        if (!isSettingMessage2) {
            alert(chrome.i18n.getMessage("checkSettings"));
            isSettingMessage2 = true;
        }
    } else {
        isSettingMessage2 = false;
    }
});

chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
	if (request) {
		if (request.message) {
			if (request.message == "version") {
				sendResponse({version: chrome.runtime.getManifest().version});
			} else if(request.message == "addFriend") {

				var freindRequest = {
					"direction": "in",
					"id": 0,
					"name": request.summoner,
					"note": ""
				}
				freindRequest = JSON.stringify(freindRequest);

				$.ajax({
					type: 'POST',
					dataType: 'json',
					data: freindRequest,
					contentType: 'application/json',
					processData: false,
					url: riot_url+'/lol-chat/v1/friend-requests',
					success: function(json) {
						// console.log(json);
					},
					error: function(json) {

					}
				});

			}
		}
	}
	return true;
});