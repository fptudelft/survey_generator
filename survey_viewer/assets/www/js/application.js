/*global viewmodel */

$(document).ready(function () {
    loadSurveyApp();
});

$(document).bind("mobileinit", function () {
    $.mobile.allowCrossDomainPages = true;
    $.mobile.phonegapNavigationEnabled = true;
});

function loadSurveyApp() {
//    if (window.localStorage["survey"] === undefined) {
//        var default_settings = {
//            "value":{},
//            "settings":{
//                "key":"1" //get from input or something or load from file
//            }
//        };
//
//    }
//        window.localStorage.setItem("survey", default_settings);
    console.log("Requesting survey");
    requestSurvey(1);
//	ko.applyBindings(ko.mapping.fromJS(examplesurvey));
}

//var server = "10.0.2.2";
var server = "192.168.1.101";

function requestSurvey(survey_id) {
    console.log("Requesting survey " + survey_id);
    $.ajax({
        "url":"http://" + server + ":3000/survey/" + survey_id,
        "type":"GET",
        "dataType":"jsonp",
        "success":function (response) {
            console.log("Success");
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
            "type":"POST",
            "dataType":"jsonp",
            "data":{data:JSON.stringify(survey)},
            "success":function (response, status) {
                console.log("Survey submitted.");
            },
            "error":function (jqxhr, status, error) {
                console.log(status, error.toString());
                console.log("Store completed survey in local cache.");
            },
            "complete":function () {
                console.log("show new empty survey and/or notification of success");
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
    return groups.map(function(group) {
        return group['questions'].map(transformQuestionToAnswer);
    }).reduce(mapConcat, []);
}

function transformQuestionToAnswer(question) {
    return {
        "id": question['id'],
        "answer":question['value']
    };
}

function mapConcat(previous, current) {
    return previous.concat(current)
}

var examplesurvey = {
    "title":"Title of this survey...",
    "groups":[
        {
            "name":"g1",
            "questions":[
                {
                    "id":"q1",
                    "label":"vraag 1: number?",
                    "type":"number",
                    "value":"",
                    "min":0,
                    "max":100

                },
                {
                    "id":"q2",
                    "label":"vraag 2: text?",
                    "type":"text",
                    "value":"vul hier je waarde in",
                    "max":""

                },
                {
                    "id":"2b",
                    "label":"vraag 2: date?",
                    "type":"date",
                    "value":""
                },
                {
                    "id":"q3",
                    "label":"vraag 3: grote text:) ?",
                    "type":"large text",
                    "value":"vul hier je waarde in",
                    "max":300
                }
            ]
        },
        {
            "name":"g2",
            "questions":[
                {
                    "id":"q4",
                    "label":"vraag 4: multi select ?",
                    "type":"multi select",
                    "selected":[],
                    "options":[
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
                    "label":"vraag 5: single select ?",
                    "type":"single select",
                    "selected":ko.observable("mozart"),
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
