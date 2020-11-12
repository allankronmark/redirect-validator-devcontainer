(function () {

	function loadScript(url, callback) {

		var script = document.createElement("script")
		script.type = "text/javascript";

		if (script.readyState) { //IE
			script.onreadystatechange = function () {
				if (script.readyState == "loaded" || script.readyState == "complete") {
					script.onreadystatechange = null;
					callback();
				}
			};
		} else { //Others
			script.onload = function () {
				callback();
			};
		}

		script.src = url;
		document.getElementsByTagName("head")[0].appendChild(script);
	}

	loadScript("//ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js", function () {

		 //jQuery loaded
		 console.log('jquery loaded');
		 addCSS();
		addLinkChecker();
		// Populating a couple of test rows
/* 		 var dl = document.location;
		 var testrow = dl+','+dl+'\n';
		 $('#source').val( testrow + testrow + testrow + testrow + testrow + testrow + testrow + testrow + testrow + testrow ); */
		
		// Let's populate with more meaningful testrows
		var testrows = [
			'https://apple.dk/,https://www.apple.com/dk/',
			'https://apple.dk/mac/,https://www.apple.com/dk/mac/',
			'https://apple.dk/Mac/,https://www.apple.com/dk/mac/',
			'https://apple.dk/Mac/,https://www.apple.com/dk/mac/',
			'https://apple.dk/MAC/,https://www.apple.com/dk/mac/',
			'https://www.apple.dk/,https://www.apple.com/dk/',
			'https://www.apple.dk/mac/,https://www.apple.com/dk/mac/',
			'https://www.apple.dk/Mac/,https://www.apple.com/dk/mac/',
			'https://www.apple.dk/Mac/,https://www.apple.com/dk/mac/',
			'https://www.apple.dk/MAC/,https://www.apple.com/dk/mac/',
		].join('\n');
		$('#source').val(testrows);
		 $('#validate').click(function(){
			validateRedirects();
		 });

	});


})();

addCSS = function(){
	$('head').append('<style>'
+'			.rTable {'
/*+'				display: table;'*/
+'				width: 100%;'
+'			}'
+'			.rTableRow {'
/*+'				display: table-row;'
+'				width: 100%;'*/
+'			}'
+'			.rTableCell, .rTableHead {'
/*+'				display: table-cell;'*/
+'				padding: 3px 3px;'
+'				border: 1px solid #999999;'
+'				font-size: 12px;'
+'			}'
+'			.rTableHeading {'
/*+'				display: table-header-group;'*/
+'				background-color: #ddd;'
+'				font-weight: bold;'
+'			}'
+'			.rTableFoot {'
/*+'				display: table-footer-group;'*/
+'				font-weight: bold;'
+'				background-color: #ddd;'
+'			}'
+'			.rTableBody {'
/*+'				display: table-row-group;'*/
+'			}'
+'			#source {'
+'				width: 100%;'
+'				border: 1px solid #ccc;'
+'				background-color: #eee;'
+'				height: 300px;'
+'			}'
+'			#status-message{'
+'				border: 2px dashed #ccc;'
+'				text-align: center;'
+'				padding: 20px;'
+'			}'
+'			.warn, .ok.warn{'
+'				background-color: #ffd966;'
+'			}'
+'			.error, .ok.error{'
+'				background-color: #fddfdf;'
+'			}'
+'			.ok{'
+'				background-color: #90ee90; /* lightgreen */'
+'			}'
+'			body{'
+'				overflow: auto!important;'
+'			}'
/*+'			#urlchecker{'
+'				position: absolute;'
+'				z-index: 2147483647;'
+'				width: 100%;'
+'				height: -webkit-fill-available;'
+'				background-color: white;'
+'				padding: 10px;'
+'				box-sizing: border-box;'
+'			}'*/
+'		</style>');
	
}	

addLinkChecker = function(){
	$('body').html('<div id="urlchecker"><div><textarea id="source"></textarea></div>'
+'		<div><button id="validate">Validate redirects</button></div>'
+'		<table id="result" class="rTable">'
+'		<thead>'
+'			<tr class="rTableRow rTableHeading">'
+'				<th class="rTableHead"><strong>#</strong></th>'
+'				<th class="rTableHead"><strong>Original URL</strong></th>'
+'				<th class="rTableHead"><strong>Mapped URL</strong></th>'
+'				<th class="rTableHead"><strong>Final URL</strong></th>'					
+'				<th class="rTableHead"><strong>Final HTTP Status</strong></th>'
+'				<th class="rTableHead"><strong>Mapping Status</strong></th>'
+'			</tr>'
+'		</thead>'
+'		<tbody>'
+'		</tbody>'
+'		</table>'
+'		<div id="status-message">'
+'			<p>Results will show here</p>'
+'		</div></div>');
	
}

/* global variables */
//set the max number of URLs allowed to be checked simultaneously
var maxURLs = 15;
var uniqueURLs = [];
var queue = 0;
var checking = 0;
var numMappingsOK = 0;
var numMappingsIncorrect = 0;
var tableExists = false;

isURLInQueue = function(url) {
	//console.log( 'uniqueURLs: ' + uniqueURLs );
	//console.log( 'uniqueURLs.indexOf(url): ' + uniqueURLs.indexOf(url) );
	//console.log( '( uniqueURLs.indexOf(url) > -1 ) ' + ( uniqueURLs.indexOf(url) > -1 ) );	
	if( uniqueURLs.indexOf(url) !== -1 ){
		//console.log( 'url is in queue' ); 	
    	return true;
    }
    else return false;
}
addURLToQueue = function(url) {
	if( !isURLInQueue(url) ){
    	uniqueURLs.push(url);
    	queue = uniqueURLs.length;
		//console.log( 'url added to queue. new length: ' + uniqueURLs.length);
    	return true;
    }
    else return false;
}
removeURLFromQueue = function(url) {
	if( isURLInQueue(url) ){	
    	uniqueURLs.splice(uniqueURLs.indexOf(url), 1);
    	queue = uniqueURLs.length;
		//console.log( 'url removed from queue. new length: ' + queue);
    	return true;
    }
    else return false;
}
resetQueue = function(){
	uniqueURLs = [];
	queue = 0;
	checking = 0;
	numMappingsOK = 0;
	numMappingsIncorrect = 0;
	//console.log( 'queue reset sucessfully' );	
}

convertSourceToArray = function(){
	var source = $('#source').val( $('#source').val().replace( /\"[\s\t\n\r]*(.*?)\"$/gm, '$1' ) );
	var source = $('#source').val( $('#source').val().replace( /\"/gm, '' ) );
	//console.log( source );
	var lines = $('#source').val().split(/\n/);
	var correctLines = new Array();
	var i = 0;
	var l = lines.length;
	for (i; i < l; i++) {
		//remove leading and trailing spaces
		lines[i] = lines[i].trim();
		//console.log( lines[i].length );
		
		//if not an empty line, push it at the end of the new array
		if( lines[i].length>0 ){
			correctLines.push( lines[i].split(/[,;\t]/) );
		}
		
	}
	return correctLines;
}
//perform ajax request to server as it cannot be done directly because of cross-domain
ajaxCheck = function( URLtoCheck, type = 'local' ){

	var headers = {
		'url' : '',
		'http_code' : ''
	}
	
	switch (type) {
		case 'remote':
			//console.log('remote ajax checking:' + URLtoCheck);
			$.ajax({
				type: "POST",
				url: document.location.href + 'check.php', 
				dataType: "text json",
				async: true,
				cache: false,
				data: { url: URLtoCheck }, 
				success: function(data, textStatus, request){
					//console.log( JSON.parse( data ) );
					//console.log( data );
					updateRow( URLtoCheck, data );
					checking -= 1;
				},
				error: function (request, textStatus, errorThrown) {
					//something went horribly wrong
					console.log( 'ajax error' );
					checking -= 1;					
				}
			});
		break;
		case 'local':
			var xhr;
			var _orgAjax = jQuery.ajaxSettings.xhr;
			jQuery.ajaxSettings.xhr = function () {
			  xhr = _orgAjax();
			  return xhr;
			};
			//console.log('local ajax checking:' + URLtoCheck);
			//perform ajax request to server as it cannot be done directly because of cross-domain
			var xhr = new XMLHttpRequest();
			xhr.open('HEAD', URLtoCheck, true);
			xhr.onload = function () {
			  //console.log('responseURL:'+ xhr.responseURL);
				headers.url = xhr.responseURL;
				//console.log('responseURL: '+ headers.url);
				headers.http_code = xhr.status;
				//console.log('status: '+ xhr.status);
				updateRow( URLtoCheck, headers );
				//removeURLFromQueue(URLtoCheck);
				checking -= 1;
			};
			xhr.onerror = function () {
			  //console.log('responseURL:'+ xhr.responseURL);
				headers.url = xhr.responseText;
				//console.log('responseURL: '+ headers.url);
				headers.http_code = -1;
				//console.log('status: '+ xhr.status);
				updateRow( URLtoCheck, headers );
				//removeURLFromQueue(URLtoCheck);	
				checking -= 1;		  
			};
			xhr.send(null);
		break;
		default:
			//console.log('skipping checking:' + URLtoCheck);		
			headers.url = '-';
			//console.log('responseURL: '+ headers.url);
			headers.http_code = -1;
			//console.log('status: '+ xhr.status);		
			updateRow( URLtoCheck, headers );
			checking -= 1;
	}
	return true;
}

checkURL = function( URLtoCheck ){
	//console.log( '***************' );
	var checkType = 'local';
/*	var headers = {
		'url' : '',
		'http_code' : ''
	}*/
	if( URLtoCheck.indexOf(document.location.hostname) < 0 ){
		//headers.url = '-';
		//console.log('responseURL: '+ headers.url);
		//headers.http_code = -1;
		//console.log('status: '+ xhr.status);		
		//updateRow( URLtoCheck, headers );
		checkType = 'remote';
		//console.log( '%c same domain, skipping: '+headers.url, 'background: #66f7ff; color: #393939;' );		
		//return true;
	}
	//console.log( 'checking: ' + URLtoCheck );
	
	//update the mapping status to show it's actively checking
	var collection = $('#result tbody .rTableRow.rTableBody[data-originalurl="'+ URLtoCheck +'"]');
	var checkedElement = collection.first("[data-checked='true']");
	//console.log(checkedElement.find('.finalURL').text() + ' - finalurl: ' + checkedElement.find('.finalURL').text());
	if( checkedElement.find('.finalURL').text().length > 0 ){
		/*var headers = {
			'url' : '',
			'http_code' : ''
		}	
		headers.url = checkedElement.find('.finalURL').text();
		headers.http_code = checkedElement.find('.httpStatus').text();
		updateRow( URLtoCheck, headers );*/
		console.log( '%c already checked, skipping... background: #66f7ff; color: #393939;' );
		//console.log( 'already checked, skipping: '+headers.http_code );
		return true;
	}


	if( !isURLInQueue( URLtoCheck ) ){
		addURLToQueue( URLtoCheck );
		//console.log( 'adding url to queue' );
	}
	
	//console.log( queue );
	//console.log( maxURLs );

	// the critical queue - the one actually making requests	
	if( isURLInQueue( URLtoCheck ) && checking < maxURLs ){

		//addURLToQueue( URLtoCheck );
		

		//console.log( $('#result tbody .rTableRow.rTableBody').not('[data-checked="true"]').length );
		checking += 1;
	
		collection.not('[data-checked="true"]').each(function(){
			$(this)[0].dataset.checked = 'checking';
			$(this).find('.mappingStatus').text('checking...');
		});
		
		//the check
		ajaxCheck( URLtoCheck, checkType );

	}
	else{
		//code before the pause
		setTimeout(function(){
			checkURL( URLtoCheck );
		}, 1000);
	}

}

//enforce trailing slash on root domain
enforceTrailingSlash = function( url ){
	if( typeof(url) === 'undefined' || url === 'undefined' ){
		var url = '';
	}	
	if( url.length > 0 && url.match(/\//g).length <= 2 ){
		if (url.substr(-1) != '/') url += '/';
	}
	return url;
}
			
//fill data into the right row
updateRow = function( originalURL, headers ){
	//console.log( 'checkIfRowExists' );
	//set updated to false for good measures
	var updated = false;
	//console.log( headers );
	//console.log( headers.url );
	//console.log( headers.http_code );
	//console.log( 'Updating row: '+originalURL );
	//console.log( $('#result tbody .rTableRow.rTableBody').not('[data-checked="true"]').length );
	
	//find the row(s) matching the originalURL (there should only be one)
	$('#result tbody .rTableRow[data-originalurl="'+ originalURL +'"]').each(function(){
		
		//reset classes before update
		$(this).removeClass('ok warn error');
		
		var statusText = '';		
		//update the mapping status cell
		//console.log( enforceTrailingSlash( $(this)[0].dataset.mappedurl ) +' - ' + headers.url );
		//console.log( ( enforceTrailingSlash( $(this)[0].dataset.mappedurl ) === headers.url ) );		
		if( enforceTrailingSlash( $(this)[0].dataset.mappedurl ) === headers.url ) {
			$(this).addClass('ok').find('.mappingStatus').text( statusText = 'OK' );
			numMappingsOK += 1;
		}
		else if(headers.http_code*1 === -1){
			$(this).find('.mappingStatus').text( statusText = 'not checked' );

		}
		else{
			$(this).find('.mappingStatus').text( statusText = 'Incorrect' );
			numMappingsIncorrect += 1;
		}
		
		//update the finalURL cell
		$(this).find('.finalURL').text( headers.url );
		
		//update the http status code cell
		//if there's an 404, add warning class		
		if( headers.http_code*1 >= 400 && headers.http_code*1 < 500){
			$(this).addClass('warn').find('.httpStatus').html( headers.http_code );
		}
		
		//if there's an error, make the text a link which the user can click to recheck the url
		if( headers.http_code*1 >= 500 ){
			$(this).addClass('error').find('.httpStatus').html( '<a href="javascript:void(0);" title="Click to recheck" onclick="checkURL(\''+ originalURL +'\')">' + headers.http_code + '</a>' );
		}
		else $(this).find('.httpStatus').text( headers.http_code );
		
		if( statusText === 'Incorrect' ){
			$(this).addClass('error');
		}
		
		updated = $(this)[0].dataset.checked = true;
	});
	return updated;
}

//we don't want dupes so check if the row has already been added (the original URL should be unique
checkIfRowExists = function( originalURL ){
	//console.log( 'checkIfRowExists' );
	var collection = $('#result tbody .rTableRow[data-originalurl="'+ originalURL +'"]').each(function(){
		//show the user the conflicting rows
		//$(this).effect("highlight", {}, 3000);
	});
	return collection;
}

//build the table first to avoid changing the DOM an excessive number of times
buildTable = function( lines ){
	if( lines.length<1 || lines[0].length<2 || lines[0][0].indexOf(':')<0 || lines[0][1].indexOf(':')<0 ) return false;
	console.log( 'building...' );
	var tableRowsArr = new Array();

	var i = 0;
	var l = lines.length;
	for (i; i < l; i++) {
		row = lines[i];
		
		//console.log( 'originalURL ['+ i +']: '+ encodeURI( row[0] ) );
		originalURL = enforceTrailingSlash( encodeURI( row[0] ) );
		
		//console.log( 'mappedURL ['+ i +']: '+ encodeURI( row[1] ) );
		mappedURL = enforceTrailingSlash( encodeURI( row[1] ) );
		
		
		if( checkIfRowExists( originalURL ).length<1 ){
			tableRowsArr[i] = '<tr class="rTableRow rTableBody" data-originalurl="'+ originalURL +'" data-mappedurl="'+ mappedURL +'" data-checked="false"><td class="rTableCell">'+ (i+1) +'</td><td class="rTableCell originalURL">'+ originalURL +'</td><td class="rTableCell mappedURL">'+ mappedURL +'</td><td class="rTableCell finalURL"></td><td class="rTableCell httpStatus"></td><td class="rTableCell mappingStatus">not checked yet</td></tr>';
		}
		
	}
	var results = $('#result');
	//results.hide();
	//append the rows to the table
	$(tableRowsArr.join('')).appendTo('#result tbody');
	//$('#result tbody').html( tableRowsArr.join('') );
	//results.show();

	//results.toggle( 'fade', {}, 1000 );
	console.log( 'building complete' );
	//jQuery.contains(document.documentElement, $sel[0]);
	return tableExists = true;
}

//a function to show a message
statusMessage = function( msg, elm, className ){
	//elm.removeClass().show().text(msg).addClass(className).effect("highlight", {}, 1000);
	elm.removeClass().show().text(msg).addClass(className);				
}
hideMessage = function( elm ){
	elm.removeClass().hide();		
}

//the core function
validateRedirects = function(  ){
	//we also want to check somewhere if the textarea has been changed since last run
	//todo
	var continueBuild = false;
	//check if the table already exists because then we want to warn before continuing
	if( tableExists ){
		continueBuild = true;
	}
	//reset the table
	if(continueBuild){
		$('#result tbody').html('');
		resetQueue();
		alert('reset!');
	}	

	var lines = convertSourceToArray();
	if ( buildTable(lines) ){
		hideMessage( $('#status-message') );
	}
	else{
		statusMessage( 'something went wrong', $('#status-message'), 'error' );
	}
	
	//process the rows to check the status of each mapping
	console.log( 'processing rows' );	
	$('.rTableRow.rTableBody').each(function(){
		//console.log( 'originalurl: ' + $(this)[0].dataset.originalurl );
		//console.log( 'checked: ' + $(this)[0].dataset.checked );
		var ischecked = ($(this)[0].dataset.checked === "true");
		if( !ischecked ){
			checkURL( $(this)[0].dataset.originalurl );
		}				
	});
	
}

/* onready */
//$(function() {
/*	$('#validate').click(function(){
		validateRedirects();
	});*/
//});