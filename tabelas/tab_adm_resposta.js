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
    var sql = `    CREATE TABLE IF NOT EXISTS ADMINISTRADOR_RESPOSTA(
        resposta_adm text NOT NULL,
        id_adm int,
        id_adm_foreign int NOT NULL,
        id_comentario_E int,
        id_comentario_E_foreign int NOT NULL,
        PRIMARY KEY (id_adm_foreign, id_comentario_E_foreign),
        FOREIGN KEY (id_adm_foreign) REFERENCES ADMINISTRADOR_CADASTRO(id_adm),
        FOREIGN KEY (id_comentario_E_foreign) REFERENCES ESTUDANTE_COMENTARIO(id_comentario_E)
    );`;
    

    /*
    obs: adicionar

    id_resposta_adm
    data_resposta_adm

    e retirar o id_comentario_E porque isso se utilizará na tabela de relcionamento
    */
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Tabela administrador_resposta criada");
    });
    con.end();
});