1.# ComuniQ: IFSUL Gravataí (Express.js)

2. Descrição 
Aplicação web de comunicação estudantil desenvolvida para auxiliar alunos da escola IFSUL Gravataí a se comunicarem com a gestão da instituição usando Express e MySQL.

3. Tecnologias Utilizadas (Tech Stack)

- Back-end: Node.js, Express.js.

- Front-end: CSS, Boostrap, HTML, JavaScript.

- Banco de Dados: MySQL.

4. Funcionalidades 

[x] CRUD completo de usuários estudante e administrador.

[x] Estudante envia demandas, visualiza a lista de comentários e conversa com administrador.

[x] Administrador responde demandas, visualiza a lista de comentários dos estudantes de seu respectivo eixo.

5. Como Rodar o Projeto

Bash
# Clone o repositório
git clone https://github.com/Jonathalllllllllll/TCC-node.git

# Instale as dependências
npm install # ou composer install

# Configure o .env

Crie um arquivo `.env` na raiz do projeto e preencha as seguintes chaves:

```env
# Configurações do Banco
DB_HOST=localhost
DB_PORT=5432
DB_USER=host
DB_PASS=000
DB_NAME=comuniq_ifsul_gravatai

# Autenticação
JWT_SECRET=chave_2222_222

# App
PORT=8080 (ou 3000)


# Rode a aplicação
npm run start:dev



6. Documentação da API (Endpoints)

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



| POST | /estudante/login/backend | Autentica o usuario estudante

| POST | /estudante/comentario/back_end | Validação do comentário do aluno e inserção no banco de dados

| POST | /estudante/forum/back_end | Validação do comentário do aluno

| POST | /adm/forum/back_end | validação da resposta do coordenador






