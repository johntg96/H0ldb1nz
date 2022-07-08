// script.js

// ====THE PLAN ========================================================================================================================================================================================
// * !!!!!!! Use Indexeddb to store json objects locally in browser memory !!!!!!!
// --------------------------------------------------------------------------------------------------------------------------
// [PARTIALLY IMPLEMENTD] -- create export function to show csv or json (and maybe download?) -> json import/export done. csv export done. needs csv import (csv to json conversion). No download option yet.
// * .. or display HTML table that can be copy+pasted (copy paste button).
// --------------------------------------------------------------------------------------------------------------------------
// [IMPLEMENTED] -- Post Date is added with entry but the current date is not -> The current date will be added to each entry automatically..
// _____________________________________________________________________________________________________________________________________________________________________________________________________
// *easy to do*
// [IMPLEMENTED] -- dynamically change color of input boxes when input is given. etc: Selecting 'HP' under #spotted-new-mfg will change background color to purple.
// [IMPLEMENTED] -- line status p will be light yellow, e blue, r bright yellow, w red, etc.
// [IMPLEMENTED] -- Add this project to github.
// [IMPLEMENTED] -- Change/set background color of post date box dynamically.
// [IMPLEMENTED] -- Auto scroll down after each new entry added to table.
// * Use sass (css preprocessor) to tidy up css.
// * Clicking on json or css text of <p> tag will execute function to select all text and copy it to clipboard.
// * Make result window/box (div) that will output various data from button clicks, searches, etc.
// * Make functions to inititialize and update. A lot of code re-use + duplication is becoming very noticable.
// _____________________________________________________________________________________________________________________________________________________________________________________________________
// *moderate to do*
//  [IMPLEMENTED] -- Add 'export' button to copy table to clipboard. Maybe also offer to download csv file?
// [PARTIALLY IMPLEMENTED] -- Add 'import' button to show text field to paste csv or json text and add to sro_log and html table. -> json implemented, need to create csv to json converter function to complete.
// * if search sro returns a result (finds something) then change "mark" button to "update" and instead update the entry.
// * if search sro does not return a result then automatically fill in #spotted-new-sro input field with that sro. Signal to user visually that this has been done (lil css animation, color change, etc).
// * Make temporary arrays to hold data to filter table. ex. Filter based on toted y/n, sweep date, mfg, status, and post date. Hide rows from table. Clear filter button to clear temp arrays and restore full table.
// _____________________________________________________________________________________________________________________________________________________________________________________________________
// *harder to do*
// [IMPLEMENTED] -- When input for status is changed, take advantage of that to use for notes. etc, if status "W", then in notes aleady fill in "Waiting for "...
// * create auto-complete for notes. A small dictionary of all common phrases and predict most likely choice based on pattern, etc..
// * Any little changes to make work faster and simpler.
// _____________________________________________________________________________________________________________________________________________________________________________________________________
// *futuristic next level shit*
// * Add artificial intelligence to analyze data and give solutions, advice, notices, patterns, etc.
// * Visually represent the data in several ways. Graphs, charts, a flipcard like app that quickly summarizes the top 5 most urgent SRO's, etc.
// * Create logins and user authentication to create profiles, admins, read-only users, etc. Block public access entirely. Any access must be explicitly given from admin via invite link, etc.
// _____________________________________________________________________________________________________________________________________________________________________________________________________
// =====================================================================================================================================================================================================

var sro_log = [];

const spotted_new_sro = document.querySelector('#spotted-new-sro');
const spotted_new_notes = document.querySelector('#spotted-new-notes');
const spotted_new_date = document.querySelector('#spotted-new-date');
const table_info_qty = document.querySelector('#table-info');
const spot_sro_title = document.querySelector('#spot-sro-title');
const importSroTextarea = document.querySelector('#import-sro-textarea');
const importSroLogBtn = document.querySelector('#import-sro-log-btn');
const functionRibbon = document.querySelector('#function-ribbon');
const import_sweep_date = document.querySelector('#import-sweep-date');
const log = document.querySelector('#log');
const table_sro = document.querySelector('#table-sro');
const spotted_sro_toted = document.querySelector('#spotted-sro-toted');

function bottom() {
    document.getElementById( 'footer' ).scrollIntoView({ block: 'end',  behavior: 'smooth' });
};

// buggy
const getSRO = () => {
	var search_sro_box = document.querySelector('#search-sro-box');
	var sro_exists = document.querySelector('#' + search_sro_box.value);
	var sro_cells = document.querySelector('.sro-cell');

	if (sro_exists != null) {
		console.log(sro_exists);
		search_sro_box.style.borderColor = 'transparent';
		search_sro_box.style.borderWidth = '0';
		spot_sro_title.innerHTML = 'Visual Sweep';
		spot_sro_title.style.color = '#cccccc';

		if (sro_exists.classList.contains('sro-cell-found')) {
		 	sro_exists.classList.remove('sro-cell-found');
		} else {
			sro_exists.classList.add('sro-cell-found');
		}
		sro_exists.scrollIntoView({ block: 'center',  behavior: 'smooth' });
	} else {
		search_sro_box.style.borderColor = 'red';
		search_sro_box.style.borderWidth = '0.2em';
		spot_sro_title.style.color = 'red';
		spot_sro_title.innerHTML = 'No SRO Found';
	}
}

const spotted_new_mfg = document.querySelector('#spotted-new-mfg');
spotted_new_mfg.addEventListener('blur', () => {
	if (spotted_new_mfg.value == 'Lenovo') {
		spotted_new_mfg.style.backgroundColor = '#2FA0EC';
	} else if (spotted_new_mfg.value == "HP") {
		spotted_new_mfg.style.backgroundColor = 'purple';
		spotted_new_mfg.style.color = 'white';
	} else {
		spotted_new_mfg.style.backgroundColor = '#d6eafc';
	}
});

const spotted_new_status = document.querySelector('#spotted-new-status');
spotted_new_status.addEventListener('blur', () => {
	if (spotted_new_status.value == 'P') {
		spotted_new_status.style.backgroundColor = '#ddc76e';
		spotted_new_status.style.color = 'black';
		spotted_new_status.style.borderColor = 'transparent';
		spotted_new_status.style.fontWeight = 'normal';
		if (spotted_new_notes.value != 'Needs to be paired with OEM ') {
			spotted_new_notes.value = '';
			spotted_new_notes.value += 'Needs to be paired with OEM ';
		}
	} else if (spotted_new_status.value == 'W') {
		spotted_new_status.style.backgroundColor = '#db746b';
		spotted_new_status.style.borderColor = 'transparent';
		spotted_new_status.style.color = 'white';
		spotted_new_status.style.fontWeight = 'normal';
		if (spotted_new_notes.value !== 'Waiting for OEM ') {
			spotted_new_notes.value = '';
			spotted_new_notes.value += 'Waiting for OEM ';
		}
	} else if (spotted_new_status.value == 'E') {
		spotted_new_status.style.backgroundColor = '#488ec4';
		spotted_new_status.style.color = 'white';
		spotted_new_status.style.borderColor = 'transparent';
		spotted_new_status.style.fontWeight = 'normal';
		if (spotted_new_notes.value !== 'Status "E" but unit has been diagnosed. Changed status "E" to status "') {
			spotted_new_notes.value = '';
			spotted_new_notes.value += 'Status "E" but unit has been diagnosed. Changed status "E" to status "';
		}
	} else if (spotted_new_status.value == 'R') {
		spotted_new_status.style.backgroundColor = '#e8aa53';
		spotted_new_status.style.color = 'black';
		spotted_new_status.style.borderColor = '#d84d22';
		spotted_new_status.style.fontWeight = 'bold';
		if (spotted_new_notes.value !== 'Ready to repair, placed in purple tote.') {
			spotted_new_notes.value = '';
			spotted_new_notes.value += 'Ready to repair, placed in purple tote.';
		}
	} else if (spotted_new_status.value == 'Q') {
		spotted_new_status.style.backgroundColor = '#aa2929';
		spotted_new_status.style.color = 'white';
		spotted_new_status.style.borderColor = 'transparent';
		spotted_new_status.style.fontWeight = 'normal';
		if (spotted_new_notes.value !== 'Quote for ') {
			spotted_new_notes.value = '';
			spotted_new_notes.value += 'Quote for ';
		}
	} else if (spotted_new_status.value == 'S') {
		spotted_new_status.style.backgroundColor = 'white';
		spotted_new_status.style.color = '#aa2929';
		spotted_new_status.style.borderColor = '#aa2929';
		spotted_new_status.style.fontWeight = 'normal';
		if (spotted_new_notes.value !== 'Quote that has been SENT for ') {
			spotted_new_notes.value = '';
			spotted_new_notes.value += 'Quote that has been SENT for ';
		}
	} else if (spotted_new_status.value == 'C') {
		spotted_new_status.style.backgroundColor = 'grey';
		spotted_new_status.style.color = 'white';
		spotted_new_status.style.borderColor = 'transparent';
		spotted_new_status.style.fontWeight = 'normal';
		if (spotted_new_notes.value !== 'Status "C" but repair is not complete. Changed status "C" to status "') {
			spotted_new_notes.value = '';
			spotted_new_notes.value += 'Status "C" but repair is not complete. Changed status "C" to status "';
		}
	} else if (spotted_new_status.value == 'D') {
		spotted_new_status.style.backgroundColor = 'blue';
		spotted_new_status.style.color = 'white';
		spotted_new_status.style.borderColor = 'transparent';
		spotted_new_status.style.fontWeight = 'normal';
	} else {
		spotted_new_status.style.backgroundColor = '#d6eafc';
		spotted_new_status.style.borderColor = 'transparent';
		spotted_new_status.style.fontWeight = 'normal';
	}

	spotted_new_status.style.fontStyle = 'italic';
});

// initialize object to store SRO data entered from spot form to spot table
let new_entry = new Object();

// Get current date and store it in a variable
let today = new Date();
let dd = String(today.getDate()).padStart(2, '0');
let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
let yyyy = today.getFullYear();
today = yyyy + '-' + mm + '-' + dd;

const today_short = today.substring(5);

const getNumberOfDays = (post_date, today) => {
    const date1 = new Date(post_date);
    const date2 = new Date(today);
    // One day in milliseconds
    const oneDay = 1000 * 60 * 60 * 24;
    // Calculating the time difference between two dates
    const diffInTime = date2.getTime() - date1.getTime();
    // Calculating the no. of days between two dates
    const diffInDays = Math.round(diffInTime / oneDay);
    
    return diffInDays;
}

const spotted = document.querySelector('#spot-btn');

const checkDuplicates = (new_sro_to_check) => {
	//console.log('checking for duplicate for ' + new_sro_to_check);
	return sro_log.some(e => e.SRO === new_sro_to_check);
}

const addSroToLog = (object, imported) => {
	if (checkDuplicates(object.SRO)) {
		console.log('duplicate entry skipped.')
		spotted_new_sro.style.borderColor = 'red';
		spotted_new_sro.style.borderWidth = '0.2em';
		spot_sro_title.innerHTML= 'Duplicate SRO Spotted';
		spot_sro_title.style.color = 'red';
	} else {
		spotted_new_sro.style.borderColor = 'transparent';
		spot_sro_title.innerHTML= 'Visual Sweep';
		spot_sro_title.style.color = '#cccccc';
		sro_log.push(object);
		console.log(object.SRO + ' added to sro_log');

		let row = log.insertRow(-1);
		let cell0 = row.insertCell(0)
		let cell1 = row.insertCell(1);
		let cell2 = row.insertCell(2);
		let cell3 = row.insertCell(3);
		let cell4 = row.insertCell(4);
		let cell5 = row.insertCell(5);
		let cell6 = row.insertCell(6);
		let cell7 = row.insertCell(7);

		cell0.innerHTML = '<button onclick="toteRow(this)" class="toted-checkboxes">&#10004</button>';
		cell1.innerHTML = '<button onclick="deleteRow(this)" class="delete-row-btn">&#10006;</button>';
		cell2.parentNode.id = object.SRO;
		cell2.classList.add('sro-cell');
		cell2.innerHTML = object.SRO;
		cell3.innerHTML = object.sweep_date.substring(5, 10);
		cell3.style.backgroundColor = '#e6e6e6';
		cell4.innerHTML = object.mfg;
		cell5.innerHTML = object.status;
		cell6.style.cssText = "text-align: left; padding: 0 0.3em 0 0.3em; font-size: 0.6em; font-family: 'Source Code Pro', monospace;";
		cell6.innerHTML = "<strong><span style='font-size: 1.5em';>" + getNumberOfDays(object.post_date, today) + '</strong></span> day(s) old';

		if (getNumberOfDays(object.post_date, today) >= 30) {
			cell6.style.backgroundColor = '#ff3300';
			cell6.style.color = 'white';
		} else if (getNumberOfDays(object.post_date, today) >= 20 && getNumberOfDays(object.post_date, today) < 30) {
			cell6.style.backgroundColor = '#ff6600';
			cell6.style.color = 'white';
		} else if (getNumberOfDays(object.post_date, today) >= 15 && getNumberOfDays(object.post_date, today) < 20) {
			cell6.style.backgroundColor = '#ffff80';
			cell6.style.color = 'black';
		} else if (getNumberOfDays(object.post_date, today) >= 7 && getNumberOfDays(object.post_date, today) < 15) {
			cell6.style.backgroundColor = '#ddff99';
			cell6.style.color = 'black';
		} else if (getNumberOfDays(object.post_date, today) >= 7 && getNumberOfDays(object.post_date, today) < 15) {
			cell6.style.backgroundColor = '#bbff99';
			cell6.style.color = 'black';
		} else if (getNumberOfDays(object.post_date, today) >= 0 && getNumberOfDays(object.post_date, today) < 7) {
			cell6.style.backgroundColor = '#80ff80';
			cell6.style.color = 'black';
		} else {
			cell6.style.backgroundColor = '#EEEEEE';
			cell6.style.color = 'black';
		}

		cell7.innerHTML = object.notes;
		cell7.style.cssText = 'width: 10em;overflow-wrap: break-word;padding: 0; text-align: left; padding-left: 0.6em; padding-right: 0.25em;font-size: 0.8em;';

		if (object.mfg == 'Lenovo') {
			cell4.style.backgroundColor = '#2FA0EC';
			cell4.style.color = 'white';
		} else if (object.mfg == "HP") {
			cell4.style.backgroundColor = 'purple';
			cell4.style.color = 'white';
		} else {
			cell4.style.backgroundColor = '#f9f5b1';
		}

		cell5.style.fontStyle = 'italic';

		if (object.status == 'P') {
			cell5.style.backgroundColor = '#ddc76e';
			cell5.style.color = 'black';
			cell5.style.borderColor = 'black';
			cell5.style.fontWeight = 'bold';
		} else if (object.status == 'W') {
			cell5.style.backgroundColor = '#db746b';
			cell5.style.color = 'white';
			cell5.style.borderColor = 'black';
			cell5.style.fontWeight = 'bold';
		} else if (object.status == 'E') {
			cell5.style.backgroundColor = '#488ec4';
			cell5.style.color = 'white';
			cell5.style.borderColor = 'black';
			cell5.style.fontWeight = 'bold';
		} else if (object.status == 'R') {
			cell5.style.backgroundColor = '#e8aa53';
			cell5.style.color = 'black';
			cell5.style.borderColor = '#d84d22';
			cell5.style.fontWeight = 'bold';
		} else if (object.status == 'Q') {
			cell5.style.backgroundColor = '#aa2929';
			cell5.style.color = 'white';
			cell5.style.borderColor = 'black';
			cell5.style.fontWeight = 'bold';
		} else if (object.status == 'S') {
			cell5.style.backgroundColor = 'white';
			cell5.style.color = '#aa2929';
			cell5.style.borderColor = '#aa2929';
			cell5.style.fontWeight = 'bold';
		} else if (object.status == 'C') {
			cell5.style.backgroundColor = '#aa2929';
			cell5.style.color = 'white';
			cell5.style.borderColor = 'black';
			cell5.style.fontWeight = 'bold';
		} else if (object.status == 'D') {
			cell5.style.backgroundColor = '#aa2929';
			cell5.style.color = 'white';
			cell5.style.borderColor = 'black';
			cell5.style.fontWeight = 'bold';
		}

		if (object.toted == 'y') {
			cell2.style.backgroundColor = 'grey';
			cell3.style.backgroundColor = 'grey';
			cell4.style.backgroundColor = 'grey';
			cell4.style.color = 'black';
			cell5.style.backgroundColor = 'grey';
			cell5.style.color = 'black';
			cell5.style.borderColor = 'black';
			cell6.style.backgroundColor = 'grey';
			cell6.style.color = 'black';
			cell7.style.backgroundColor = 'grey';
		}
	}

	// Consider moving this along with same calls from spotted event listener to overall 'update' function !!!
	hideLog();
	table_info_qty.innerHTML = "SRO Quantity in Table: " + String(sro_log.length);
	bottom();
}

const deleteRow = (t) => {
	let row = t.parentNode.parentNode;
	let sro_to_delete = row.cells[2].textContent;
    log.deleteRow(row.rowIndex);
    console.log(sro_to_delete + ' Removed from sro_log');
    new_entry = {}
    var sro_log_index_to_delete = sro_log.findIndex(sro => sro.SRO == sro_to_delete);
    sro_log.splice(sro_log_index_to_delete, 1);
    // Consider moving this along with same calls from spotted event listener to overall 'update' function !!!
    table_info_qty.innerHTML = "SRO Quantity in Table: "+ String(sro_log.length);
    hideLog();
}

const toteRow = (t) => {
	let row = t.parentNode.parentNode;
	console.log(row);
	let sro_to_tote = row.cells[2].textContent;
	sro_in_log = sro_log.find(item => item.SRO === sro_to_tote);
	console.log(sro_in_log);

	if (sro_in_log.toted == 'n') {
		sro_in_log.toted = 'y';
		console.log(sro_to_tote + ' marked as toted');

		// SRO
		row.cells[2].style.backgroundColor = 'grey';

		// Sweep Date
		row.cells[3].style.backgroundColor = 'grey';

		// Mfg
		row.cells[4].style.backgroundColor = 'grey';
		row.cells[4].style.color = 'black';

		// Status
		row.cells[5].style.backgroundColor = 'grey';
		row.cells[5].style.color = 'black';

		// Post Date Age
		row.cells[6].style.backgroundColor = 'grey';
		row.cells[6].style.color = 'black';

		// Notes
		row.cells[7].style.backgroundColor = 'grey';

		table_info_qty.innerHTML = "SRO Quantity in Table: "+ String(sro_log.length);
    	hideLog();
	} else {
		sro_in_log.toted = 'n';
		console.log(sro_to_tote + ' toted = "n"');

		row.cells[2].style.backgroundColor = 'white';
		row.cells[3].style.backgroundColor = '#e6e6e6';

		if (sro_in_log.mfg == 'Lenovo') {
			row.cells[4].style.backgroundColor = '#2FA0EC';
			row.cells[4].style.color = 'white';
		} else if (sro_in_log.mfg == "HP") {
			row.cells[4].style.backgroundColor = 'purple';
			row.cells[4].style.color = 'white';
		} else {
			row.cells[4].style.backgroundColor = '#f9f5b1';
		}
	
		row.cells[5].style.fontStyle = 'italic';
	
		if (sro_in_log.status == 'P') {
			row.cells[5].style.backgroundColor = '#ddc76e';
			row.cells[5].style.color = 'black';
			row.cells[5].style.borderColor = 'black';
			row.cells[5].style.fontWeight = 'bold';
		} else if (sro_in_log.status == 'W') {
			row.cells[5].style.backgroundColor = '#db746b';
			row.cells[5].style.color = 'white';
			row.cells[5].style.borderColor = 'black';
			row.cells[5].style.fontWeight = 'bold';
		} else if (sro_in_log.status == 'E') {
			row.cells[5].style.backgroundColor = '#488ec4';
			row.cells[5].style.color = 'white';
			row.cells[5].style.borderColor = 'black';
			row.cells[5].style.fontWeight = 'bold';
		} else if (sro_in_log.status == 'R') {
			row.cells[5].style.backgroundColor = '#e8aa53';
			row.cells[5].style.color = 'black';
			row.cells[5].style.borderColor = '#d84d22';
			row.cells[5].style.fontWeight = 'bold';
		} else if (sro_in_log.status == 'Q') {
			row.cells[5].style.backgroundColor = '#aa2929';
			row.cells[5].style.color = 'white';
			row.cells[5].style.borderColor = 'black';
			row.cells[5].style.fontWeight = 'bold';
		} else if (sro_in_log.status == 'S') {
			row.cells[5].style.backgroundColor = 'white';
			row.cells[5].style.color = '#aa2929';
			row.cells[5].style.borderColor = '#aa2929';
			row.cells[5].style.fontWeight = 'bold';
		} else if (sro_in_log.status == 'C') {
			row.cells[5].style.backgroundColor = '#aa2929';
			row.cells[5].style.color = 'white';
			row.cells[5].style.borderColor = 'black';
			row.cells[5].style.fontWeight = 'bold';
		} else if (sro_in_log.status == 'D') {
			row.cells[5].style.backgroundColor = '#aa2929';
			row.cells[5].style.color = 'white';
			row.cells[5].style.borderColor = 'black';
			row.cells[5].style.fontWeight = 'bold';
		}

		if (getNumberOfDays(sro_in_log.post_date, today) >= 30) {
			row.cells[6].style.backgroundColor = '#ff3300';
			row.cells[6].style.color = 'white';
		} else if (getNumberOfDays(sro_in_log.post_date, today) >= 20 && getNumberOfDays(sro_in_log.post_date, today) < 30) {
			row.cells[6].style.backgroundColor = '#ff6600';
			row.cells[6].style.color = 'white';
		} else if (getNumberOfDays(sro_in_log.post_date, today) >= 15 && getNumberOfDays(sro_in_log.post_date, today) < 20) {
			row.cells[6].style.backgroundColor = '#ffff80';
			row.cells[6].style.color = 'black';
		} else if (getNumberOfDays(sro_in_log.post_date, today) >= 7 && getNumberOfDays(sro_in_log.post_date, today) < 15) {
			row.cells[6].style.backgroundColor = '#ddff99';
			row.cells[6].style.color = 'black';
		} else if (getNumberOfDays(sro_in_log.post_date, today) >= 7 && getNumberOfDays(sro_in_log.post_date, today) < 15) {
			row.cells[6].style.backgroundColor = '#bbff99';
			row.cells[6].style.color = 'black';
		} else if (getNumberOfDays(sro_in_log.post_date, today) >= 0 && getNumberOfDays(sro_in_log.post_date, today) < 7) {
			row.cells[6].style.backgroundColor = '#80ff80';
			row.cells[6].style.color = 'black';
		} else {
			row.cells[6].style.backgroundColor = '#EEEEEE';
			row.cells[6].style.color = 'black';
		}

		row.cells[7].style.backgroundColor = 'white';
	}
	
}

// Add new row with cells when #spot-btn is clicked
spotted.addEventListener('click', function() {
	if (spotted_new_sro.value.length != 0 && spotted_new_sro.value.includes('SRO')) {
		spotted_new_sro.style.borderColor = 'transparent';
		spot_sro_title.innerHTML= 'Visual Sweep';
		spot_sro_title.style.color = '#cccccc';

		new_entry = {};
		new_entry.SRO = spotted_new_sro.value;
		new_entry.sweep_date = today;
		new_entry.mfg = spotted_new_mfg.value;
		new_entry.status = spotted_new_status.value;
		new_entry.post_date = spotted_new_date.value;
		new_entry.notes = spotted_new_notes.value;
		
		if (spotted_sro_toted.checked == true) {
			new_entry.toted = 'y';
		} else {
			new_entry.toted = 'n'
		}
	
		console.log(new_entry);
		addSroToLog(new_entry);
	} else {
		spotted_new_sro.style.borderColor = 'red';
		spotted_new_sro.style.borderWidth = '0.2em';
		spot_sro_title.innerHTML= 'No SRO Entered';
		spot_sro_title.style.color = 'red';
	}
});



const exportLog = (format) => {
	const logDataDisplay = document.querySelector('#log-data');
	const sro_log_json = JSON.stringify(sro_log);

	if (format == 'csv') {
		// JSON to CSV Converter
    	function ConvertToCSV(objArray) {
        	var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
        	var str = '';

        	for (var i = 0; i < array.length; i++) {
            	var line = '';
            	for (var index in array[i]) {
                	if (line != '') line += ','
                	line += array[i][index];
            	}
            	str += line + '\r\n';
        	}
        	return str;
    	}
    	
    	logDataDisplay.textContent = ConvertToCSV(sro_log_json);

	} else if (format == 'json') {
		logDataDisplay.textContent = sro_log_json;
	} else {
		exportLog('csv');
	}

	logDataDisplay.style.display = 'block'
}

const hideLog = () => {
	const logDataDisplay = document.querySelector('#log-data');
	if (logDataDisplay.style.display == 'block') {
		logDataDisplay.style.display = 'none';
	}

	importSroTextarea.style.display = 'none';
	importSroLogBtn.style.display = 'none';
	functionRibbon.style.height = '2em';
	import_sweep_date.style.display = 'none';
}

const showImportTextarea = () => {
	if (importSroTextarea.style.display == 'none') {
		importSroTextarea.style.display = 'block';
		importSroLogBtn.style.display = 'block';
		functionRibbon.style.height = '15em';
		import_sweep_date.style.display = 'block';
	} else {
		importSroTextarea.style.display = 'none';
		importSroLogBtn.style.display = 'none';
		functionRibbon.style.height = '2em';
		import_sweep_date.style.display = 'none';
	}
	
}

const importLog = () => {
	const importLogData = importSroTextarea.value;
	const sweep_date = import_sweep_date.value;

	if (importLogData != undefined) {
		const json_object = JSON.parse(importLogData);
			
		for (let i = 0; i < json_object.length; i++) {
			if (checkDuplicates(json_object[i].SRO)) {
				console.log('skipped adding duplicate entry for ' + json_object[i].SRO + ' from json import.');
			} else {
				if (json_object[i].hasOwnProperty('sweep_date')) {
					addSroToLog(json_object[i]);
				} else {
					json_object[i].sweep_date = sweep_date;
					addSroToLog(json_object[i]);
				}
			}
		}

		importSroTextarea.style.display = 'none';
		importSroLogBtn.style.display = 'none';
		functionRibbon.style.height = '2em';
		import_sweep_date.style.display = 'none';
	} else {
		console.log('no data provided.');
	}
}

const importJsonLog = () => {
	const load_sro_log_btn = document.querySelector('#load-sro-log');
	load_sro_log_btn.innerHTML = 'Reload';

	const json_log = require('../data/sweep.json');
	const json_log_sro = JSON.parse(JSON.stringify(json_log));

	for (let i = 0; i < json_log_sro.length; i++) {
		if (checkDuplicates(json_log_sro[i].SRO)) {
			console.log('skipped adding duplicate entry for ' + json_log_sro[i].SRO + ' from json import.');
		} else {
			if (json_log_sro[i].hasOwnProperty('sweep_date')) {
				addSroToLog(json_log_sro[i]);
			} else {
				json_log_sro[i].sweep_date = sweep_date;
				addSroToLog(json_log_sro[i]);
			}
		}
	}
}

const saveLog = (log) => {
	const logJsonStr = JSON.stringify(log);
	const fs = require('fs');
	fs.writeFile('sweep_' + today_short + '.json', logJsonStr, (err) => {
		if (err) {
			console.log(err);
		} else {
			alert('/resources/app/data/sweep_' + today_short + '.json saved to data folder');
			console.log('"new_sweep.json" saved to data/new_sweep.json');
		}
	});
	
}

function clearLog() {
	let confirmation = confirm("This functionality is still being whipped together. For now this does nothing, sorry.");
	// Bugs!! This code clears the log and HTML table but after doing so breaks the table (rows not being added but are added to sro_log?) :(
	// Maybe something to do with css selectors idk.
	//if (confirmation == true) {
	//	sro_log = [];
	//	console.log(sro_log);
	//	const table_log = document.querySelector('#log-div');
	//	table_log.addEventListener('click', () => {
	//		console.log('working');
	//	});
	//	table_log.innerHTML = "<p id='log-data'></p><table id='log'><tr id='table-header'><th id='delete-column'>&#10006;</th><th id='column-sro'>SRO</th><th id='column-sweep-date'>Sweep Date</th><th id='column-mfg'>Mfg</th><th id='column-status'>Status</th><th id='column-post-date'>Post Date Age</th><th id='cell-notes'>Notes</th></tr></table>";
	//	initializeSelectors();
	//}
}


// Not working :(
// Purpose: To hide delete column from html table so entire table can be easily copy+pasted..
// Also: Do this, but also create function to select proper columns of HTML table by clicking a button. Also auto copy to clipboard.
// General purpose: To make exporting HTML table to spreadsheet as simplistic as possible in several different ways.
//const delete_hide_btn = document.querySelector('#delete-hide-btn');
//const delete_column_header = document.querySelector('#delete-column');
//delete_hide_btn.addEventListener('click', () => {
//	console.log('button clicked.')
//	let delete_row_btn = document.querySelector('.delete-row-btn');
//	if (delete_column_header.style.display == 'block') {
//		delete_row_btn.style.display = 'none';
//		delete_column_header.style.display = 'none';
//	} else if (delete_hide_btn.style.display == 'none') {
//		delete_row_btn.style.display = 'block';
//		delete_column_header.style.display = 'block';
//	}  else {
//		delete_row_btn.style.display = 'none';
//		delete_column_header.style.display = 'block';
//	}
//});