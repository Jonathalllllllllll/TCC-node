var mysql = require('mysql');
var con = mysql.createConnection({
host: "localhost",
 user: "root",
 password: "",
 database: "tcc",
 port:3306

});
con.connect(function(err) {
 if (err) throw err;
 console.log("Conectado à base de dados tcc!");
 con.end();
});