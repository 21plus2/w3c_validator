// output config (TODO: create user config page)
var config_output_show_extract = true;
var config_output_show_line = true;
var config_output_show_column = false;

function validator_message_type(message) {

	// type is missing
	if (typeof message.type == "undefined") {
		return;
	}

	// warning
	if (
		message.type == "non-document-error" ||
		typeof message.subType != "undefined" && message.subType == "warning"
	) {
		return "warning";
	// error
	} else if (
		message.type == "error" ||
		typeof message.subType != "undefined" && message.subType == "fatal"
	) {
		return "error";
	// invalid or info
	} else {
		return;
	}
}

function validator_message_format(message) {
	var response = "";

	// add line_number if enabled and set
	if (config_output_show_line && typeof message.lastLine != "undefined") {
		response += "line ";
		// add firstLine if existing, otherwise it is the same as lastLine and we don't need it
		if (typeof message.firstLine != "undefined") {
			response += message.firstLine + "-"
		} 
		response += message.lastLine;
	}

	// add columns if enabled and set
	if (config_output_show_column && typeof message.firstColumn != "undefined" &&
			typeof message.lastColumn != "undefined") {
		if (response.length) {
			response += ", ";
		}
		response += "column " + message.firstColumn + "-" + message.lastColumn;
	}

	// add message
	if (response.length) {
		response += ": ";
	}
	response += message.message;

	// add html extract if enabled and set
	if (config_output_show_extract && typeof message.extract != "undefined") {
		response += " near " + message.extract;
	}

	return response;
}

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
	if (!msg.action) {
		return;
	}

	// validate action that sends the local html (prefixed with the doctype) to the
	// background process
	if (msg.action == "validate") {
		sendResponse(new XMLSerializer().serializeToString(document.doctype)
				+ document.documentElement.outerHTML);
	// validate_response action that handles the response from the background process
	// after a successfull validation. validate_message_* helpers are used to format
	// and categorize the messages
	} else if (msg.action == "validate_response" && msg.response) {
		var cnt_error = 0, cnt_warning = 0;
		var response = JSON.parse(msg.response);

		for (var message_key in response.messages) {
			var message_type = validator_message_type(response.messages[message_key]);
			var message_text = validator_message_format(response.messages[message_key]);

			if (message_type == "warning") {
				cnt_warning++;
				console.warn(message_text);
			} else if (message_type == "error") {
				cnt_error++;
				console.error(message_text);
			} else {
				console.log(message_text);
			}
		}

		// errors or warnings occured
		if (cnt_error > 0 || cnt_warning > 0) {
			console.error(cnt_error + " validation errors, " + cnt_warning + " warnings");
		// document validated without errors or warnings
		} else {
			console.log("The document validates according to the specified schema(s) and to "
					+ "additional constraints checked by the validator.");
		}
	// error reporting action, used to make background error visible in content scripts
	} else if (msg.action == "error" && msg.response) {
		console.error(msg.response);
	}
});
