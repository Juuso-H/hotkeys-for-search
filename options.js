var background = chrome.extension.getBackgroundPage();

document.addEventListener('DOMContentLoaded', function()
{
	var eventNewTabChecked = new Event("change");

	// Get current hotkeys for displaying on the page
	chrome.commands.getAll(function(commands)
	{
		document.getElementById("shortcut1").textContent = commands[1].shortcut;
		document.getElementById("shortcut2").textContent = commands[2].shortcut;
		document.getElementById("shortcut3").textContent = commands[3].shortcut;
		document.getElementById("shortcut4").textContent = commands[4].shortcut;
	});


	// Populate options page with current values
	document.getElementById("search1").value = background.dict["search1"];
	document.getElementById("search2").value = background.dict["search2"];
	document.getElementById("search3").value = background.dict["search3"];
	document.getElementById("search4").value = background.dict["search4"];
	document.getElementById("openNewTab").checked = background.dict["openNewTab"];
	document.getElementById("openOnLeft").checked = background.dict["openOnLeft"];
	document.getElementById("openInBackground").checked = background.dict["openInBackground"];
	document.getElementById("openURLDirectly").checked = background.dict["openURLDirectly"];
	document.getElementById("openNewTab").dispatchEvent(eventNewTabChecked);
	enableNewTabSettings();

	// Get default values if Defaults button is clicked
	document.getElementById("Defaults").addEventListener("click", defaults, false);

	function defaults()
	{
		defaultSettings = background.getDefaultSettings();
		document.getElementById("search1").value = defaultSettings.search1;
		document.getElementById("search2").value = defaultSettings.search2;
		document.getElementById("search3").value = defaultSettings.search3;
		document.getElementById("search4").value = defaultSettings.search4;
		document.getElementById("openNewTab").checked = defaultSettings.openNewTab;
		document.getElementById("openOnLeft").checked = defaultSettings.openOnLeft;
		document.getElementById("openInBackground").checked = defaultSettings.openInBackground;
		document.getElementById("openURLDirectly").checked = defaultSettings.openURLDirectly;
		document.getElementById("openNewTab").dispatchEvent(eventNewTabChecked);
	}

	// Link to Chrome extensions page
	document.getElementById('shortcutsLink').addEventListener('click', function()
	{
		chrome.tabs.update(
		{
			url: 'chrome://extensions/shortcuts'
		});
		window.close();
	});

	// Save settings when closing options page
	addEventListener("unload", function(event)
	{
		background.dict["search1"] = document.getElementById("search1").value;
		background.dict["search2"] = document.getElementById("search2").value;
		background.dict["search3"] = document.getElementById("search3").value;
		background.dict["search4"] = document.getElementById("search4").value;
		background.dict["openNewTab"] = document.getElementById("openNewTab").checked;
		background.dict["openOnLeft"] = document.getElementById("openOnLeft").checked;
		background.dict["openInBackground"] = document.getElementById("openInBackground").checked;
		background.dict["openURLDirectly"] = document.getElementById("openURLDirectly").checked;
		background.chrome.storage.sync.set(
		{
			'dict': background.dict
		});
	}, true);

	document.getElementById("openNewTab").addEventListener("change", enableNewTabSettings, false);

	function enableNewTabSettings()
	{
		if (document.getElementById("openNewTab").checked == true)
		{
			document.getElementById("openOnLeft").disabled = false;
			document.getElementById("openOnLeftLabel").className = "";
			document.getElementById("openInBackground").disabled = false;
			document.getElementById("openInBackgroundLabel").className = "";
		}
		else
		{
			document.getElementById("openOnLeft").disabled = true;
			document.getElementById("openOnLeftLabel").className = "disabled";
			document.getElementById("openInBackground").disabled = true;
			document.getElementById("openInBackgroundLabel").className = "disabled";
		}
	}

});