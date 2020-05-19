var dict = {};

function getDefaultSettings()
{
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
function validURL(str)
{
	var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
		'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
		'((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
		'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
		'(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
		'(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
	return !!pattern.test(str);
}

chrome.runtime.onInstalled.addListener(function(details)
{
	chrome.storage.sync.get('dict', function(storageDict)
	{
		// Copy settings from old version to new
		if (storageDict.search1 != null)
		{
			storageDict.openNewTab = (storageDict.openNewTab == "true");
			storageDict.openOnLeft = (storageDict.openOnLeft == "true");
			storageDict.openInBackground = (storageDict.openInBackground == "true");
			storageDict.openURLDirectly = false;
			dict = storageDict;
		}
		// Get stored settings or defaults
		else if (storageDict.dict != null)
		{
			dict = storageDict.dict;
		}
		else
		{
			dict = getDefaultSettings();
		}

	});
});

chrome.runtime.onStartup.addListener(function()
{
	// Get stored settings or defaults
	chrome.storage.sync.get('dict', function(storageDict)
	{
		if (storageDict.dict != null)
		{
			dict = storageDict.dict;
		}
		else
		{
			dict = getDefaultSettings();
		}
	});
})

// Get changes of stored settings
chrome.storage.onChanged.addListener(function(changes, namespace)
{
	for (key in changes)
	{
		dict[key] = changes[key];
	}
});

// Listen to keyboard hotkeys
chrome.commands.onCommand.addListener(function(command)
{
	var searchURL;
	// Select search site according to hotkey pressed
	switch (command)
	{
		case "search1":
			searchURL = dict["search1"];
			break;
		case "search2":
			searchURL = dict["search2"];
			break;
		case "search3":
			searchURL = dict["search3"];
			break;
		case "search4":
			searchURL = dict["search4"];
			break;
	}

	// Get selected string from current tab
	if (searchURL != "")
	{
		chrome.tabs.executeScript(null,
			{
				code: "window.getSelection().toString()"
			},
			function(selectedText)
			{
				if (selectedText != "")
				{
					var targetURL;
					if (dict["openURLDirectly"] && validURL(selectedText.toString()))
					{
						targetURL = selectedText.toString();
						if (!targetURL.startsWith("http"))
						{
							targetURL = "https://" + targetURL;
						}
					}
					else
					{
						targetURL = searchURL + selectedText;
					}
					// Open result in current or new tab
					if (dict["openNewTab"])
					{
						// Get index of current tab for correct positioning of new tab
						chrome.tabs.query(
						{
							currentWindow: true,
							active: true
						}, function(tabs)
						{
							var targetTabIndex = tabs[0].index;
							if (!dict["openOnLeft"])
							{
								targetTabIndex++;
							}
							chrome.tabs.create(
							{
								index: targetTabIndex,
								url: targetURL,
								active: !dict["openInBackground"]
							});
						});
					}
					else
					{
						chrome.tabs.update(
						{
							url: targetURL
						});
					}
				}
			});
	}
});