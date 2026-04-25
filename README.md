# BibliotecaApi

API Web em C# para gerenciamento de biblioteca, desenvolvida para a avaliacao A2-1 de Desenvolvimento Web Avancado.

## Tema

Sistema de biblioteca com autores, livros, membros e emprestimos.

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

```bash
dotnet restore
dotnet run
```

A API sobe em `http://localhost:5056` usando o perfil HTTP do projeto.

O banco SQLite `biblioteca.db` e criado automaticamente na primeira execucao pelo Entity Framework. O arquivo `database.sql` tambem contem o script de criacao e carga inicial.

## Endpoints

### Livros

| Metodo | Rota | Descricao |
| --- | --- | --- |
| GET | `/api/books` | Lista todos os livros |
| GET | `/api/books/{id}` | Busca livro por ID |
| POST | `/api/books` | Cria livro |
| PUT | `/api/books/{id}` | Atualiza livro |
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
