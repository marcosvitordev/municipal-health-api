# API de Gestão de Saúde Municipal

## Visão Geral

Esta API foi desenvolvida para gerenciar informações de saúde em um município, incluindo pacientes, institutos, profissionais e solicitações de serviços. Ela oferece um sistema de autenticação baseado em tokens JWT e controle de acesso por função (RBAC) para garantir a segurança dos dados.

## Funcionalidades

* **Autenticação de Usuário:** Sistema de login seguro usando tokens JWT para proteger os endpoints.
* **Controle de Acesso por Função (RBAC):** Diferentes níveis de acesso para administradores, municípios, institutos e profissionais.
* **Gerenciamento de Municípios:** Operações de CRUD para gerenciar os municípios.
* **Gerenciamento de Institutos:** Operações de CRUD para gerenciar os institutos de saúde.
* **Gerenciamento de Profissionais:** Operações de CRUD para gerenciar os profissionais de saúde.
* **Gerenciamento de Pacientes:** Operações de CRUD para gerenciar os pacientes.
* **Gerenciamento de Solicitações:** Criação, atribuição, agendamento e atualização de status de solicitações de serviços.
* **Upload de Documentos:** Suporte para upload de documentos relacionados às solicitações.
* **Notificações:** Sistema de notificações para manter os usuários informados sobre eventos importantes.
* **Estatísticas e Logs:** Endpoints para visualizar estatísticas e logs de auditoria.
* **Dashboard:** Endpoint específico para o dashboard do município.
* **Configurações do Sistema:** Gerenciamento de configurações do sistema.
* **Backup:** Funcionalidade para criar e baixar backups do banco de dados.

## Estrutura do Projeto

O projeto está organizado da seguinte forma:

* **/src/controllers:** Lógica de negócios e manipulação de solicitações.
* **/src/database:** Configuração e conexão com o banco de dados.
* **/src/middlewares:** Middlewares de autenticação, RBAC e tratamento de erros.
* **/src/routes:** Definição dos endpoints da API.
* **/src/services:** Lógica de acesso ao banco de dados e serviços auxiliares.
* **/src/utils:** Funções utilitárias.
* **/sql:** Scripts SQL para a criação do esquema do banco de dados e dados de exemplo.

## Endpoints da API

A seguir estão os principais endpoints da API:

* `GET /api/health`: Verifica o status da API.
* `POST /api/auth/register`: Registra um novo usuário.
* `POST /api/auth/login`: Realiza o login de um usuário.
* `GET /api/users/me`: Obtém informações do usuário autenticado.
* `PUT /api/users/me`: Atualiza as informações do usuário autenticado.
* `PUT /api/users/me/password`: Altera a senha do usuário autenticado.
* `GET, POST, PUT, DELETE /api/users`: Operações de CRUD para usuários.
* `GET, POST, PUT, DELETE /api/municipalities`: Operações de CRUD para municípios.
* `GET, POST, PUT, DELETE /api/institutes`: Operações de CRUD para institutos.
* `GET, POST, PUT, DELETE /api/professionals`: Operações de CRUD para profissionais.
* `GET, POST, PUT, DELETE /api/patients`: Operações de CRUD para pacientes.
* `GET, POST /api/requests`: Cria e lista solicitações.
* `GET, POST /api/requests/:id/assign, /schedule, /status, /return`: Gerencia solicitações.
* `GET /api/requests/:id/documents`: Obtém os documentos de uma solicitação.
* `POST /api/documents`: Realiza o upload de um documento.
* `GET /api/documents/:id/url`: Obtém a URL de um documento.
* `GET /api/notifications/me`: Lista as notificações do usuário.
* `POST /api/notifications/:id/read`: Marca uma notificação como lida.
* `GET /api/stats/municipalities`: Obtém estatísticas dos municípios.
* `GET /api/audit-logs`: Obtém os logs de auditoria.
* `GET, PUT /api/settings`: Gerencia as configurações do sistema.
* `GET /api/dashboard/municipality`: Obtém os dados do dashboard do município.
* `POST /api/backup/start`: Inicia um backup manual.
* `GET /api/backups`: Lista o histórico de backups.
* `GET /api/backup/download/:filename`: Baixa um arquivo de backup.

## Como Executar

1.  **Instale as dependências:**
    ```bash
    npm install
    ```
2.  **Configure as variáveis de ambiente:**
    Crie um arquivo `.env` na raiz do projeto e configure as seguintes variáveis:
    * `DB_HOST`
    * `DB_USER`
    * `DB_PASSWORD`
    * `DB_NAME`
    * `JWT_SECRET`
    * `CORS_ORIGIN`
    * `SPACES_REGION`
    * `SPACES_ENDPOINT`
    * `SPACES_KEY`
    * `SPACES_SECRET`
    * `SPACES_BUCKET`
3.  **Execute a API:**
    ```bash
    npm start
    ```
    ou em modo de desenvolvimento:
    ```bash
    npm run dev
    ```