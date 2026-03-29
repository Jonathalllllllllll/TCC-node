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



| POST | /login | Autentica o usu
