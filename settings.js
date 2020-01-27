var quick_menus = ['multisearch', 'champion', 'rune', 'items', 'ban'];

function remove(menu) {
	document.getElementById('img_'+menu).src = 'images/icon-add-o-none.png';
	document.getElementById('remove_'+menu).style.visibility = 'hidden';
	document.getElementById('add_'+menu).style.visibility = 'visible';

	var tmp = {};
	tmp[menu] = 'off';
	chrome.storage.local.set(tmp);
	chrome.extension.sendMessage({cmd: menu+"_off"});

	chrome.storage.local.get(['quick_menus'], function(items) {
		var tmp_quick_menus = items.quick_menus;
		var index = tmp_quick_menus.indexOf(menu);
		if (index > -1) {
			tmp_quick_menus.splice(index, 1);
		}

		chrome.storage.local.set({quick_menus: tmp_quick_menus});
	});
}

function add(menu) {
	document.getElementById('img_'+menu).src = 'images/icon-'+menu+'-o-none.png';
	document.getElementById('remove_'+menu).style.visibility = 'visible';
	document.getElementById('add_'+menu).style.visibility = 'hidden';

	var tmp = {};
	tmp[menu] = 'on';
	chrome.storage.local.set(tmp);
	chrome.extension.sendMessage({cmd: menu+"_on"});

	chrome.storage.local.get(['quick_menus'], function(items) {
		var tmp_quick_menus = items.quick_menus;
		tmp_quick_menus.push(menu);
		chrome.storage.local.set({quick_menus: tmp_quick_menus});
	});
}

function restore_options() {
	for (var i = 0; i < quick_menus.length; i++) {
		let menu = quick_menus[i];
		document.getElementById('img_'+menu).src = 'images/icon-add-o-none.png';
		document.getElementById('remove_'+menu).style.visibility = 'hidden';

		document.getElementById('remove_'+menu).addEventListener('click', function(){
			remove(menu);
		}, false);

		document.getElementById('add_'+menu).addEventListener('click', function(){
			add(menu);
		}, false);
	}

	chrome.storage.local.get(["quick_menus"], function(items) {
		if(items.quick_menus) {
			for (var i = 0; i < items.quick_menus.length; i++) {
				let tmp = items.quick_menus[i];
				document.getElementById('img_'+tmp).src = 'images/icon-'+tmp+'-o-none.png';
				document.getElementById('add_'+tmp).style.visibility = 'hidden';
				document.getElementById('remove_'+tmp).style.visibility = 'visible';
			}
		} else {
			chrome.storage.local.set({quick_menus: ["multisearch", "champion", "rune", "items", "ban"]});
		}
	});
}

document.addEventListener('DOMContentLoaded', restore_options);

document.getElementById('page_setting').addEventListener('click', function(){
	document.getElementById('page_setting').style.color = '#4c8cff';
	document.getElementById('page_guide').style.color = '#000';
	document.getElementById('page_help').style.color = '#000';
	document.getElementsByClassName('page_setting')[0].style.display = 'block';
	document.getElementsByClassName('page_guide')[0].style.display = 'none';
	document.getElementsByClassName('page_help')[0].style.display = 'none';
});
document.getElementById('page_guide').addEventListener('click', function(){
	document.getElementById('page_setting').style.color = '#000';
	document.getElementById('page_guide').style.color = '#4c8cff';
	document.getElementById('page_help').style.color = '#000';
	document.getElementsByClassName('page_setting')[0].style.display = 'none';
	document.getElementsByClassName('page_guide')[0].style.display = 'block';
	document.getElementsByClassName('page_help')[0].style.display = 'none';
});
document.getElementById('page_help').addEventListener('click', function(){
	document.getElementById('page_setting').style.color = '#000';
	document.getElementById('page_guide').style.color = '#000';
	document.getElementById('page_help').style.color = '#4c8cff';
	document.getElementsByClassName('page_setting')[0].style.display = 'none';
	document.getElementsByClassName('page_guide')[0].style.display = 'none';
	document.getElementsByClassName('page_help')[0].style.display = 'block';
});

document.getElementById('complete').addEventListener('click', function() {
	chrome.tabs.getCurrent(function(tab) {
		chrome.tabs.remove(tab.id, function(){});
	});
});

document.getElementById('cancel').addEventListener('click', function() {
	chrome.tabs.getCurrent(function(tab) {
		chrome.tabs.remove(tab.id, function(){});
	});
});