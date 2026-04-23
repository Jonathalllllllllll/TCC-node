# ComuniQ: IFSUL Gravataí 🎓

Sistema de comunicação entre estudantes e gestão escolar, permitindo o envio de demandas, mediação por eixos de ensino e fórum de discussão privado.

##  Tecnologias
- **Backend:** Node.js com Express.js
- **Frontend:** HTML5, CSS3, Bootstrap e JavaScript (EJS/View Engine)
- **Banco de Dados:** MySQL
- **Autenticação:** JWT (JSON Web Tokens) e Session

##  Funcionalidades
- **Módulo Estudante:** Cadastro, login, envio de demandas/reclamações e chat com coordenadores.
- **Módulo Admin (Coordenador):** Filtro de demandas por eixo técnico, resposta em fórum e gerenciamento de comentários.
- **Segurança:** Diferenciação de níveis de acesso (ACL) e rotas protegidas.

##  Como rodar o projeto

1. **Clone o repositório:**
   ```bash
   git clone [https://github.com/Jonathalllllllllll/TCC-node.git](https://github.com/Jonathalllllllllll/TCC-node.git)
   cd TCC-node

2. **Instale as dependências:**
npm install

3. **Configure o ambiente:**
Crie um arquivo .env na raiz com:

Snippet de código
DB_HOST=localhost
DB_PORT=3306
DB_USER=seu_usuario
DB_PASS=sua_senha
DB_NAME=comuniq_ifsul_gravatai
JWT_SECRET=sua_chave_secreta
PORT=3000


4. **Inicie o servidor:**
npm run start:dev

5. **Documentação da API (Endpoints):**



| Método | Rota | Descrição |
| :--- | :--- | :--- |
| GET | /estudante/home_page | Página Inicial estudante|
| GET | /adm/home_page | Página Inicial ADM|
| GET | /estudante/cadastro/front_end | Cadastro do estudante|
| GET | /estudante/login/frontend | Login do estudante|
| GET | /adm/cadastro/front_end | Cadastro do coordenador|
| GET | /adm/login/front_end | Login do coordenador|
| GET | /estudante/comentario/front_end | Inserção de comentário do estudante para a escola
| GET | /estudante/lista_de_comentarios | Visualização do aluno a sua página de comentários
| GET | /adm/lista_comen_e_resposta' | Visualização do coordenador aos comentários dos alunos referentes ao seu eixo
| GET | /estudante/forum/front_end/:id_comentario_E | Fórum do aluno com o coordenador
| GET | /adm/forum/front_end/:id_comentario_E | Fórum do coordenador com o aluno
| GET | /adm/exclusao_comentario/:id_comentario_E | Exclusão do comentáro do estudante pelo coordenador




| Método | Rota | Descrição |
| :--- | :--- | :--- |
| POST | /estudante/login/backend | Autentica o usuario estudante
| POST | /estudante/comentario/back_end | Validação do comentário do aluno e inserção no banco de dados
| POST | /estudante/forum/back_end | Validação do comentário do aluno
| POST | /adm/forum/back_end | validação da resposta do coordenador






