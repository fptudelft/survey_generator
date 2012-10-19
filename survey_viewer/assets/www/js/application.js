/*global viewmodel */

$(document).ready(function() {
//	$("#content").append(resulthtml);
//	$('#content').trigger("create");

	ko.applyBindings(ko.mapping.fromJS(plainJSON));
});

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

function requestSurvey(survey_id) {
	$.ajax({
		"url": "127.0.0.1:3000/survey/" + survey_id,
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
		"url": "127.0.0.1:3000/completed_survey",
		"type": "POST",
		"dataType": "JSON",
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

var plainJSON = {
	"title": "Title of this survey...",
	"groups": [
		{
			"group name": "g1",
			"questions": [
				{
					"id":"q1",
					"label":"vraag 1: number?",
					"type": "number",
					"value": "",
					"min": 0,
					"max": 100

				},
				{
					"id":"q2",
					"label": "vraag 2: text?",
					"type": "text",
					"value": "vul hier je waarde in",
					"max": ""

				},
				{
					"id":"2b",
					"label": "vraag 2: date?",
					"type": "date",
					"value": ""
				},
				{
					"id":"q3",
					"label": "vraag 3: grote text:) ?",
					"type": "large text",
					"value": "vul hier je waarde in",
					"max": 300
				}
			]
		},
		{
			"group name": "g2",
			"questions": [
				{
					"id":"q4",
					"label": "vraag 4: multi select ?",
					"type": "multi select",
					"value": "",
					"options": [
						{
							"value":"mozart"
						},
						{
							"value":"bach"
						}
					]
				},
				{
					"id":"q5",
					"label": "vraag 5: single select ?",
					"type": "single select",
					"value": "",
					"options":[
						{
							"value":"mozart"
						},
						{
							"value":"bach"
						}
					]

				}
			]
		}
	]
};
