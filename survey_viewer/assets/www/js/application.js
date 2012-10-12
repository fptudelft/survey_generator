$( document ).bind( "mobileinit", function() {
    $.mobile.allowCrossDomainPages = true;
	$.mobile.phonegapNavigationEnabled = true;
});


$(function() {

	// Temporarily include the dataset in this file to prevent CORS issues when opening index.html in a local browser
	var input_data = {
	   "question block":{
	      "question":{
	         "id":"xxxx",
	         "label":"xxxxxxxx",
	         "type":{
	            "text":"blabla",
	            "multi select":{
	               "options":[
	                  {
	                     "value":"mozart"
	                  },
	                  {
	                     "value":"bach"
	                  }
	               ]
	            },
	            "single select":{
	               "options":[
	                  {
	                     "value":"mozart"
	                  },
	                  {
	                     "value":"bach"
	                  }
	               ]
	            }
	         }
	      }
	   }
	};
	
	console.log(input_data);
});