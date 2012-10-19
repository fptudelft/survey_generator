exports.start = function () {
    /**
     * Stub functional url cleaner, removes any trailing arguments for routing purposes
     * @param url
     * @return {*}
     */
    function routingPath(url) {
        return url.split(/\?|\//)[1];
    }

    /**
     * Write the header to our response and returns the response for easy chaining
     * @param type
     * @param response
     * @return {*}
     */
    function writeHeader(type, response) {
        response.writeHead(200, {
            'Content-Type':type
        });
        return response;
    }

    /**
     * Produce a friendly index page for the server
     * @param response
     */
    function produceIndex(response) {
        writeHeader('text/plain', response).end('Hello World\n');
    }

    /**
     * Produce a list of surveys that are available to the client
     * @param response
     */
    function showSurveyIndex(response) {
        writeHeader('application/json', response).end(JSON.stringify(surveyList()));
    }

    /**
     * Produces a list of surveys ready for presentation
     * @return {Array}
     */
    function surveyList() {
        // TODO: Retrieve survey list from database
        return [
            {
                "id":"1234",
                "title":"Foo"
            },
            {
                "id":"42",
                "title":"Bar"
            }
        ];
    }

    /**
     * Retrieve a survey from storage
     * @param id
     * @return {Survey}
     */
    function getSurvey(id) {
        return require("./sample_survey.js").survey;
    }

    /**
     * Renders the JSON of a requested survey, if found and accessible
     * @param url
     * @param response
     */
    function showSurvey(url, response) {
        writeHeader('application/json', response).end(JSON.stringify(getSurvey(url)));
    }

    /**
     * Process a POST of answers for a given survey.
     * @param request
     * @param response
     */
    function processAnswers(request, response) {
        // TODO: implement
    }

    /**
     * Router for the application, handles calling the methods for each API function
     * @param request
     * @param response
     */
    function onRequest(request, response) {
        switch (routingPath(request.url)) {
            case "surveys":
                showSurveyIndex(response);
                break;
            case "survey":
                showSurvey(request.url, response);
                break;
            case "answers":
                processAnswers(request, response);
                break;
            case "/favicon.ico":
                break;
            default:
                produceIndex(response);
                break;
        }

        test_schema_validation();
    }

    function test_schema_validation() {
        object = {
            "id": "1234",
            "answers": [
                {
                    "id": "group_questionid",
                    "answer": "foo"
                }
            ]
        };
        console.log(require("./lib/json-schema").validate(object, require("./survey_schemas.js").survey_entry_schema).errors.length);
    }

    // Start the server and print some helpful information to console
    require('http').createServer(onRequest).listen(3000);
    console.log('Server running at http://127.0.0.1:3000/');
};