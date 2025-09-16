function getDefaultSettings() {
	var defaultSettings = {};
	defaultSettings["search1"] = "https://www.google.com/search?q=";
	defaultSettings["search2"] = "https://en.wikipedia.org/wiki/Special:Search/";
	defaultSettings["search3"] = "https://www.google.com/search?&tbm=isch&q=";
	defaultSettings["search4"] = "https://www.youtube.com/results?search_query=";
	defaultSettings["openNewTab"] = true;
	defaultSettings["openOnLeft"] = false;
	defaultSettings["openInBackground"] = false;
	defaultSettings["openURLDirectly"] = false;
	return defaultSettings;
}

// Check if string is a valid URL
// From StackOverflow
// https://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-a-url
function validURL(str) {
	var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
		'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
		'((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
		'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
		'(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
		'(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
	return !!pattern.test(str);
}

chrome.runtime.onInstalled.addListener(function (details) {
	chrome.storage.sync.get('dict', function (storageDict) {
		if (storageDict.search1 != null) { // Check for old format settings
			const oldSettings = {
				"search1": storageDict.search1,
				"search2": storageDict.search2,
				"search3": storageDict.search3,
				"search4": storageDict.search4,
				"openNewTab": (storageDict.openNewTab == "true"),
				"openOnLeft": (storageDict.openOnLeft == "true"),
				"openInBackground": (storageDict.openInBackground == "true"),
				"openURLDirectly": false
			};
			chrome.storage.sync.set({ 'dict': oldSettings });
		} else if (storageDict.dict == null) { // If no settings, set defaults
			chrome.storage.sync.set({ 'dict': getDefaultSettings() });
		}
	});
});

// Listen to keyboard hotkeys
chrome.commands.onCommand.addListener(function (command) {
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		const tab = tabs[0];
		chrome.storage.sync.get('dict', function (storageDict) {
			const currentSettings = storageDict.dict;
			var searchURL;
			// Select search site according to hotkey pressed
			switch (command) {
				case "search1":
					searchURL = currentSettings["search1"];
					break;
				case "search2":
					searchURL = currentSettings["search2"];
					break;
				case "search3":
					searchURL = currentSettings["search3"];
					break;
				case "search4":
					searchURL = currentSettings["search4"];
					break;
			}

			// Get selected string from current tab
			if (searchURL != "") {
				chrome.scripting.executeScript(
					{
						target: { tabId: tab.id },
						function: () => window.getSelection().toString(),
					},
					(injectionResults) => {
						const selectedText = injectionResults[0].result;
						if (selectedText != "") {
							var targetURL;
							if (currentSettings["openURLDirectly"] && validURL(selectedText.toString())) {
								targetURL = selectedText.toString();
								if (!targetURL.startsWith("http")) {
									targetURL = "https://" + targetURL;
								}
							} else {
								targetURL = searchURL + selectedText;
							}
							// Open result in current or new tab
							if (currentSettings["openNewTab"]) {
								// Get index of current tab for correct positioning of new tab
								chrome.tabs.query(
									{
										currentWindow: true,
										active: true
									}, function (tabs) {
										var targetTabIndex = tabs[0].index;
										if (!currentSettings["openOnLeft"]) {
											targetTabIndex++;
										}
										chrome.tabs.create(
											{
												index: targetTabIndex,
												url: targetURL,
												active: !currentSettings["openInBackground"]
											});
									});
							} else {
								chrome.tabs.update(tab.id, { url: targetURL });
							}
						}
					});
			}
		});
	});
});

// Listen for messages from options page
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === "getSettings") {
		chrome.storage.sync.get('dict', function (storageDict) {
			sendResponse({ settings: storageDict.dict });
		});
		return true;
	} else if (request.action === "getDefaultSettings") {
		var defaults = getDefaultSettings();
		chrome.storage.sync.set({ 'dict': defaults });
		sendResponse({ defaultSettings: defaults });
	} else if (request.action === "saveSettings") {
		chrome.storage.sync.set({ 'dict': request.settings });
	}
});