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
    var sql = `    CREATE TABLE IF NOT EXISTS ESTUDANTE_CADASTRO(
        nome_E varchar(40) NOT NULL,
        idade_E int NOT NULL,
        turma_E varchar(2) NOT NULL,
        email_E varchar(60) NOT NULL,
        senha_E varchar(255) NOT NULL,
        id_E INT PRIMARY KEY AUTO_INCREMENT,
        foto_E varchar(500) NOT NULL
    );`;
    
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Tabela estudante_cadastro criada");
    });
    con.end();
});