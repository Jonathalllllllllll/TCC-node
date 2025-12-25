var mysql = require('mysql');
var con = mysql.createConnection({
host: "localhost",
 user: "root",
 password: "",
 port:3306
});
con.connect(function(err) {
    if (err) throw err;
    console.log("Conectado!");
    var sql = "CREATE DATABASE IF NOT EXISTS tcc"
   
    con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Base de dados tcc criada");
    });
    con.end();
   });
  
