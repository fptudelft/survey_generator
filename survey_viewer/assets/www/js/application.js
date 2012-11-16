$(document).ready(function () {
    loadSurveyApp();
});

$(document).bind("mobileinit", function () {
    $.mobile.allowCrossDomainPages = true;
    $.mobile.phonegapNavigationEnabled = true;
});

function loadSurveyApp() {
    if (window.location.hash) {
        requestSurvey(window.location.hash.replace('#', ''));
    } else {
        requestSurveyIndex();
    }
}

var server = "10.0.2.2";
//var server = "192.168.1.101";

function requestSurveyIndex() {
    console.log('Requesting survey index');
    $.ajax({
        "url":"http://" + server + ":3000/surveys",
        "dataType":"jsonp",
        "success":function (response) {
            console.log("requestSurveyIndex Success", response);
            //window.localStorage.getItem("survey").value = response;
            ko.applyBindings(ko.mapping.fromJS(response));
        },
        "error":function (jqxhr, status, error) {
            console.log("Error", status, error.toString());
        }
    });
}

function requestSurvey(survey_id) {
    console.log("Requesting survey " + survey_id);
    $.ajax({
        "url":"http://" + server + ":3000/survey/" + survey_id,
        "dataType":"jsonp",
        "success":function (response) {
            console.log("requestSurvey Success");
            console.log(response);
            //window.localStorage.getItem("survey").value = response;
            ko.applyBindings(ko.mapping.fromJS(response));
        },
        "error":function (jqxhr, status, error) {
            console.log("Error");
            console.log(status, error.toString());
            console.log("Try to get survey from local cache.");
            ko.applyBindings(ko.mapping.fromJS(examplesurvey));
        },
        "complete":function () {
            console.log("show new empty survey and/or notification of success");
        }
    });
}

function postSurvey(survey) {
    console.log("Submitting survey:");
    console.log(JSON.stringify(survey));
    $.ajax({
            "url":"http://" + server + ":3000/completed_survey",
            "dataType":"jsonp",
            "data":{data:JSON.stringify(survey)},
            "success":function (response, status) {
                console.log("Survey submitted.");
//                $.mobile.changePage('thanks.html');
                window.location = "thanks.html";
            },
            "error":function (jqxhr, status, error) {
                console.log(status, error.toString());
                console.log("Store completed survey in local cache.");
            }
        }
    );
}

/**
 * Handle the submit button of our survey by first transforming the data of our KO object into another format before submitting
 * @param survey
 */
function submitSurvey(survey) {
    postSurvey(transformSurveyToAnswers(ko.mapping.toJS(survey)));
    return false;
}

/**
 * Transforms a survey to an object in the format of the answers JSON schema
 * @param survey
 * @return {Object}
 */
function transformSurveyToAnswers(survey) {
    return {
        id:survey['id'],
        answers:transformGroupsToAnswers(survey['groups'])
    }
}

/**
 * Transforms a group of answers to an array of objects with a question id and answer value.
 * @param groups
 * @return {Object}
 */
function transformGroupsToAnswers(groups) {
    return groups.map(function (group) {
        return group['questions'].map(transformQuestionToAnswer);
    }).reduce(mapConcat, []);
}

function transformQuestionToAnswer(question) {
    return {
        "id":question['id'],
        "answer":question['value']
    };
}

function mapConcat(previous, current) {
    return previous.concat(current)
}

/**
 * Handler for clicks on a specific survey on the survey index page
 * @param survey
 * @return false
 */
function surveyHandler(survey) {
    // Using window.location instead of $.mobile.pageChange because of the issues with testing on files that are not served by a web server due to the origin being null
    window.location = 'survey.html#' + survey.id();
    return false;
}