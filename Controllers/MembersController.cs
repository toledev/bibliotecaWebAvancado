using BibliotecaApi.Dtos;
using BibliotecaApi.Models;
using BibliotecaApi.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace BibliotecaApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MembersController : ControllerBase
{
    private readonly IRepository<Member> _repository;

    public MembersController(IRepository<Member> repository)
    {
        _repository = repository;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MemberResponseDto>>> GetAll()
    {
        var members = await _repository.GetAllAsync();
        return Ok(members.Select(ToResponse));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<MemberResponseDto>> GetById(int id)
    {
        var member = await _repository.GetByIdAsync(id);

        return member is null ? NotFound() : Ok(ToResponse(member));
    }

    [HttpPost]
    public async Task<ActionResult<MemberResponseDto>> Create(MemberRequestDto request)
    {
        if (!Enum.IsDefined(request.Status))
        {
            return BadRequest("Status de membro invalido.");
        }

        var member = new Member
        {
            FullName = request.FullName.Trim(),
            Email = request.Email.Trim().ToLowerInvariant(),
            BirthDate = request.BirthDate.Date,
            Status = request.Status
        };

        await _repository.AddAsync(member);
        await _repository.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = member.Id }, ToResponse(member));
    }

    private static MemberResponseDto ToResponse(Member member)
    {
        return new MemberResponseDto
        {
            Id = member.Id,
            FullName = member.FullName,
            Email = member.Email,
            BirthDate = member.BirthDate,
            Status = member.Status,
            Age = member.GetAge(DateTime.Today)
        };
    }
}
