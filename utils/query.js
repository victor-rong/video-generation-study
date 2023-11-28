const stats = require("./stats.js");
const con = require('./connection.js');

function sanitize(string) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        "/": '&#x2F;',
    };
    const reg = /[&<>"'/]/ig;
    return string.replace(reg, (match)=>(map[match]));
}

exports.sendToSQL = function(data, callback){
    let startTime = parseInt(data[0]["startTime"]);
    let endTime = (new Date()).getTime();
    let consent = data[0]["consent"] ? 1 : 0;
    let age = parseInt(data[1]["age"]);
    let gender = sanitize(data[1]["gender"]);
    let comparisons = {
        "AQ": "",
        "SQ": "",
        "MQ": "",
        "TA": "",
        "OP": ""
    };
    for (let attr in comparisons) {
        for (let i = 2; i < data.length - 1; i++) {
            let char = "-";
            if (data[i][attr + "0"])
                char = "0";
            if (data[i][attr + "1"])
                char = "1";
            comparisons[attr] += char;
        }
    }
    let comments = sanitize(data[data.length - 1]["comments"]);

    let sql = `INSERT INTO data (startTime, endTime, consent, age, gender, aq, sq, mq, ta, op, comments) VALUES (${startTime}, ${endTime}, ${consent}, ${age}, '${gender}', '${comparisons["AQ"]}', '${comparisons["SQ"]}', '${comparisons["MQ"]}', '${comparisons["TA"]}', '${comparisons["OP"]}', '${comments}')`
    console.log(sql);
    con.query(sql).then( result => {

    }).catch(err => {
        console.log("Error: SQL error in creating entry");
        console.log(err);
        callback();
    });

    let email = sanitize(data[0]["email"])
    let compensate = data[0]["compensate"] ? 1 : 0;
    let duration = parseInt(data[0]["duration"]);

    sql = `INSERT INTO emails (startTime, endTime, email, compensate, duration) VALUES (${startTime}, ${endTime}, '${email}', '${compensate}', ${duration})`
    con.query(sql).then( result => {

    }).catch(err => {
        console.log("Error: SQL error in creating entry");
        console.log(err);
        callback();
    });
};

function getNotOurs(order) {
    if (order[0] === "ours")
        return {"method": order[1], "idx": 1};
    return {"method": order[0], "idx": 0};
}

exports.getResults = function(data, callback){
    let sql = `SELECT * FROM data`;
    return con.query(sql).then( responses => {
        let metrics = ["aq", "sq", "mq", "ta", "op"];
        let analysis = {
            "num": 0,
            "comparisons": {}
        };
        let result = {
            "num": 0,
            "comparisons": {}
        }
        for (let i = 0; i < data.length; i++) {
            let method = getNotOurs(data[i]["order"])["method"];
            if (!(method in result["comparisons"])) {
                analysis["comparisons"][method] = {
                    "num": 1,
                };
                result["comparisons"][method] = {
                    "num": 1,
                }; 
                for (let m of metrics) {
                    analysis["comparisons"][method][m] = []
                    result["comparisons"][method][m] = {"ratio": 0, "chisq": 0};
                }
            }
            else {
                analysis["comparisons"][method]["num"]++;
                result["comparisons"][method]["num"]++;
            }
        }

        for (let k = 0; k < responses.length; k++) {
            for (let method in result["comparisons"]) {
                for (let m of metrics) {
                    analysis["comparisons"][method][m].push(0);
                }
            }
            for (let i = 0; i < data.length; i++) {
                for (let m of metrics) {
                    let notOurs = getNotOurs(data[i]["order"]);
                    let method = notOurs["method"];
                    let idx = notOurs["idx"];
                    
                    let selection = responses[k][m][i];
                    if (idx.toString() === selection.toString()) {
                        analysis["comparisons"][method][m][analysis["comparisons"][method][m].length-1]++;
                    }
                }
            }
        }
        let df = 1;
        for (let method in result["comparisons"]) {
            for (let m of metrics) {
                for (let k = 0; k < responses.length; k++) {
                    result["comparisons"][method][m]["ratio"] += analysis["comparisons"][method][m][k];
                }
                let expected = 0.5 * responses.length * result["comparisons"][method]["num"];
                let test_statistic = 2 * Math.pow(result["comparisons"][method][m]["ratio"] - expected, 2) / (expected);

                result["comparisons"][method][m]["chisq"] = 1.0 - stats.chisq(test_statistic, df);
                result["comparisons"][method][m]["ratio"] /= (1.0 * responses.length * result["comparisons"][method]["num"]);
            }
        }
        console.log(analysis)
        return {"analysis": result, "responses": responses};
    }).catch(err => {
        console.log("Error: SQL error in selecting data");
        console.log(err);
        callback();
    });
};