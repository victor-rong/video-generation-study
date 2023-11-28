var mysql = require('mysql');
var config = require('../config.js');

class Database {
    constructor( config ) {
        this.connection = mysql.createPool( config );
    }
    query( sql, args ) {
        return new Promise( ( resolve, reject ) => {
            this.connection.query( sql, args, ( err, rows ) => {
                if ( err )
                    return reject( err );
                resolve( rows );
            } );
        } );
    }
    close() {
        return new Promise( ( resolve, reject ) => {
            this.connection.end( err => {
                if ( err )
                    return reject( err );
                resolve();
            } );
        } );
    }
}

var pool = new Database(config.DB_PARAMS);

function handleDisconnect() {
  con = mysql.createConnection(config.DB_PARAMS); // Recreate the connection, since
                                                  // the old one cannot be reused.

  con.connect(function(err) {              // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    }                                     // to avoid a hot loop, and to allow our node script to
  });                                     // process asynchronous requests in the meantime.
                                          // If you're also serving http, display a 503 error.
  con.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      con = undefined;                                  // server variable configures this)
      console.log(err);
    }
  });
}

var getConnection = function(callback) {
    pool.getConnection(function(err, connection) {
        callback(err, connection);
    });
};

var wrap_cb = function(connection, cb) {
    cb = (cb => {
        return function () {
          connection.release();
          cb.apply(this, arguments);
        };
    })(cb);
    return cb;
}

var query = function(sql, callback) {
    pool.getConnection(function(err, conn) {
        if (err) {
           try { 
               conn.release();
           } catch (error) {
               console.log(err);
           }
        } else {
            conn.query(sql, wrap_cb(conn, callback));
        }
    })
}

module.exports = pool;