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
    var sql = `    CREATE TABLE IF NOT EXISTS USUARIOS_RELACIONAMENTO(
        id_E INT PRIMARY KEY AUTO_INCREMENT,
        id_E_foreign INT,
        id_adm INT PRIMARY KEY AUTO_INCREMENT,
        id_adm_foreign INT,
        comentario_E text,
        resposta_adm text
    );`;
    
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Tabela RELACIONAMENTO criada");
    });
    con.end();
});