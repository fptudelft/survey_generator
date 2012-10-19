data = [
    {"title":"Some survey", "group_id":"groupid", "question_id":"1", "label":"Some question", "type":"text"},
    {"title":"Some survey", "group_id":"groupid", "question_id":"2", "label":"Another question", "type":"large text"},
    {"title":"Some survey", "group_id":"groupid2", "question_id":"3", "label":"Group 2 question", "type":"text"}
];

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
console.log(createGroupArray(data));

// doel:
var foo = [
    {
        "group name":"groupid",
        "questions":[]
    }
];