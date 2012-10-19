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
        client.query('SELECT id, title FROM surveys', function (error, rows, fields) {
            if (error) {
                throw error;
            }

            response.end(JSON.stringify(rows));
        });
    }

    /**
     * Renders the JSON of a requested survey, if found and accessible
     * @param url
     * @param response
     */
    function showSurvey(id, response) {
        // TODO, implement correctly in a neat way
        client.query("SELECT surveys.title as title, groups.id as group_id, questions.id as question_id, questions.label, questions.type FROM surveys \
        left join groups \
        on surveys.id = groups.survey_id \
        left join questions \
        on groups.id = questions.group_id \
        where surveys.id=?", [id], function (error, rows) {
            if (error)
                response.end(error.toString());
            else
            response.end(JSON.stringify(createGroupArray(rows)));
//                return {
//                    title: rows[0].title,
//                    groups: rows.reduce(function(current, previous){
//
//                    }, [])
//                }
        });
    }

    function initializeGroupHash(data) {
        return data.reduce(function (previous, current) {
            previous[current['group_id']] = {"group name":current['group_id'], "answers":[]};
            return previous;
        }, {});
    }

    function createGroupHash(data) {
        return data.reduce(function (previous, current) {
            previous[current["group_id"]]['answers'].push({
                "id":current["group_id"] + "_" + current["question_id"],
                "label":current["label"],
                "type":current["type"]
            });
            return previous;
        }, initializeGroupHash(data));
    }

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


    /**
     * Process a POST of answers for a given survey.
     * @param request
     * @param response
     */
    function processAnswers(request, response) {
        var post_data = '';
        request.on('data', function (input) {
            post_data += input.toString();
        });
        request.on('end', function () {
            response.end(JSON.stringify(storeAnswers(getAnswersData(post_data))));
        });
    }

    /**
     * Parses a post string containing JSON and returns a Javascript object
     * @param post_string
     * @return {*}
     */
    function getAnswersData(post_string) {
        return JSON.parse(require('querystring').parse(post_string).data);
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
                success:insertAnswers(answer_object).reduce(function (previous, current) {
                    return previous && current;
                }, true)
            }
        }
    }

    /**
     * Performs the database insertion
     * @param answer_object
     * @return {*}
     */
    function insertAnswers(answer_object) {
        return extractAnswerValues(answer_object).map(function (answer_value) {
            // TODO: Perform error handling
            client.query("INSERT INTO answers (question_id, group_id, answer) VALUES (?,?,?)", answer_value);
            return true;
        });
    }

    function extractAnswerValues(answer_object) {
        return answer_object['answers'].map(function (answer) {
            return [answer.id.split('_')[0], answer.id.split('_')[1], answer.answer];
        });
    }

    /**
     * Router for the application, handles calling the methods for each API function
     * @param request
     * @param response
     */
    function onRequest(request, response) {
        switch (routingPath(request.url)) {
            case "favicon.ico":
                break;
            case "surveys":
                showSurveyIndex(response);
                break;
            case "survey":
                showSurvey(request.url.split('/')[2], response);
                break;
            case "answers":
                processAnswers(request, response);
                break;
            case "test":
                showTest(response);
                break;
            default:
                produceIndex(response);
                break;
        }

//        test_schema_validation();
    }

    function showTest(response) {
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
    var client = require('mysql').createClient({user:'survey_server', password:"foobar"});
    client.query('USE survey_server');
};