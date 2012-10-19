exports.start = function () {
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
                showSingleSurvey(request.url.split('/')[2], response);
                break;
            case "completed_survey":
                processAnswers(request, response);
                break;
            case "test":
                showTestPage(response);
                break;
            default:
                response.end("\n");
        }
    }

    /**
     * Stub of a functional url cleaner, removes any trailing arguments for routing purposes
     * @param url
     * @return {*}
     */
    function routingPath(url) {
        return url.split(/\?|\//)[1];
    }


    /**
     * Produces a list of surveys that are available to the client
     * @param response
     */
    function showSurveyIndex(response) {
        client.query('SELECT id, title FROM surveys', function (error, rows) {
            if (error)
                throw error;
            else
                response.end(JSON.stringify(rows));
        });
    }

    /**
     * Renders the JSON of a requested survey by fetching the data from MySQL and building an hash step by step.
     * @param id
     * @param response
     */
    function showSingleSurvey(id, response) {
        client.query("\
            SELECT surveys.title as title, \
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
                    response.end(error.toString());
                else
                    response.end(JSON.stringify({
                        "title":rows[0]['title'],
                        "groups":createGroupArray(rows)
                    }));
            });
    }

    /**
     * Initializes an hash containing group_id: {"group name": name, answers:[]} for easy filling in later.
     * @param data
     * @return {*}
     */
    function initializeGroupHash(data) {
        return data.reduce(function (previous, current) {
            previous[current['group_id']] = {"group name":current['group_id'], "answers":[]};
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
            previous[current["group_id"]]['answers'].push({
                "id":current["group_id"] + "_" + current["question_id"],
                "label":current["label"],
                "type":current["type"]
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
            response.end(JSON.stringify(storeAnswers(parseRequestPostBody(post_data))));
        });
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
                console.log(err);
            });
            return true;
        }).reduce(function(previous, current) {return previous && current; }, true);
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

    /**
     * Displays a test page for server requests.
     * @param response
     */
    function showTestPage(response) {
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