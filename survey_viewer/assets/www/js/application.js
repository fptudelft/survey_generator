/*global viewmodel */

var survey_viewmodel;

$(document).bind("mobileinit", function () {
	$.mobile.allowCrossDomainPages = true;
	$.mobile.phonegapNavigationEnabled = true;
});

function loadSurveyApp() {
	if (window.localStorage["survey"] === undefined) {
		var default_settings = {
			"value": {},
			"settings": {
				"key": "1" //get from input or something or load from file
			}
		};

		window.localStorage.setItem("survey", default_settings);
	}
}

function createViewModel(survey) {
	survey_viewmodel = ko.mapping.fromJS(survey);
	console.log(survey_viewmodel);
}

function requestSurvey(survey_id) {
	$.ajax({
		"url": "127.0.0.0:10001/survey/" + survey_id,
		"type": "GET",
		"dataType": "json",
		"success": function (response) {
			//window.localStorage.getItem("survey").value = response;
		},
		"error": function (jqxhr, status, error) {
			console.log("Try to get survey from local cache.");
		},
		"complete": function (){
			console.log("show new empty survey and/or notification of success");
		}
	});
}

function submitSurvey(survey) {
	$.ajax({
		"url": "127.0.0.0:10001/completed_survey",
		"type": "POST",
		"data": survey,
		"success": function (response, status) {
			console.log("Survey submitted.");
		},
		"error": function (jqxhr, status, error) {
			console.log("Store completed survey in local cache.");
		},
		"complete": function (){
			console.log("show new empty survey and/or notification of success");
		}
	});
}

//$(function() {
//
//	// Temporarily include the dataset in this file to prevent CORS issues when opening index.html in a local browser
//	var input_data = {
//	   "question block":{
//	      "question":{
//	         "id":"xxxx",
//	         "label":"xxxxxxxx",
//	         "type":{
//	            "text":"blabla",
//	            "multi select":{
//	               "options":[
//	                  {
//	                     "value":"mozart"
//	                  },
//	                  {
//	                     "value":"bach"
//	                  }
//	               ]
//	            },
//	            "single select":{
//	               "options":[
//	                  {
//	                     "value":"mozart"
//	                  },
//	                  {
//	                     "value":"bach"
//	                  }
//	               ]
//	            }
//	         }
//	      }
//	   }
//	};
//
//	console.log(input_data);
//});

//
//function mapSurvey2Observable(survey_dictionary) {
//	return survey_dictionary.map(function ($) {
//		return $.map()
//	})
//}
