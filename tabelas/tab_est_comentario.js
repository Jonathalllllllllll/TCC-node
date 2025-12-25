var mysql = require('mysql');
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "reclame_aqui_campus_gravatai",
    port: 3306
});

con.connect(function (err) {
    if (err) throw err;
    console.log("Conectado!");
    
    var sql = `CREATE TABLE IF NOT EXISTS ESTUDANTE_COMENTARIO(
        id_comentario_E INT AUTO_INCREMENT PRIMARY KEY, 
        comentario_E TEXT NOT NULL,
        foto_comentario_E VARCHAR(500),
        categoria_comentario_E ENUM('Social', 'Arquitetura', 'Administrativo-Pedagogico') NOT NULL,
        status_comentario_E ENUM('Pendente', 'Resolvido') DEFAULT 'Pendente',
        data_comentario_E TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        id_E INT NOT NULL,
        FOREIGN KEY (id_E) REFERENCES ESTUDANTE_CADASTRO(id_E)
    );`;
    
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Tabela ESTUDANTE_COMENTARIO criada");
    });

    con.end();
});
