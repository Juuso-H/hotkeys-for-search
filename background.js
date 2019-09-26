var tabId=0;
var url;
var dict = {};


// Get defaults if no saved values found in synced storage
chrome.storage.sync.get('dict', function(storageDict) {
	if (storageDict.search1 != null) {
		dict = storageDict;
	}
	else {
	    dict["search1"] = "https://www.google.com/search?q=";
		dict["search2"] = "https://en.wikipedia.org/wiki/Special:Search/";
		dict["search3"] = "https://www.google.com/search?&tbm=isch&q=";
		dict["search4"] = "https://www.youtube.com/results?search_query=";
		dict["openNewTab"] = "true";
		dict["openOnLeft"] = "false";
		dict["openInBackground"] = "false";
		chrome.storage.sync.set({'dict' : dict});
	}
});

// Save changed settings to synced storage
chrome.storage.onChanged.addListener(function(changes, namespace) {
for (key in changes) {
  dict[key] = changes[key];
}
});

// Listen to keyboard hotkeys
chrome.commands.onCommand.addListener(function(command) {
	chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
		tabId = tabs[0].index;
	});

	// Select search site according to hotkey pressed
	switch (command) {
		case "search1":
	    	url = dict["search1"];
	    	break;
		case "search2":
	    	url = dict["search2"];
	    	break;
		case "search3":
	    	url = dict["search3"];
	    	break;
		case "search4":
	    	url = dict["search4"];
	    	break;
	}

	// Get selected string from current tab
	if (url != "") chrome.tabs.executeScript(null, {code:"window.getSelection().toString()"}, 
		function(result){ 
			if (result != ""){
				var newURL = url + result;
				var active;
				// Open result in current or new tab
				if (dict["openInBackground"] == "true") active = false;
				else active = true;
				if (dict["openNewTab"] == "true") {
					if (dict["openOnLeft"] == "true") chrome.tabs.create({ index: tabId, url: newURL, active: active});
					else chrome.tabs.create({ index: tabId + 1, url: newURL, active: active});
				}
				else chrome.tabs.update({url: newURL});	
			}
		});
});
