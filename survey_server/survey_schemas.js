exports.survey_entry_schema = {
    "description":"A representation of a survey entry",
    "type":"object",
    "additionalProperties":false,
    "properties":{
        "id":{
            "type":["integer","string"],
            "description":"Survey identifier",
            "required":true,
            "format":/\w+/
        },
        "answers":{
            "type":"array",
            "description":"Array of answers provided for the survey",
            "required":true,
            "min":1,
            "uniqueItems":true,
            "items":{
                "type":"object",
                "additionalProperties":false,
                "properties":{
                    "id":{
                        "type":"string",
                        "description":"Question identifier, formatted as group identifier_question identifier",
                        "format":/\w+_\w+/
                    },
                    "answer":{
                        "type":["string", "array"],
                        "description":"The answer to the question, can either be a string (most types of questions) or an array (multiple choice)"
                    }
                }
            }
        }
    }
};

// Sample:
var sample_survey_entry_object = {
    "id":"someid",
    "answers":[
        {
            "id":"groupid_questionid",
            "answer":"some answer"
        }
    ]
};