exports.start = function () {
    /**
     * Router for the application, handles calling the methods for each API function
     * @param request
     * @param response
     */
    function onRequest(request, response) {
        console.log(request.url);
        findControllerAction(routingPath(request.url))(request, response);
    }

    /**
     * Returns an hash of functions handling requests for the listed url segments.
     * @return {Object}
     */
    function routes() {
        return {
            "surveys":showSurveyIndex,
            "survey":showSurvey,
            "completed_survey":processAnswers,
            "test":showTestPage,
            "favicon.ico":function (_, response) {
                response.end("\n");
            }
        };
    }

    /**
     * Returns a function that will handle the
     * @param url_part
     * @return {*}
     */
    function findControllerAction(url_part) {
        return routes()[url_part] || function (request, response) {
            console.log('No controller action defined for url segment ' + url_part);
            response.end("\n");
        };
    }

    /**
     * Returns the value of the 'callback' GET parameter
     * @param request
     * @return string | undefined
     */
    function retrieveCallbackFromRequest(request) {
        return require('url').parse(request.url, true)['query']['callback'];
    }

    /**
     * Writes a response given the original request and a parameter data accepted by JSON.stringify
     * @param request
     * @param response
     * @param data
     */
    function writeJSONPCallback(request, response, data) {
        if (retrieveCallbackFromRequest(request)) {
            response.writeHead(200, { 'Content-Type':'application/javascript' });
            response.end(retrieveCallbackFromRequest(request) + '(' + JSON.stringify(data) + ');');
        } else {
            response.writeHead(200, { 'Content-Type':'application/json' });
            response.end(JSON.stringify(data));
        }
    }

    /**
     * Parses a post string containing JSON and returns a Javascript object
     * @param post_string
     * @return {*}
     */
    function parseRequestPostBody(post_string) {
        return JSON.parse(require('querystring').parse(post_string).data);
    }

    /**
     * Stub of a functional url cleaner, returns the first segment of the URL for basic routing purposes.
     * @param url
     * @return string - url path
     */
    function routingPath(url) {
        return url.split(/\?|\//)[1];
    }


    /*
     * Controller actions:
     * /surveys action
     */

    /**
     * Produces a list of surveys that are available to the client
     * @param response
     */
    function showSurveyIndex(request, response) {
        client.query('SELECT id, title FROM surveys', function (error, rows) {
            if (error)
                throw error;
            else
                writeJSONPCallback(request, response, {"surveys":rows});
        });
    }

    /*
     * /survey/<id> action
     */

    /**
     * Retrieves the survey id from the url and calls the function retrieving and presenting the survey.
     * @param request
     * @param response
     */
    function showSurvey(request, response) {
        showSingleSurvey(request, request.url.split('/')[2], response);
    }

    /**
     * Renders the JSON of a requested survey by fetching the data from MySQL and building an hash step by step.
     * @param id
     * @param response
     */
    function showSingleSurvey(request, id, response) {
        client.query("\
            SELECT surveys.id as id, surveys.title as title, \
                groups.id as group_id, \
                questions.id as question_id, questions.label, questions.type \
            FROM surveys \
            LEFT JOIN groups \
                ON surveys.id = groups.survey_id \
            LEFT JOIN questions \
                ON groups.id = questions.group_id \
            WHERE surveys.id = ?", [id],
            function (error, rows) {
                if (error)
                    writeJSONPCallback(request, response, {errors:error});
                else if (!rows.length)
                    writeJSONPCallback(request, response, {errors:["Survey not found"]});
                else
                    writeJSONPCallback(request, response, {
                        "id":rows[0]['id'],
                        "title":rows[0]['title'],
                        "groups":createGroupArray(rows)
                    });
            });
    }

    /**
     * Initializes an hash containing group_id: {"group name": name, answers:[]} for easy filling in later.
     * @param data
     * @return {*}
     */
    function initializeGroupHash(data) {
        return data.reduce(function (previous, current) {
            previous[current['group_id']] = {"name":current['group_id'], "questions":[]};
            return previous;
        }, {});
    }

    /**
     * Fills an empty group hash with the questions retrieved from MySQL
     * @param data
     * @return {*}
     */
    function createGroupHash(data) {
        return data.reduce(function (previous, current) {
            previous[current["group_id"]]['questions'].push({
                "id":current["group_id"] + "_" + current["question_id"],
                "label":current["label"],
                "type":current["type"],
                "value":""
            });
            return previous;
        }, initializeGroupHash(data));
    }

    /**
     * Creates an array of group-representing anonymous objects.
     * @param data
     * @return [Group]
     */
    function createGroupArray(data) {
        return data.reduce(function (previous, current) {
            if (previous.indexOf(current['group_id']) == -1) {
                return previous.concat([current['group_id']]);
            } else
                return previous;
        }, []).map(function (group_id) {
                return createGroupHash(data)[group_id];
            });
    }

    /*
     * /completed_survey
     */

    /**
     * Processes a POST request of answers for a given survey.
     * @param request
     * @param response
     */
    function processAnswers(request, response) {
        var post_data = '';
        request.on('data', function (input) {
            post_data += input.toString();
        });
        request.on('end', function () {
            var output = storeAnswers(parseRequestPostBody(post_data));
            if (output.errors) {
                console.log("Post had " + output.errors.length + " errors");
                console.log(output.errors);
            } else {
                console.log("Successful post.");
            }
            writeJSONPCallback(request, response, output);
        });
    }

    /**
     * Performs validation using the JSON Schema on the provided answers object
     * @param answers
     * @return {*}
     */
    function validateAnswers(answers) {
        return require("./lib/json-schema").validate(answers, require("./survey_schemas.js").survey_entry_schema);
    }

    /**
     * Attempts to validate and store answers in the database
     * @param answer_object
     * @return {Object}
     */
    function storeAnswers(answer_object) {
        if (validateAnswers(answer_object).errors.length != 0) {
            return {success:false, errors:validateAnswers(answer_object).errors};
        } else {
            return {
                success:insertAnswers(answer_object)
            }
        }
    }

    /**
     * Performs the database insertion
     * @param answer_object
     * @return bool
     */
    function insertAnswers(answer_object) {
        return extractAnswerValues(answer_object).map(function (answer_value) {
            client.query("INSERT INTO answers (question_id, group_id, answer) VALUES (?,?,?)", answer_value, function (err) {
                // TODO: Rewrite the method to output the error
                console.log("Error:", err);
            });
            return true;
        }).reduce(function (previous, current) {
                return previous && current;
            }, true);
    }

    /**
     * Extract the answer values from the posted JSON object in a format used by our MySQL adapter.
     * @param answer_object
     * @return [[a, a, b]]
     */
    function extractAnswerValues(answer_object) {
        return answer_object['answers'].map(function (answer) {
            return [answer.id.split('_')[0], answer.id.split('_')[1], answer.answer];
        });
    }

    /*
     * /test action
     */

    /**
     * Displays a test page for server requests.
     * @param response
     */
    function showTestPage(_, response) {
        require('fs').readFile('./test.html', function (error, content) {
            if (error) {
                response.writeHead(500);
                response.end();
            }
            else {
                response.writeHead(200, { 'Content-Type':'text/html' });
                response.end(content, 'utf-8');
            }
        });
    }

    // Start the server and print some helpful information to console
    require('http').createServer(onRequest).listen(3000);
    console.log('Server running at http://127.0.0.1:3000/');

    // Connect to MySQL
    var client = require('mysql').createClient({user:'survey_server', password:"foo"});
    client.query('USE survey_server');
};