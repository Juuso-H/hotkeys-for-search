document.addEventListener('DOMContentLoaded', function () {
	var eventNewTabChecked = new Event("change");

	// Save settings with debounce when changing values on options page
	// From StackOverflow
	//https://stackoverflow.com/questions/60361379/how-to-get-chrome-storage-to-save-on-chrome-extension-popup-close
	const STORAGE_SELECTOR = '.storage[id]';
	let debounceTimer;
	document.addEventListener('change', saveOnChange);
	document.addEventListener('input', saveOnChange);

	function saveOnChange(e) {
		if (e.target.closest(STORAGE_SELECTOR)) {
			clearTimeout(debounceTimer);
			debounceTimer = setTimeout(doSave, 100);
		}
	}

	function collectData() {
		const data = {};
		for (const el of document.querySelectorAll(STORAGE_SELECTOR))
			data[el.id] = el.type === 'checkbox' ? el.checked : el.value;
		return data;
	}

	function doSave() {
		chrome.runtime.sendMessage({
			action: "saveSettings",
			settings: collectData()
		});
	}

	// Function to populate options page with given settings
	function populateOptions(settings) {
		document.getElementById("search1").value = settings["search1"];
		document.getElementById("search2").value = settings["search2"];
		document.getElementById("search3").value = settings["search3"];
		document.getElementById("search4").value = settings["search4"];
		document.getElementById("openNewTab").checked = settings["openNewTab"];
		document.getElementById("openOnLeft").checked = settings["openOnLeft"];
		document.getElementById("openInBackground").checked = settings["openInBackground"];
		document.getElementById("openURLDirectly").checked = settings["openURLDirectly"];
		document.getElementById("openNewTab").dispatchEvent(eventNewTabChecked);
		enableNewTabSettings();
	}

	// Get current hotkeys for displaying on the page
	chrome.commands.getAll(function (commands) {
		document.getElementById("shortcut1").textContent = commands[1].shortcut;
		document.getElementById("shortcut2").textContent = commands[2].shortcut;
		document.getElementById("shortcut3").textContent = commands[3].shortcut;
		document.getElementById("shortcut4").textContent = commands[4].shortcut;
	});

	// Request current settings from background script
	chrome.runtime.sendMessage({ action: "getSettings" }, function (response) {
		if (response && response.settings) {
			populateOptions(response.settings);
		}
	});

	// Get default values if Defaults button is clicked
	document.getElementById("Defaults").addEventListener("click", defaults, false);

	function defaults() {
		chrome.runtime.sendMessage({ action: "getDefaultSettings" }, function (response) {
			if (response && response.defaultSettings) {
				populateOptions(response.defaultSettings);
			}
		});
	}

	// Link to Chrome extensions page
	document.getElementById('shortcutsLink').addEventListener('click', function () {
		chrome.tabs.update({
			url: 'chrome://extensions/shortcuts'
		});
		window.close();
	});

	document.getElementById("openNewTab").addEventListener("change", enableNewTabSettings, false);

	function enableNewTabSettings() {
		if (document.getElementById("openNewTab").checked == true) {
			document.getElementById("openOnLeft").disabled = false;
			document.getElementById("openOnLeftLabel").className = "";
			document.getElementById("openInBackground").disabled = false;
			document.getElementById("openInBackgroundLabel").className = "";
		} else {
			document.getElementById("openOnLeft").disabled = true;
			document.getElementById("openOnLeftLabel").className = "disabled";
			document.getElementById("openInBackground").disabled = true;
			document.getElementById("openInBackgroundLabel").className = "disabled";
		}
	}
});