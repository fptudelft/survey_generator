/* global survey */

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