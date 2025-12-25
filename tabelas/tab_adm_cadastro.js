var mysql = require('mysql');
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "reclame_aqui_campus_gravatai",
    port:3306

});
con.connect(function (err) {
    if (err) throw err;
    console.log("Conectado!");
    var sql = `CREATE TABLE IF NOT EXISTS ADMINISTRADOR_CADASTRO(
        nome_adm varchar(40) NOT NULL,
        coordenadoria_adm varchar(30) NOT NULL,
        tipo_adm varchar(50) NOT NULL,
        email_adm varchar(60) NOT NULL,
        senha_adm varchar(255) NOT NULL,
        id_adm INT PRIMARY KEY AUTO_INCREMENT,
        foto_adm varchar(500) NOT NULL
    );`;
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Tabela administrador_cadastro criada");
    });
    con.end();
});