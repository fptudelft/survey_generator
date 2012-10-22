exports.survey = {
    "title":"Title of this survey...",
    "groups":[
        {
            "name":"g1",
            "questions":[
                {
                    "id":"q1",
                    "label":"vraag 1: number?",
                    "type":["number", {
                        "value":"",
                        "min":0,
                        "max":100
                    }]
                },
                {
                    "id":"q2",
                    "label":"vraag 2: text?",
                    "type":["text", {
                        "value":"vul hier je waarde in",
                        "max":""
                    }]
                },
                {
                    "id":"2b",
                    "label":"vraag 2: date?",
                    "type":["date", {
                        "value":""
                    }]
                },
                {
                    "id":"q3",
                    "label":"vraag 3: grote text:) ?",
                    "type":["large text", {
                        "value":"vul hier je waarde in",
                        "max":300
                    }]
                }
            ]
        },
        {
            "name":"g2",
            "questions":[
                {
                    "id":"q4",
                    "label":"vraag 4: multi select ?",
                    "type":["multi select", {
                        "options":[
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
                    "label":"vraag 5: single select ?",
                    "type":["single select", {
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