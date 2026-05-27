using BibliotecaApi.Dtos;
using BibliotecaApi.Models;
using BibliotecaApi.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace BibliotecaApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BooksController : ControllerBase
{
    private readonly IBookRepository _repository;

    public BooksController(IBookRepository repository)
    {
        _repository = repository;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<BookResponseDto>>> GetAll()
    {
        var books = await _repository.GetAllAsync();
        return Ok(books.Select(ToResponse));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<BookResponseDto>> GetById(int id)
    {
        var book = await _repository.GetByIdAsync(id);

        return book is null ? NotFound() : Ok(ToResponse(book));
    }

    [HttpPost]
    public async Task<ActionResult<BookResponseDto>> Create(BookRequestDto request)
    {
        var validationError = await ValidateBookRequest(request);
        if (validationError is not null)
        {
            return validationError;
        }

        var book = new Book
        {
            Title = request.Title.Trim(),
            Isbn = request.Isbn.Trim(),
            PublishedYear = request.PublishedYear,
            Genre = request.Genre,
            CopiesAvailable = request.CopiesAvailable,
            AuthorId = request.AuthorId
        };

        await _repository.AddAsync(book);
        await _repository.SaveChangesAsync();

        var createdBook = await _repository.GetByIdAsync(book.Id);
        return CreatedAtAction(nameof(GetById), new { id = book.Id }, ToResponse(createdBook!));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<BookResponseDto>> Update(int id, BookRequestDto request)
    {
        var book = await _repository.GetByIdAsync(id);
        if (book is null)
        {
            return NotFound();
        }

        var validationError = await ValidateBookRequest(request, id);
        if (validationError is not null)
        {
            return validationError;
        }

        book.Title = request.Title.Trim();
        book.Isbn = request.Isbn.Trim();
        book.PublishedYear = request.PublishedYear;
        book.Genre = request.Genre;
        book.CopiesAvailable = request.CopiesAvailable;
        book.AuthorId = request.AuthorId;

        _repository.Update(book);
        await _repository.SaveChangesAsync();

        var updatedBook = await _repository.GetByIdAsync(id);
        return Ok(ToResponse(updatedBook!));
    }

    [HttpPatch("{id:int}/copies")]
    public async Task<ActionResult<BookResponseDto>> UpdateCopies(int id, BookCopiesPatchDto request)
    {
        var book = await _repository.GetByIdAsync(id);
        if (book is null)
        {
            return NotFound();
        }

        book.CopiesAvailable = request.CopiesAvailable;

        _repository.Update(book);
        await _repository.SaveChangesAsync();

        var updatedBook = await _repository.GetByIdAsync(id);
        return Ok(ToResponse(updatedBook!));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var book = await _repository.GetByIdAsync(id);
        if (book is null)
        {
            return NotFound();
        }

        if (book.Loans.Any())
        {
            return BadRequest("Nao e possivel remover um livro que possui historico de emprestimos.");
        }

        _repository.Delete(book);
        await _repository.SaveChangesAsync();

        return NoContent();
    }

    private async Task<ActionResult?> ValidateBookRequest(BookRequestDto request, int? ignoredBookId = null)
    {
        if (!Enum.IsDefined(request.Genre))
        {
            return BadRequest("Genero invalido.");
        }

        if (request.PublishedYear > DateTime.Today.Year)
        {
            return BadRequest("Ano de publicacao nao pode ser maior que o ano atual.");
        }

        if (!await _repository.AuthorExistsAsync(request.AuthorId))
        {
            return BadRequest("Autor informado nao existe.");
        }

        if (await _repository.IsbnExistsAsync(request.Isbn.Trim(), ignoredBookId))
        {
            return Conflict("Ja existe um livro com este ISBN.");
        }

        return null;
    }

    private static BookResponseDto ToResponse(Book book)
    {
        return new BookResponseDto
        {
            Id = book.Id,
            Title = book.Title,
            Isbn = book.Isbn,
            PublishedYear = book.PublishedYear,
            Genre = book.Genre,
            CopiesAvailable = book.CopiesAvailable,
            AuthorId = book.AuthorId,
            AuthorName = book.Author?.Name ?? string.Empty,
            ActiveLoans = book.Loans.Count(loan => loan.Status == LoanStatus.Active)
        };
    }
}
