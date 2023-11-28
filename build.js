const con = require('./utils/connection.js');

let sql1 = 'CREATE TABLE data (startTime BIGINT, endTime BIGINT, consent BOOL, age INT, gender VARCHAR(255), aq VARCHAR(255), sq VARCHAR(255), mq VARCHAR(255), ta VARCHAR(255), op VARCHAR(255), comments TEXT(65535))';
let sql2 = 'CREATE TABLE emails (startTime BIGINT, endTime BIGINT, email VARCHAR(255), compensate BOOL, duration INT)';

con.query(sql1).then( result => {
    con.query(sql2).then( result => {

    }).catch(err => {
        console.log("Error: SQL error in creating emails");
        console.log(err);
    })
}).catch(err => {
    console.log("Error: SQL error in creating data");
    console.log(err);
});

