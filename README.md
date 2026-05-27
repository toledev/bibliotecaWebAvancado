# BibliotecaApi

API Web em C# e frontend React para gerenciamento de biblioteca, desenvolvido para as avaliacoes A2-1 e A2-2 de Desenvolvimento Web Avancado.

## Integrantes da equipe

- Nome do integrante 1
- Nome do integrante 2
- Nome do integrante 3

## Tema

Sistema de biblioteca com autores, livros, membros e emprestimos. O frontend em React consome a Web API, usa autenticacao JWT, exibe dados dinamicamente e permite operar o acervo por uma interface minimalista.

Entidades relacionadas:

- `Author` 1:N `Book`
- `Book` 1:N `Loan`
- `Member` 1:N `Loan`

## Tecnologias

- ASP.NET Core Web API
- Entity Framework Core
- SQLite
- Repository Pattern
- Controllers e Models separados em camadas
- JWT Bearer Authentication
- React
- Vite
- Fetch API
- Lucide React

## Regras de negocio

- Um livro nao pode ser cadastrado com ISBN repetido.
- Um livro nao pode ter ano de publicacao maior que o ano atual.
- Um emprestimo so pode ser feito por membro ativo.
- Um emprestimo so pode ser feito por membro com pelo menos 16 anos.
- Um emprestimo reduz a quantidade de exemplares disponiveis do livro.
- A devolucao aumenta a quantidade de exemplares disponiveis.
- A API calcula multa de R$ 1,50 por dia de atraso.
- O status do emprestimo e classificado como `Active`, `ReturnedOnTime` ou `ReturnedLate`.

Generos aceitos para livros:

- `Romance`
- `Technology`
- `History`
- `Science`
- `Education`
- `Brainrot`

## Como executar

### Backend

```bash
dotnet restore
dotnet run
```

A API sobe em `http://localhost:5056` usando o perfil HTTP do projeto.

O banco SQLite `biblioteca.db` e criado automaticamente na primeira execucao pelo Entity Framework. O arquivo `database.sql` tambem contem o script de criacao e carga inicial.

### Frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

O frontend sobe em `http://localhost:5173` e consome `http://localhost:5056/api`. Para usar outro endereco da API, crie um arquivo `frontend/.env` com:

```bash
VITE_API_URL=http://localhost:5056/api
```

## Autenticacao JWT

A aplicacao possui login JWT em `POST /api/auth/login`. O frontend armazena o token no `localStorage` e envia o cabecalho `Authorization: Bearer <token>` nas requisicoes com `fetch`.

Credenciais de demonstracao:

```text
E-mail: admin@biblioteca.com
Senha: biblioteca123
```

Endpoint protegido para validacao do token:

| Metodo | Rota | Descricao |
| --- | --- | --- |
| GET | `/api/auth/me` | Retorna os dados do usuario autenticado |

Todas as rotas dos controllers exigem token, exceto `POST /api/auth/login`.

## Endpoints

### Autenticacao

| Metodo | Rota | Descricao |
| --- | --- | --- |
| POST | `/api/auth/login` | Gera um token JWT |
| GET | `/api/auth/me` | Endpoint protegido para validar token |

### Livros

| Metodo | Rota | Descricao |
| --- | --- | --- |
| GET | `/api/books` | Lista todos os livros |
| GET | `/api/books/{id}` | Busca livro por ID |
| POST | `/api/books` | Cria livro |
| PUT | `/api/books/{id}` | Atualiza livro |
| PATCH | `/api/books/{id}/copies` | Atualiza somente exemplares disponiveis |
| DELETE | `/api/books/{id}` | Remove livro sem historico de emprestimo |

Exemplo de criacao:

```json
{
  "title": "Arquitetura Limpa",
  "isbn": "9788550804606",
  "publishedYear": 2019,
  "genre": "Technology",
  "copiesAvailable": 4,
  "authorId": 2
}
```

### Autores

| Metodo | Rota | Descricao |
| --- | --- | --- |
| GET | `/api/authors` | Lista autores |
| GET | `/api/authors/{id}` | Busca autor por ID |
| POST | `/api/authors` | Cria autor |

Exemplo de criacao:

```json
{
  "name": "Clarice Lispector",
  "nationality": "Brasileira"
}
```

Exemplo de resposta:

```json
{
  "id": 3,
  "name": "Clarice Lispector",
  "nationality": "Brasileira"
}
```

### Membros

| Metodo | Rota | Descricao |
| --- | --- | --- |
| GET | `/api/members` | Lista membros |
| GET | `/api/members/{id}` | Busca membro por ID |
| POST | `/api/members` | Cria membro |

Exemplo de criacao:

```json
{
  "fullName": "Carlos Oliveira",
  "email": "carlos.oliveira@email.com",
  "birthDate": "1995-03-20",
  "status": "Active"
}
```

Exemplo de resposta:

```json
{
  "id": 3,
  "fullName": "Carlos Oliveira",
  "email": "carlos.oliveira@email.com",
  "birthDate": "1995-03-20T00:00:00",
  "status": "Active",
  "age": 31
}
```

Outro exemplo para testar a regra de idade minima:

```json
{
  "fullName": "Lucas Menor",
  "email": "lucas.menor@email.com",
  "birthDate": "2014-09-10",
  "status": "Active"
}
```

Esse membro pode ser cadastrado, mas nao consegue fazer emprestimo porque tem menos de 16 anos.

### Emprestimos

| Metodo | Rota | Descricao |
| --- | --- | --- |
| GET | `/api/loans` | Lista emprestimos |
| GET | `/api/loans/{id}` | Busca emprestimo por ID |
| POST | `/api/loans` | Cria emprestimo |
| PUT | `/api/loans/{id}/return` | Registra devolucao e calcula multa |
| GET | `/api/loans/overdue` | Lista emprestimos ativos em atraso |

Exemplo de emprestimo:

```json
{
  "bookId": 1,
  "memberId": 1
}
```

Exemplo de devolucao:

```json
{
  "returnDate": "2026-05-15"
}
```
