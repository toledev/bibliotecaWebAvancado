using BibliotecaApi.Dtos;
using BibliotecaApi.Models;
using BibliotecaApi.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace BibliotecaApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthorsController : ControllerBase
{
    private readonly IRepository<Author> _repository;

    public AuthorsController(IRepository<Author> repository)
    {
        _repository = repository;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<AuthorResponseDto>>> GetAll()
    {
        var authors = await _repository.GetAllAsync();
        return Ok(authors.Select(ToResponse));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<AuthorResponseDto>> GetById(int id)
    {
        var author = await _repository.GetByIdAsync(id);

        return author is null ? NotFound() : Ok(ToResponse(author));
    }

    [HttpPost]
    public async Task<ActionResult<AuthorResponseDto>> Create(AuthorRequestDto request)
    {
        var author = new Author
        {
            Name = request.Name.Trim(),
            Nationality = request.Nationality.Trim()
        };

        await _repository.AddAsync(author);
        await _repository.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = author.Id }, ToResponse(author));
    }

    private static AuthorResponseDto ToResponse(Author author)
    {
        return new AuthorResponseDto
        {
            Id = author.Id,
            Name = author.Name,
            Nationality = author.Nationality
        };
    }
}
