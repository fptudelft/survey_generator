/* global survey */
/*

function fold() {

}

function appendHTML(append_monad) {

}
*/

var plainJSON = {
	"title": "Title of this survey...",
	"groups": [
		{
			"group name": "g1",
			"questions": [
				{
					"id":"q1",
					"label":"vraag 1: number?",
					"type": ["number", {
						"value": "",
						"min": 0,
						"max": 100
					}]
				},
				{
					"id":"q2",
					"label": "vraag 2: text?",
					"type": ["text", {
						"value": "vul hier je waarde in",
						"max": ""
					}]
				},
				{
					"id":"2b",
					"label": "vraag 2: date?",
					"type": ["date", {
						"value": ""
					}]
				},
				{
					"id":"q3",
					"label": "vraag 3: grote text:) ?",
					"type": ["large text", {
						"value": "vul hier je waarde in",
						"max": 300
					}]
				}
			]
		},
		{
			"group name": "g2",
			"questions": [
				{
					"id":"q4",
					"label": "vraag 4: multi select ?",
					"type": ["multi select", {
						"value": "",
						"options": [
							{
								"value":"mozart"
							},
							{
								"value":"bach"
							}
						]
					}]
				},
				{
					"id":"q5",
					"label": "vraag 5: single select ?",
					"type": ["single select", {
						"value": "",
						"options":[
							{
								"value":"mozart"
							},
							{
								"value":"bach"
							}
						]
					}]
				}
			]
		}
	]
};

//var viewmodel = ko.mapping.fromJS(plainJSON);
//console.log(viewmodel);
//var resulthtml = mapSurvey(plainJSON);

$(document).ready(function() {
//	$("#content").append(resulthtml);
//	$('#content').trigger("create");

	ko.applyBindings(ko.mapping.fromJS(plainJSON));

});

//document.getElementById("content")

function mapSurvey(survey) {
	return 	"<form><h1>" + survey.title + "</h1>" +
		survey.groups.map(function (group) {
				return "<div>" + group.questions.map(function (question) {
					var questiontext = "<h2>" + question.label + "</h2>";

					switch (question.type[0]) {
						case "text":
							return questiontext.concat(textTemplate(question.type[1]));
						case "large text":
							return questiontext.concat(largetextTemplate(question.type[1]));
						case "number":
							return questiontext.concat(numberTemplate(question.type[1]));
						case "date":
							return questiontext.concat(dateTemplate(question.type[1]));
						case "multi select":
							return questiontext.concat(checkboxlistTemplate(question.type[1]));
						case "single select":
							return questiontext.concat(radiobuttonlistTemplate(question.type[1]));
					}
				}).reduce(function (prev, current) {
						return prev.concat(current);
					}) + "</div>";
			}
		).reduce(function (prev, current) {
				return prev.concat(current);
			}) + "<button type='submit' value='Verstuur' /> </form>";
}

function textTemplate(question) {

	return "<input type='text' data-bind='viewmodel:question.value'/>";
}

function largetextTemplate(question) {
	return "<textarea>" + question.value + "</textarea>";
}

function numberTemplate(question) {
	return "<input type='number' >" + question.value + "</input>";
}

function dateTemplate(question) {
	return "<input type='date'>" + question.value + "</input>";
}

function checkboxlistTemplate(question) {
	var optionshtml = question.options.map(
		function (option) {
			return "<input id='" + option.value + "' name='" + question.id + "' type='checkbox' />" +
				"<label for='" + option.value + "'>" + option.value + "</label>";
		}
	).reduce(
		function (prev, current) {
			return prev.concat(current);
		}
	);

	console.log(optionshtml);
	return 	"<div data-role='fieldcontain'>" +
			"	<fieldset data-role='controlgroup'>" +
					optionshtml +
			"	</fieldset>" +
			"</div>";
}


function radiobuttonlistTemplate(question) {
	var optionshtml = question.options.map(
		function (option) {
			return "<input id='" + option.value + "' name='" + question.id + "' type='radio' />" + //TODO: id should be unique
				"<label for='" + option.value + "'>" + option.value + "</label>";
		}
	).reduce(
		function (prev, current) {
			return prev.concat(current);
		}
	);

	return 	"<div data-role='fieldcontain'>" +
		"	<fieldset data-role='controlgroup'>" +
		optionshtml +
		"	</fieldset>" +
		"</div>";
}


//	return "<form><h1 data-bind='text: title'></h1>" +
//		"<div data-bind='foreach: groups'>" +
//			"<h2 data-bind='text: name'></h2>" +
//			"<div data-bind='foreach: questions'>" +
//				"<h3 data-bind='text: label'></h3>" +
//
//				"<!-- ko if: type[0]=='text' -->" +
//				"<input type='text' data-bind='value: type[1].value'/>" +
//				"<!-- /ko -->" +
//
//				"<!-- ko if: type[0]=='large text' -->" +
//				"<textarea data-bind='value: type[1].value'></textarea>" +
//				"<!-- /ko -->" +
//
//				"<!-- ko if: type[0]=='number' -->" +
//				"<input type='number' data-bind='value: type[1].value + ' />" +
//				"<!-- /ko -->" +
//
//				"<!-- ko if: type[0]=='date' -->" +
//				"<input type='date' data-bind='value: type[1].value' />" +
//				"<!-- /ko -->" +
///*
//				"<!-- ko if: type[0]=='multi select' -->" +
//				"<div data-role='fieldcontain'>" +
//					"<fieldset data-role='controlgroup'>" +
//						"<!-- ko foreach: type[1].options -->" +
//						"<input data-bind=\"attr: { 'id': value, 'name': 'xxxx' }\" type='checkbox' />" +
//						"<label data-bind=\"attr: { 'for': 'xxxx', 'value': value }\"></label>" +
//						"<!-- /ko -->" +
//					"</fieldset>" +
//				"</div>" +
//				"<!-- /ko -->" +
//*/
//
//
//			"</div>" +
//		"</div>" +
//		"</form>";
//
