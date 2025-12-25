const express = require('express');
const mysql = require('mysql');
const formidable = require('formidable');
const fs = require('fs');
const { DateTime } = require('luxon');
const path = require('path');
const app = express();
app.set('view engine', 'ejs');
app.use(express.static("public"));
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { Console } = require('console');
const moment = require('moment');
var session = require('express-session');
const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "comuniq_ifsul_gravatai",
    port: 3306

});
app.use(session({
    secret: '2C44-4D44-WppQ38S',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1800000
    }
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());



con.connect(function (err) {
    if (err) {
        console.error("Erro ao conectar ao banco de dados:", err.message);
    } else {
        console.log("Conectado ao banco de dados MySQL.");
    }
});



function verificarEstudante(req, res, next) {
    if (!req.session.loggedin || req.session.tipo !== "estudante") {
        return res.redirect('/estudante/login/frontend');
    }
    next();
}

function verificarAdmin(req, res, next) {
    if (!req.session.loggedin_adm || req.session.tipo !== "admin") {
        return res.redirect('/adm/login/front_end');
    }
    next();
}



app.get('/', function (req, res) {
    res.render('usuarios_home_page.ejs');
});




app.get('/estudante/home_page', function (req, res) {

    let userName = null;
    let userImage = null;
    var userId = req.session.user_id_E;

    var sqlUser = "SELECT nome_E, foto_E FROM ESTUDANTE_CADASTRO WHERE id_E = ?";

    console.log("ID da sessão:", req.session.user_id_E);


    con.query(sqlUser, [userId], function (err, userResult) {
        if (err) {
            console.error("Erro ao buscar imagem do usuário estudante:", err);
            return res.status(500).send("Erro no servidor");
        }

        if (userResult.length > 0) {
            userName = userResult[0].nome_E;
            userImage = userResult[0].foto_E || 'default-avatar.png';
        } else {
            userName = 'Estudante';
            userImage = 'default-avatar.png';
        }



        console.log("Resultado da busca do usuário:", userResult);

        var sql = "SELECT * FROM ESTUDANTE_CADASTRO";

        con.query(sql, function (err, result, fields) {
            if (err) {
                console.error("Erro ao buscar dados:", err);
                res.status(500).send("Erro no servidor");
                return;
            }

            console.log("Resultado da tabela completa:", result);




            res.render('estudante/estudante_home_page.ejs', {
                //info_cadastro_E: result,
                erro_edicao: req.query.erro_edicao || null,
                erro_exclusao: req.query.erro_exclusao || null,
                sucesso_edicao: req.query.sucesso_edicao || null,
                userName: userName,
                userImage: userImage

            });
        });
    });
});



app.get('/estudante/cadastro/front_end', function (req, res) {
    var userId = req.session.user_id_E;
  
    var sqlUser = "SELECT nome_E, foto_E FROM ESTUDANTE_CADASTRO WHERE id_E = ?";
  
    con.query(sqlUser, [userId], function (err, userResult) {
      if (err) {
        console.error("Erro ao buscar imagem do usuário estudante:", err);
        return res.status(500).send("Erro no servidor");
      }
  
      let userName, userImage;
  
      if (userResult.length > 0) {
        userName = userResult[0].nome_E;
        userImage = userResult[0].foto_E;
      } else {
        userName = 'Estudante';
        userImage = 'default-avatar.png';
      }
  
      return res.render('estudante/estudante_form_cadastro.ejs', {
        userName: userName,
        userImage: userImage
      });
    });
  });
  

app.post('/estudante/cadastro/back_end', function (req, res) {
    var form = new formidable.IncomingForm();
    var saltRounds = 10;

    form.parse(req, (err, fields, files) => {
        if (err) {
            if (err.code === 1010) {
                return res.status(400).send("O arquivo não pode estar vazio.");
            }
            return res.status(500).send("Erro ao processar o formulário.");
        }
        if (files.foto_E && files.foto_E[0].size === 0) {
            return res.status(400).send("O arquivo não pode estar vazio.");
        }
        if (files.foto_E && files.foto_E[0]) {
            var oldpath = files.foto_E[0].filepath;
            var ext = path.extname(files.foto_E[0].originalFilename);
            var nomefoto_E = files.foto_E[0].newFilename + ext;
            var newpath = path.join(__dirname, 'public/imagens/estudante/estudante_cadastro', nomefoto_E);

            fs.rename(oldpath, newpath, function (err) {
                if (err) {
                    console.error("Erro ao mover o arquivo:", err);
                    return res.status(500).send("Erro no upload de imagem");
                }
                bcrypt.hash(fields['senha_E'][0], saltRounds, function (err, hash) {

                    if (err) {
                        console.error("Erro ao gerar o hash da senha:", err);
                        return res.status(500).send("Erro ao processar a senha.");
                    }

                    var sql = "INSERT INTO ESTUDANTE_CADASTRO (nome_E, turma_E, idade_E, foto_E, email_E, senha_E) VALUES ?";
                    var values = [[
                        fields['nome_E'][0],
                        fields['turma_E'][0],
                        fields['idade_E'][0],
                        nomefoto_E,
                        fields['email_E'][0],
                        hash,
                    ]];



                    con.query(sql, [values], function (err, result) {
                        if (err) {
                            console.error("Erro ao inserir no banco de dados:", err);
                            return res.status(500).send("Erro ao salvar no banco de dados.");
                        }
                        console.log("Número de registros inseridos: " + result.affectedRows);
                        res.redirect('/estudante/login/frontend');
                    });

                    req.session.tipo == verificarEstudante;
                });
            });
        } else {
            res.status(400).send("Imagem não enviada corretamente.");
        }
    });
});


app.get('/estudante/cadastro_edicao_frontend/:id_E', verificarEstudante, (req, res) => {
    if (!req.session.loggedin) {
        return res.redirect('/estudante/login/frontend');

    }

    console.log("ID do estudante recebido:", req.params.id_E);
    console.log("ID do usuário logado:", req.session.user_id_E);


    var sql = "SELECT * FROM ESTUDANTE_CADASTRO WHERE id_E = ? AND id_E = ?";
    var id_cadastro_E = [req.params.id_E, req.session.user_id_E];

    var userImage = req.session.userImage || 'default-avatar.png';
    var userName = req.session.userName || 'Estudante';


    con.query(sql, id_cadastro_E, function (err, result, fields) {
        if (err) {
            console.error("Erro ao buscar produto:", err);
            return res.redirect('/?erro_edicao=' + encodeURIComponent('Erro ao buscar o produto.'));
        }
        if (result.length === 0) {
            console.log("Usuário não encontrado.");
            return res.redirect('/?erro_edicao=' + encodeURIComponent('Você não conseguirá editar os dados deste usuário.'));
        }

        return res.render('estudante_form_cadastro_edicao.ejs', {
            userImage: userImage,
            userName: userName,
            info_cadastro_E: result
        });
    });
});


app.post('/estudante/cadastro_edicao_backend/:id_E', function (req, res) {



    var form = new formidable.IncomingForm({ allowEmptyFiles: true, minFileSize: 0 });
    form.parse(req, (err, fields, files) => {
        if (err) {
            console.error("Erro ao processar formulário:", err);
            return res.redirect('/?erro_edicao=' + encodeURIComponent('Erro ao processar o formulário.'));
        }
        let nomeimg = null;

        if (files.foto_E && files.foto_E[0] && files.foto_E[0].size > 0) {
            var oldpath = files.foto_E[0].filepath;
            var ext = path.extname(files.foto_E[0].originalFilename);
            nomeimg = files.foto_E[0].newFilename + ext;
            var newpath = path.join(__dirname, 'public/imagens/estudante/estudante_cadastro', nomeimg);

            fs.rename(oldpath, newpath, function (err) {
                if (err) throw err;
            });
        } else {
            nomeimg = fields.arquivo_atual;
        }
        var sql = "UPDATE ESTUDANTE_CADASTRO SET nome_E = ?, turma_E = ?, idade_E = ?, foto_E = ?, email_E = ?, senha_E = ? WHERE id_E = ?";

        var values = [
            fields['nome_E'][0],
            fields['turma_E'][0],
            fields['idade_E'][0],
            nomeimg,
            fields['email_E'][0],
            fields['senha_E'][0],
            req.params.id_E,
            req.session.user_id_E
        ];
        con.query(sql, values, function (err, result) {
            if (err) {
                console.error("Erro ao atualizar produto:", err);
                return res.redirect('/estudante/home_page?erro_edicao=' + encodeURIComponent('Erro ao atualizar o produto.'));
            }
            return res.redirect('/estudante/home_page?sucesso_edicao=' + encodeURIComponent('Produto atualizado com sucesso!'));
        });
    });
});




    app.get('/estudante/login/frontend', function (req, res) {
        var userId = req.session.user_id_E;
    
        var sqlUser = "SELECT nome_E, foto_E FROM ESTUDANTE_CADASTRO WHERE id_E = ?";
    
        con.query(sqlUser, [userId], function (err, userResult) {
        if (err) {
            console.error("Erro ao buscar imagem do usuário estudante:", err);
            return res.status(500).send("Erro no servidor");
        }
    
        let userName, userImage;
    
        if (userResult.length > 0) {
            userName = userResult[0].nome_E;
            userImage = userResult[0].foto_E;
        } else {
            userName = 'Estudante';
            userImage = 'default-avatar.png';
        }

        res.render('estudante/estudante_form_login.ejs', {
            mensagem: "Realize o Login",
            userImage: userImage,
            userName: userName
        });
        });
    });



    app.post('/estudante/login/backend', (req, res) => {
        var { email_E, senha_E } = req.body;


        const sql = "SELECT * FROM ESTUDANTE_CADASTRO WHERE email_E = ?";
        con.query(sql, [email_E], (err, result) => {
            if (err) {
                console.error("Erro ao buscar usuário:", err);
                return res.send("Erro no servidor.");
            }

            if (result.length >  0) {
                const user = result[0];


                bcrypt.compare(senha_E, user.senha_E, (err, match) => {
                    if (err) {
                        console.error("Erro ao comparar senhas:", err);
                        return res.send("Erro interno.");
                    }

                    if (match) {
                        req.session.loggedin = true;
                        req.session.tipo = 'estudante';
                        req.session.user_id_E = user.id_E;
                        req.session.userName = user.nome_E;

                        return res.redirect('/estudante/home_page');
                    } else {
                        return res.redirect('/estudante/login/frontend?erro=1');

                    }
                });
            } else {
                return res.redirect('/estudante/login/frontend?erro=1');
            }
        });
    });


    app.get('/estudante/logout', function (req, res) {
        req.session.destroy(function (err) {
            if (err) {
                return res.status(500).send("Erro ao estudante tentar fazer o logout.");
            }
            res.redirect('/');

        });
    });


app.get('/estudante/comentario/front_end', verificarEstudante, (req, res) => {
    var userId = req.session.user_id_E;
  
    var sqlUser = "SELECT nome_E, foto_E FROM ESTUDANTE_CADASTRO WHERE id_E = ?";
  
    con.query(sqlUser, [userId], function (err, userResult) {
      if (err) {
        console.error("Erro ao buscar imagem do usuário estudante:", err);
        return res.status(500).send("Erro no servidor");
      }
  
      let userName, userImage;
  
      if (userResult.length > 0) {
        userName = userResult[0].nome_E;
        userImage = userResult[0].foto_E || 'default-avatar.png';
      } else {
        userName = 'Estudante';
        userImage = 'default-avatar.png';
      }
  
      res.render('estudante/estudante_form_comentario.ejs', {
        userImage: userImage,
        userName: userName
      });
    });
  });
  
  app.post('/estudante/comentario/back_end', function (req, res) {


    if (!req.session.loggedin) {
        return res.redirect('/estudante/login/frontend');
    }

    var form = new formidable.IncomingForm({
        allowEmptyFiles: true,
        minFileSize: 0  
    });

    form.uploadDir = path.join(__dirname, 'public/imagens/estudante/estudante_comentario'); 
    form.keepExtensions = true; 
    form.multiples = false;

    if (!fs.existsSync(form.uploadDir)) {
        fs.mkdirSync(form.uploadDir, { recursive: true });
    }

    form.parse(req, (err, fields, files) => {
        if (err) {
            console.error("Erro ao processar o formulário:", err);
            return res.status(500).send("Erro no servidor ao processar o formulário.");
        }

        var id_E = req.session.user_id_E;
        if (!id_E) {
            return res.status(400).send("ID do estudante não encontrado na sessão.");
        }

        var comentario = fields.comentario_E?.[0] || '';
        var categoria = fields.categoria_comentario_E?.[0] || '';

        const now = DateTime.now().setZone('America/Sao_Paulo');
        var data = now.toFormat('yyyy-MM-dd HH:mm:ss');

        let foto = '';


        if (files.foto_comentario_E && files.foto_comentario_E.length > 0 && files.foto_comentario_E[0].originalFilename) {
            const file = files.foto_comentario_E[0];
            const oldPath = file.filepath;
            const newPath = path.join(form.uploadDir, file.originalFilename);

            try {
                fs.renameSync(oldPath, newPath);
                foto = file.originalFilename;
            } catch (err) {
                console.error("Erro ao mover arquivo:", err);
            }
        }

        var buscarCategoria = "SELECT id_eixo FROM eixo WHERE descricao_subeixo = ?";
        con.query(buscarCategoria, [categoria], function (err, result) {
            if (err) {
                console.error("Erro ao buscar categoria:", err);
                return res.status(500).send("Erro ao buscar categoria.");
            }

            if (result.length === 0) {
                return res.status(400).send("Categoria inválida. Nenhum eixo correspondente encontrado.");
            }
        
            const id_eixo_fk = result[0].id_eixo; 
            inserirComentario(id_eixo_fk);
        });

        function inserirComentario(categoria) {
            var sql = "INSERT INTO ESTUDANTE_COMENTARIO (id_E, comentario_E, id_eixo_fk, data_comentario_E, foto_comentario_E) VALUES ?";
            var values = [[id_E, comentario, categoria, data, foto]];

            con.query(sql, [values], function (err, result) {
                if (err) {
                    console.error("Erro ao inserir o comentário:", err);
                    return res.status(500).send("Erro ao salvar comentário.");
                }

                console.log("Número de registros inseridos:", result.affectedRows);
                res.redirect('/estudante/home_page');
            });
        }
    });
});




app.get('/estudante/lista_de_comentarios', verificarEstudante, (req, res) =>{
    if (!req.session || !req.session.loggedin) {
        return res.redirect('/estudante/login/frontend');
    }

    let userName = null;
    let userImage = null;
    var userId = req.session.user_id_E;

    var sql = `SELECT ec.comentario_E, ec.id_comentario_E, ec.data_comentario_E, ec.status_comentario_E, ec.id_eixo_fk,
                      e.nome_E, e.foto_E
               FROM ESTUDANTE_COMENTARIO ec
               JOIN ESTUDANTE_CADASTRO e ON ec.id_E = e.id_E
               WHERE e.id_E = ?
               ORDER BY data_comentario_E DESC`;

    con.query(sql, [userId], function (err, result) {
        if (err) {
            console.error("Erro ao buscar dados:", err);
            res.status(500).send("Erro no servidor");
            return;
        }


        result.forEach(row => {
            if (row.id_eixo_fk == 1) row.nome_eixo = "Social";
            else if (row.id_eixo_fk == 2) row.nome_eixo = "Infraestrutura";
            else if (row.id_eixo_fk == 3) row.nome_eixo = "Pedagógico";
            else row.nome_eixo = "Não informado";
        });




        userName = result.length > 0 ? result[0].nome_E : 'Estudante';
        userImage = result.length > 0 ? (result[0].foto_E || 'default-avatar.png') : 'default-avatar.png';

        res.render('estudante/estudante_lista_comentarios', {
            dadoscomentario: result,
            erro_edicao: req.query.erro_edicao || null,
            erro_exclusao: req.query.erro_exclusao || null,
            sucesso_edicao: req.query.sucesso_edicao || null,
            userName: userName,
            userImage: userImage
        });
    });
});




    app.get('/estudante/formulario/edicao_comentario_frontend/:id_E', verificarEstudante, (req, res) => {
        if (!req.session.loggedin) {
            return res.redirect('/login');
        }
        var sql = "SELECT * FROM ESTUDANTE_COMENTARIO WHERE id_E = ? AND id_E_foreign = ?";
        var id = [req.params.id, req.session.user_id];
        var userImage = req.session.userImage || 'default-avatar.jpg';
        var userName = req.session.userName || 'Usuário';


        con.query(sql, id, function (err, result, fields) {
            if (err) {
                console.error("Erro ao buscar produto:", err);
                return res.redirect('/?erro_edicao=' + encodeURIComponent('Erro ao buscar o produto.'));
            }
            if (result.length === 0) {
                console.log("Produto não encontrado ou não pertence ao usuário.");
                return res.redirect('/?erro_edicao=' + encodeURIComponent('Você não possue permissão para realizar a edição deste produto!'));
            }

            //result[0].data = moment(result[0].data).format('YYYY-MM-DDTHH:mm');

            return res.render('estudante_form_edicao.ejs', {
                userImage: userImage,
                userName: userName,
                dadosProduto: result
            });
        });
    });


    app.post('/estudante/formulario/edicao_comentario_backend/:id_E', function (req, res) {

        

        var form = new formidable.IncomingForm({ allowEmptyFiles: true, minFileSize: 0 });
        form.parse(req, (err, fields, files) => {
            if (err) {
                console.error("Erro ao processar formulário:", err);
                return res.redirect('/?erro_edicao=' + encodeURIComponent('Erro ao processar o formulário.'));
            }
            let nomeimg = null;

            if (files.foto_comentario_E && files.foto_comentario_E[0] && files.foto_comentario_E[0].size > 0) {
                var oldpath = files.foto_comentario_E[0].filepath;
                var ext = path.extname(files.foto_comentario_E[0].originalFilename);
                nomeimg = files.foto_comentario_E[0].newFilename + ext;
                var newpath = path.join(__dirname, 'public/imagens/', nomeimg);

                fs.rename(oldpath, newpath, function (err) {
                    if (err) throw err;
                });
            } else {
                nomeimg = fields.arquivo_atual;
            }
            var sql = "UPDATE ESTUDANTE_COMENTARIO SET comentario_E = ?, foto_comentario_E = ? WHERE id_E = ? and id_E_foreign = ?";
            var values = [
                fields['comentario_E'][0],
                foto_comentario_E,
                req.params.id,
                req.session.user_id
            ];
            con.query(sql, values, function (err, result) {
                if (err) {
                    console.error("Erro ao atualizar produto:", err);
                    return res.redirect('/?erro_edicao=' + encodeURIComponent('Erro ao atualizar o produto.'));
                }
                return res.redirect('/?sucesso_edicao=' + encodeURIComponent('Produto atualizado com sucesso!'));
            });
        });
    });

   


    //ADMINISTRADOR


    
    
    
    
    app.get('/adm/home_page', function (req, res) {
    
        let userName_adm = null;
        let userImage_adm = null;
        var userId_adm = req.session.user_id_adm;
    
        var sqlUser = "SELECT nome_adm, foto_adm FROM ADMINISTRADOR_CADASTRO WHERE id_adm = ?";
        con.query(sqlUser, [userId_adm], function (err, userResult) {
            if (err) {
                console.error("Erro ao buscar imagem do usuário estudante:", err);
                res.status(500).send("Erro no servidor");
                return;
            }
            if (userResult.length > 0) {
                userName_adm = userResult[0].nome_adm;
                userImage_adm = userResult[0].foto_adm || 'default-avatar.png';
            } else {
                userName_adm = 'Coordenador';
                userImage_adm = 'default-avatar.png';
            }
    
    
            var sql = "SELECT * FROM ADMINISTRADOR_CADASTRO";
            con.query(sql, function (err, result, fields) {
                if (err) {
                    console.error("Erro ao buscar dados:", err);
                    res.status(500).send("Erro no servidor");
                    return;
                }
    
                res.render('administrador/administrador_home_page.ejs', {
                    //dadosProduto: result,
                    erro_edicao: req.query.erro_edicao || null,
                    erro_exclusao: req.query.erro_exclusao || null,
                    sucesso_edicao: req.query.sucesso_edicao || null,
                    userName_adm: userName_adm,
                    userImage_adm: userImage_adm
                });
            });
        });
    });
    
    
    
    app.get('/adm/cadastro/front_end', function (req, res) {
        var userName_adm = req.session.userName_adm || 'Coordenador';
        var userImage_adm = req.session.userImage_adm || 'default-avatar.png';
    
        return res.render('administrador/administrador_form_cadastro.ejs', {
            userName_adm,
            userImage_adm
        });
    });
    
    
    app.post('/adm/cadastro/back_end', function (req, res) {
        var form = new formidable.IncomingForm();
        var saltRounds = 10;
    
        form.parse(req, (err, fields, files) => {
            if (err) {
                if (err.code === 1010) {
                    return res.status(400).send("O arquivo não pode estar vazio.");
                }
                return res.status(500).send("Erro ao processar o formulário.");
            }
            if (files.foto_adm && files.foto_adm[0].size === 0) {
                return res.status(400).send("O arquivo não pode estar vazio.");
            }
            if (files.foto_adm && files.foto_adm[0]) {
                var oldpath = files.foto_adm[0].filepath;
                var ext = path.extname(files.foto_adm[0].originalFilename);
                var nomefoto_adm = files.foto_adm[0].newFilename + ext;
                var newpath = path.join(__dirname, 'public/imagens/administrador/adm_cadastro', nomefoto_adm);
    
                fs.rename(oldpath, newpath, function (err) {
                    if (err) {
                        console.error("Erro ao mover o arquivo:", err);
                        return res.status(500).send("Erro no upload de imagem");
                    }
                    bcrypt.hash(fields['senha_adm'][0], saltRounds, function (err, hash_adm) {
    
                        if (err) {
                            console.error("Erro ao gerar o hash da senha:", err);
                            return res.status(500).send("Erro ao processar a senha.");
                        }
    
                        var sql = "INSERT INTO ADMINISTRADOR_CADASTRO (nome_adm, coordenadoria_adm, id_eixo_fk, foto_adm, email_adm, senha_adm) VALUES ?";
                        var values = [[
                            fields['nome_adm'][0],
                            fields['coordenadoria_adm'][0],
                            fields['eixo_adm'][0],
                            nomefoto_adm,            
                            fields['email_adm'][0],
                            hash_adm
                        ]];
    
    
                     
                        con.query(sql, [values], function (err, result) {
                            if (err) {
                                console.error("Erro ao inserir no banco de dados:", err);
                                return res.status(500).send("Erro ao salvar no banco de dados.");
                            }
                            console.log("Número de registros inseridos: " + result.affectedRows);
                            res.redirect('/adm/login/front_end');
                        });
                    });
                });
            } else {
                res.status(400).send("Imagem não enviada corretamente.");
            }

            /*var sql2 = "INSERT INTO EIXO (id_adm) where ADMINISTRADOR_CADASTRO.id_eixo_fk == ESTUDANTE_EIXO.descricao_eixo";
            var values = [[
                fields['nome_adm'][0],
                fields['coordenadoria_adm'][0],
                fields['eixo_adm'][0],
                nomefoto_adm,            
                fields['email_adm'][0],
                hash_adm,
                req.session.user_id_adm
            ]];


         
            con.query(sql2, [values], function (err, result) {
                if (err) {
                    console.error("Erro ao inserir no banco de dados:", err);
                    return res.status(500).send("Erro ao salvar no banco de dados.");
                }
                console.log("Número de registros inseridos: " + result.affectedRows);
                res.redirect('/adm/login/front_end');
            });*/
        });
    });
    
    
    app.get('/adm/cadastro_edicao_frontend/:id_E', function (req, res) {
        if (!req.session.loggedin) {
            return res.redirect('/estudante/login/frontend');
        }
        var sql = "SELECT * FROM ESTUDANTE_CADASTRO WHERE id_E = ?";
        var id_cadastro_E = [req.params.id_adm, req.session.user_id_adm];
        var userImage_adm = req.session.userImage_adm || 'default-avatar.jpg';
        var userName_adm = req.session.userName || 'Usuário';
    
    
        con.query(sql, id_cadastro_E, function (err, result, fields) {
            if (err) {
                console.error("Erro ao buscar produto:", err);
                return res.redirect('/?erro_edicao=' + encodeURIComponent('Erro ao buscar o produto.'));
            }
            if (result.length === 0) {
                console.log("Usuário não encontrado.");
                return res.redirect('/?erro_edicao=' + encodeURIComponent('Você não conseguirá editar os dados deste usuário.'));
            }
    
            return res.render('estudante_form_cadastro_edicao.ejs', {
                userImage: userImage,
                userName: userName,
                dadosProduto: result 
            });
        });
    });
    
    
    app.post('/adm/cadastro_edicao_backend/:id_E', function (req, res) {
    
    
        var form = new formidable.IncomingForm({ allowEmptyFiles: true, minFileSize: 0 });
        form.parse(req, (err, fields, files) => {
            if (err) {
                console.error("Erro ao processar formulário:", err);
                return res.redirect('/?erro_edicao=' + encodeURIComponent('Erro ao processar o formulário.'));
            }
            let nomeimg = null;
    
            if (files.foto_E && files.foto_E[0] && files.foto_E[0].size > 0) {
                var oldpath = files.foto_E[0].filepath;
                var ext = path.extname(files.foto_E[0].originalFilename);
                nomeimg = files.foto_E[0].newFilename + ext;
                var newpath = path.join(__dirname, 'public/imagens/estudante', nomeimg);
    
                fs.rename(oldpath, newpath, function (err) {
                    if (err) throw err;
                });
            } else {
                nomeimg = fields.arquivo_atual;
            }
            var sql = "UPDATE ESTUDANTE_CADASTRO SET nome_E = ?, turma_E = ?, idade_E = ?, foto_E = ?, email_E = ?, senha_E = ? WHERE id_E = ?";
    
                var values = [
                fields['nome_E'][0],
                fields['turma_E'][0],
                fields['idade_E'][0],
                foto_E,
                fields['email_E'][0],
                fields['senha_E'][0],
                req.params.id_E,
                req.session.user_id_E
            ];
            con.query(sql, values, function (err, result) {
                if (err) {
                    console.error("Erro ao atualizar produto:", err);
                    return res.redirect('/?erro_edicao=' + encodeURIComponent('Erro ao atualizar o produto.'));
                }
                return res.redirect('/?sucesso_edicao=' + encodeURIComponent('Produto atualizado com sucesso!'));
            });
        });
    });
    
    
    
    
    app.get('/adm/login/front_end', function (req, res) {
        let userImage_adm = null;
        let userName_adm = null;
    
        if (req.session.loggedin) {
            userImage_adm = req.session.userImage_adm;
            userName_adm = req.session.userName_adm;
    
        }
        else{
            userImage_adm = 'default-avatar.png';
            userName_adm = 'Coordenador';
        }
        res.render('administrador/administrador_form_login.ejs', {
            mensagem: "Realize o Login",
            userImage_adm: userImage_adm,
            userName_adm: userName_adm
        });
    });
    
    
    app.post('/adm/login/backend', function (req, res) {
        var { email_adm, senha_adm } = req.body;
        var sql = "SELECT id_adm, nome_adm, email_adm, senha_adm, foto_adm FROM ADMINISTRADOR_CADASTRO WHERE email_adm = ?";
        
        con.query(sql, [email_adm], function (err, result) { 
            if (err) {
                return res.status(500).send("Erro no servidor");
            }
    
            if (result.length) {
                var admin = result[0];
    
                bcrypt.compare(senha_adm, admin.senha_adm, function (err, resultado) {
                    if (err) throw err;
    
                    if (resultado) {
                        req.session.loggedin_adm = true;
                        req.session.tipo = "admin"; 
                        req.session.userName_adm = admin.nome_adm;
                        req.session.user_id_adm = admin.id_adm;
                        req.session.userImage_adm = admin.foto_adm || 'default-avatar.png';
    
                        return res.redirect('/adm/home_page');
                    } else {
                        return res.redirect('/adm/login/front_end?erro=1');
                    }
                });
            } else { 
                console.log("E-mail não encontrado");
                return res.render('administrador/administrador_form_login.ejs', { 
                    mensagem: "E-mail não encontrado", 
                    userName_adm: 'Coordenador', 
                    userImage_adm: 'default-avatar.png' 
                });
                
            }
        });
    });
    
    
    
    app.get('/adm/logout', function (req, res) {
        req.session.destroy(function (err) {
            if (err) {
                return res.status(500).send("Erro ao administrador tentar fazer o logout.");
            }
            res.redirect('/');
    
        });
    });
    
    
   
    app.put('/adm/reclamacoes/:id', (req, res) => {
        const { id } = req.params;
        const { status } = req.body;
    
        if (!['Pendente', 'Em análise', 'Resolvido'].includes(status)) {
            return res.status(400).json({ error: 'Status inválido' });
        }
    
        const sql = `UPDATE reclamacoes SET status = ? WHERE id = ?`;
        db.query(sql, [status, id], (err, result) => {
            if (err) {
                console.error('Erro ao atualizar status:', err);
                return res.status(500).json({ error: 'Erro interno no servidor' });
            }
            res.json({ message: 'Status atualizado com sucesso!' });
        });
    });
    
    


    app.get('/adm/lista_comen_e_resposta', verificarAdmin, (req, res) => {
        if (!req.session || !req.session.loggedin_adm) {
            return res.redirect('/adm/login/front_end');
        }
    
        var userId_adm = req.session.user_id_adm;
    
        
        var sql = `
            SELECT 
                estudante_comentario.*,
                eixo.descricao_subeixo,
                administrador_cadastro.nome_adm,
                administrador_cadastro.foto_adm,
                estudante_cadastro.nome_E
            FROM 
                estudante_comentario
            JOIN 
                administrador_cadastro
                ON estudante_comentario.id_eixo_fk = administrador_cadastro.id_eixo_fk
            JOIN 
                estudante_cadastro
                ON estudante_comentario.id_E = estudante_cadastro.id_E
            JOIN 
                eixo 
                ON estudante_comentario.id_eixo_fk = eixo.id_eixo

            WHERE 
                administrador_cadastro.id_adm = ?
            ORDER BY estudante_comentario.data_comentario_E DESC;
        `;
    
        con.query(sql, [userId_adm], function (err, result) {
            if (err) {
                console.error("Erro ao buscar dados:", err);
                return res.status(500).send("Erro no servidor");
            }
    
            const nomeAdm = result.length > 0 ? result[0].nome_adm : 'Coordenador';
            const fotoAdm = result.length > 0 ? (result[0].foto_adm || 'default-avatar.png') : 'default-avatar.png';
    
            res.render('administrador/administrador_lista_comentarios', {
                dadosrecebidos: result,
                erro_edicao: req.query.erro_edicao || null,
                erro_exclusao: req.query.erro_exclusao || null,
                sucesso_edicao: req.query.sucesso_edicao || null,
                userName_adm: nomeAdm,
                userImage_adm: fotoAdm
            });
        });
    });
    
        
 
    app.get('/estudante/forum/front_end/:id_comentario_E', verificarEstudante, (req, res) => {
        if (!req.session || !req.session.loggedin) {
          return res.redirect('/estudante/login/frontend');
        }
      
        var userId = req.session.user_id_E;
        var idComentario = req.params.id_comentario_E;
      
        var sqlUser = "SELECT nome_E, foto_E FROM ESTUDANTE_CADASTRO WHERE id_E = ?";
      
        con.query(sqlUser, [userId], function (err, userResult) {
          if (err) {
            console.error("Erro ao buscar imagem do usuário estudante:", err);
            return res.status(500).send("Erro no servidor");
          }
      
          let userName, userImage;
      
          if (userResult.length > 0) {
            userName = userResult[0].nome_E;
            userImage = userResult[0].foto_E || 'default-avatar.png';
          } else {
            userName = 'Estudante';
            userImage = 'default-avatar.png';
          }
      
        
          var sql = `
            SELECT 
                ec.id_comentario_E,
                ec.comentario_E,
                ec.data_comentario_E,
                ec.status_comentario_E,
                ec.foto_comentario_E,
                ares.resposta_adm,
                ares.data_resposta_adm,
                ares.id_adm,
                ac.nome_adm,
                ac.coordenadoria_adm,
                ac.foto_adm,
                e.descricao_subeixo
            FROM estudante_comentario ec
            LEFT JOIN administrador_resposta ares ON ec.id_comentario_E = ares.id_comentario_E
            LEFT JOIN administrador_cadastro ac ON ares.id_adm = ac.id_adm
            JOIN eixo e ON ec.id_eixo_fk = e.id_eixo
            WHERE ec.id_E = ? AND ec.id_comentario_E = ?
            LIMIT 1;
          `;
      
          con.query(sql, [userId, idComentario], function (err, result) {
            if (err) {
              console.error("Erro ao buscar dados:", err);
              return res.status(500).send("Erro no servidor");
            }
      
            if (result.length === 0) {
              return res.status(404).send("Comentário não encontrado ou não pertence ao seu eixo.");
            }
      
            var dados = result[0];
      
            res.render('estudante/estudante_conversa_pv', {
              comentario: dados,
              userName_adm: dados.nome_adm,
              userImage_adm: dados.foto_adm,
              userName: userName,
              userImage: userImage
            });
          });
        });
      });
      




app.post('/estudante/forum/back_end', function (req, res) {
    if (!req.session || !req.session.loggedin) {
        return res.redirect('/estudante/login/front_end');
    }

    const userId = req.session.user_id;

    var form = new formidable.IncomingForm();

    form.parse(req, (err, fields) => {
        if (err) {
            console.error("Erro ao processar o formulário:", err);
            return res.status(500).send("Erro no servidor ao processar o formulário.");
        }

        console.log("Campos recebidos:", fields);

        const id_comentario_E = fields.id_comentario_E?.[0] || null;
        const resposta_adm = fields.resposta_adm?.[0] || '';
        const data_resposta_adm = new Date();

        if (!id_comentario_E || !resposta_adm.trim()) {
            return res.status(400).send("Comentário ou resposta inválidos.");
        }

        con.query(sql, [userId, id_comentario_E, resposta_adm, data_resposta_adm], function (err, result) {
            if (err) {
                console.error("Erro ao inserir resposta do administrador:", err);
                return res.status(500).send("Erro ao salvar a resposta.");
            }

            console.log("Resposta do administrador salva com sucesso.");
            res.redirect(`/adm/forum/front_end/${id_comentario_E}`);
        });
    });
});
    
    
    app.get('/adm/forum/front_end/:id_comentario_E', verificarAdmin, (req, res) => {
        if (!req.session || !req.session.loggedin_adm) {
            return res.redirect('/adm/login/front_end');
        }
    
        const userId_adm = req.session.user_id_adm;
        const idComentario = req.params.id_comentario_E;
    
        const sql = `
       SELECT 
    ec.id_comentario_E,
    ec.comentario_E,
    ec.data_comentario_E,
    ec.status_comentario_E,
    ec.foto_comentario_E,
    ares.resposta_adm,
    ares.data_resposta_adm,
    ac.nome_adm,
    ac.foto_adm,
    e.descricao_subeixo,
    est.nome_E,
    est.foto_E,
    est.turma_E
FROM estudante_comentario ec
LEFT JOIN administrador_resposta ares ON ec.id_comentario_E = ares.id_comentario_E
LEFT JOIN administrador_cadastro ac ON ares.id_adm = ac.id_adm  -- ⚠️ aqui! pegar o admin que respondeu
JOIN eixo e ON ec.id_eixo_fk = e.id_eixo
JOIN estudante_cadastro est ON ec.id_E = est.id_E
WHERE ec.id_comentario_E = ?
LIMIT 1;


        `;
    
        con.query(sql, [idComentario], function (err, result) {
            if (err) {
                console.error("Erro ao buscar dados:", err);
                return res.status(500).send("Erro no servidor");
            }
        
            if (result.length === 0) {
                return res.status(404).send("Comentário não encontrado.");
            }
        
            const dados = result[0];
        
            res.render('administrador/administrador_conversa_pv', {
                comentario: dados
            });
        });
    });
    

    

    app.post('/adm/forum/back_end', function (req, res) {
        if (!req.session || !req.session.loggedin_adm) {
            return res.redirect('/adm/login/front_end');
        }
    
        const userId_adm = req.session.user_id_adm;
    
        var form = new formidable.IncomingForm();
    
        form.parse(req, (err, fields) => {
            if (err) {
                console.error("Erro ao processar o formulário:", err);
                return res.status(500).send("Erro no servidor ao processar o formulário.");
            }
    
            console.log("Campos recebidos:", fields);
    
            let id_comentario_E = fields.id_comentario_E?.[0] || null;
            let resposta_adm = fields.resposta_adm?.[0] || '';
  
            const now = DateTime.now().setZone('America/Sao_Paulo');
        let data_resposta_adm = now.toFormat('yyyy-MM-dd HH:mm:ss');
    
            if (!id_comentario_E || !resposta_adm.trim()) {
                return res.status(400).send("Comentário ou resposta inválidos.");
            }
    
            const sql1 = `INSERT INTO administrador_resposta 
            (id_adm, id_comentario_E, resposta_adm, data_resposta_adm) 
            VALUES (?, ?, ?, ?)`;
            
            const sql2 = `UPDATE estudante_comentario 
            SET status_comentario_E = ? 
            WHERE id_comentario_E = ?`;
            
            con.query(sql1, [userId_adm, id_comentario_E, resposta_adm, data_resposta_adm], function (err, result) {
                if (err) {
                    console.error("Erro ao inserir resposta do administrador:", err);
                    return res.status(500).send("Erro ao salvar a resposta.");
                }
            
                con.query(sql2, ['Resolvido', id_comentario_E], function (err2, result2) {
                    if (err2) {
                        console.error("Erro ao atualizar status do comentário:", err2);
                        return res.status(500).send("Erro ao atualizar status.");
                    }
            
                    console.log("Resposta e status atualizados com sucesso.");
                    res.redirect(`/adm/forum/front_end/${id_comentario_E}`);
                });
            });
            



        });
    });
    


    app.get('/adm/exclusao_comentario/:id_comentario_E', verificarAdmin, (req, res) => {
        if (!req.session || !req.session.loggedin_adm) {
          return res.redirect('/adm/login/front_end');
        }
      
        const idComentario = req.params.id_comentario_E;
      
        const sql = "SELECT * FROM ESTUDANTE_COMENTARIO WHERE id_comentario_E = ?";
        con.query(sql, [idComentario], (err, result) => {
          if (err) {
            console.error("Erro ao buscar comentário:", err);
            return res.redirect('/?erro_exclusao=' + encodeURIComponent('Erro ao buscar comentário.'));
          }
      
          if (result.length === 0) {
            console.log("Comentário não encontrado");
            return res.redirect('/?erro_exclusao=' + encodeURIComponent('Comentário não encontrado!'));
          }
      
          const comentario = result[0];
          const imgPath = path.join(__dirname, 'public/imagens/estudante/estudante_comentario/', comentario.foto_comentario_E || '');
      

          function excluirRegistros() {

            const sql3 = "DELETE FROM ADMINISTRADOR_RESPOSTA WHERE id_comentario_E = ?";
            con.query(sql3, [idComentario], (err, resultResposta) => {
              if (err) {
                console.error("Erro ao excluir resposta do administrador:", err);
                return res.status(500).send("Erro ao excluir resposta do administrador.");
              }
      

              const sql2 = "DELETE FROM ESTUDANTE_COMENTARIO WHERE id_comentario_E = ?";
              con.query(sql2, [idComentario], (err, resultComentario) => {
                if (err) {
                  console.error("Erro ao excluir comentário:", err);
                  return res.status(500).send("Erro ao excluir comentário.");
                }
      
                console.log(`Comentário ${idComentario} e resposta (se existia) excluídos com sucesso!`);
                res.redirect('/adm/lista_comen_e_resposta');
              });
            });
          }
      
          if (comentario.foto_comentario_E) {
            fs.access(imgPath, fs.constants.F_OK, (err) => {
              if (!err) {
                fs.unlink(imgPath, (err) => {
                  if (err) console.error("Erro ao excluir imagem:", err);
                  excluirRegistros();
                });
              } else {
                excluirRegistros();
              }
            });
          } else {
            excluirRegistros();
          }
        });
      });
      





    
    app.get('/adm/lista_comentarios/back_end/:id_comentario_E', verificarAdmin, (req, res) => {
    
    
        if (!req.session || !req.session.loggedin) {
            return res.redirect('/estudante_form_login');
        }
    
        let userName = null;
        let userImage = null;
        var userId = req.session.user_id;
    
        var sqlUser = "SELECT nome_E, foto_E FROM ESTUDANTE_CADASTRO WHERE id_E = ?";
        con.query(sqlUser, [userId], function (err, userResult) {
            if (err) {
                console.error("Erro ao buscar imagem do usuário:", err);
                res.status(500).send("Erro no servidor");
                return;
            }
            if (userResult.length > 0) {
                userName = userResult[0].nome;
                userImage = userResult[0].imagem || 'default-avatar.jpg';
            } else {
                userName = 'Usuário';
                userImage = 'default-avatar.jpg';
            }
    
    
            var sql = "SELECT comentario_E, id_E FROM ESTUDANTE_COMENTARIO where id_E_foreign =?";
            con.query(sql, [userId], function (err, result, fields) {
                if (err) {
                    console.error("Erro ao buscar dados:", err);
                    res.status(500).send("Erro no servidor");
                    return;
                }
    
               /* result.forEach(element => {
                    //element.data = moment(element.data).format('DD/MM/YYYY HH:mm');
                });
                */
                res.render('estudante_listar_apontamentos', {
                    dadosProduto: result,
                    erro_edicao: req.query.erro_edicao || null,
                    erro_exclusao: req.query.erro_exclusao || null,
                    sucesso_edicao: req.query.sucesso_edicao || null,
                    userName: userName,
                    userImage: userImage
    
                });
            });
        });
    
    }
    );



    app.listen(3000, function () {
        console.log("Servidor Escutando na porta 3000");
    });