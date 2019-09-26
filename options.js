var background = chrome.extension.getBackgroundPage();

document.addEventListener('DOMContentLoaded', function() {

	var eventChange = new Event('change');

	// Populate options page with current values
	document.getElementById("search1").value = background.dict["search1"];
	document.getElementById("search2").value = background.dict["search2"];
	document.getElementById("search3").value = background.dict["search3"];
	document.getElementById("search4").value = background.dict["search4"];
	if (background.dict["openNewTab"] == "true") document.getElementById("openNewTab").checked = true;
	else document.getElementById("openNewTab").checked = false;
	if (background.dict["openOnLeft"] == "true") document.getElementById("openOnLeft").checked = true;
	else document.getElementById("openOnLeft").checked = false;
	if (background.dict["openInBackground"] == "true") document.getElementById("openInBackground").checked = true;
	else document.getElementById("openInBackground").checked = false;
	document.getElementById("openNewTab").dispatchEvent(eventChange);
    
    // Get default values if Defaults button is clicked
    document.getElementById("Defaults").addEventListener("click", defaults, false);
    function defaults() {
	    document.getElementById("search1").value = "https://www.google.com/search?q=";
		document.getElementById("search2").value = "https://en.wikipedia.org/wiki/Special:Search/";
		document.getElementById("search3").value = "https://www.google.com/search?&tbm=isch&q=";
		document.getElementById("search4").value = "https://www.youtube.com/results?search_query=";
		document.getElementById("openNewTab").checked = true;
		document.getElementById("openOnLeft").checked = false;
		document.getElementById("openInBackground").checked = false;
		document.getElementById("openNewTab").dispatchEvent(eventChange);
	}

	// Link to Chrome extensions page
	document.getElementById('shortcutsLink').addEventListener('click', function() {
        chrome.tabs.update({ url: 'chrome://extensions/shortcuts'});
        window.close();
    });

	// Save settings when closing options page
	addEventListener("unload", function (event) {
        background.dict["search1"] = document.getElementById("search1").value;
    	background.dict["search2"] = document.getElementById("search2").value;
    	background.dict["search3"] = document.getElementById("search3").value;
    	background.dict["search4"] = document.getElementById("search4").value;
    	background.dict["openNewTab"] = document.getElementById("openNewTab").checked.toString();
    	background.dict["openOnLeft"] = document.getElementById("openOnLeft").checked.toString();
    	background.dict["openInBackground"] = document.getElementById("openInBackground").checked.toString();
    	chrome.storage.sync.set({'dict' : background.dict});
	}, true);

	document.getElementById("openNewTab").addEventListener("change", enableOpenOnLeft, false);
	    function enableOpenOnLeft() {
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
