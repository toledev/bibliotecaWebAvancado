using BibliotecaApi.Dtos;
using BibliotecaApi.Models;
using BibliotecaApi.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace BibliotecaApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LoansController : ControllerBase
{
    private const int MinimumAge = 16;
    private readonly ILoanRepository _repository;

    public LoansController(ILoanRepository repository)
    {
        _repository = repository;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<LoanResponseDto>>> GetAll()
    {
        var loans = await _repository.GetAllAsync();
        return Ok(loans.Select(loan => ToResponse(loan, DateTime.Today)));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<LoanResponseDto>> GetById(int id)
    {
        var loan = await _repository.GetByIdAsync(id);

        return loan is null ? NotFound() : Ok(ToResponse(loan, DateTime.Today));
    }

    [HttpPost]
    public async Task<ActionResult<LoanResponseDto>> Create(LoanCreateDto request)
    {
        var book = await _repository.GetBookAsync(request.BookId);
        if (book is null)
        {
            return BadRequest("Livro informado nao existe.");
        }

        var member = await _repository.GetMemberAsync(request.MemberId);
        if (member is null)
        {
            return BadRequest("Membro informado nao existe.");
        }

        if (member.Status != MembershipStatus.Active)
        {
            return BadRequest("Membro precisa estar ativo para realizar emprestimos.");
        }

        if (member.GetAge(DateTime.Today) < MinimumAge)
        {
            return BadRequest($"Membro precisa ter pelo menos {MinimumAge} anos.");
        }

        if (book.CopiesAvailable <= 0)
        {
            return BadRequest("Livro nao possui exemplares disponiveis.");
        }

        var loan = new Loan(book.Id, member.Id, DateTime.Today);
        book.CopiesAvailable--;

        await _repository.AddAsync(loan);
        await _repository.SaveChangesAsync();

        var createdLoan = await _repository.GetByIdAsync(loan.Id);
        return CreatedAtAction(nameof(GetById), new { id = loan.Id }, ToResponse(createdLoan!, DateTime.Today));
    }

    [HttpPut("{id:int}/return")]
    public async Task<ActionResult<LoanResponseDto>> ReturnLoan(int id, LoanReturnDto? request)
    {
        var loan = await _repository.GetByIdAsync(id);
        if (loan is null)
        {
            return NotFound();
        }

        if (loan.Status != LoanStatus.Active)
        {
            return BadRequest("Emprestimo ja foi devolvido.");
        }

        var returnDate = (request?.ReturnDate ?? DateTime.Today).Date;
        if (returnDate < loan.LoanDate.Date)
        {
            return BadRequest("Data de devolucao nao pode ser anterior ao emprestimo.");
        }

        loan.ReturnDate = returnDate;
        loan.Status = returnDate > loan.DueDate.Date ? LoanStatus.ReturnedLate : LoanStatus.ReturnedOnTime;

        if (loan.Book is not null)
        {
            loan.Book.CopiesAvailable++;
        }

        await _repository.SaveChangesAsync();

        return Ok(ToResponse(loan, returnDate));
    }

    [HttpGet("overdue")]
    public async Task<ActionResult<IEnumerable<LoanResponseDto>>> GetOverdue()
    {
        var today = DateTime.Today;
        var loans = await _repository.GetAllAsync();
        var overdue = loans
            .Where(loan => loan.Status == LoanStatus.Active && loan.DueDate.Date < today)
            .Select(loan => ToResponse(loan, today));

        return Ok(overdue);
    }

    private static LoanResponseDto ToResponse(Loan loan, DateTime referenceDate)
    {
        return new LoanResponseDto
        {
            Id = loan.Id,
            BookId = loan.BookId,
            BookTitle = loan.Book?.Title ?? string.Empty,
            MemberId = loan.MemberId,
            MemberName = loan.Member?.FullName ?? string.Empty,
            LoanDate = loan.LoanDate,
            DueDate = loan.DueDate,
            ReturnDate = loan.ReturnDate,
            Status = loan.Status,
            Fine = loan.CalculateFine(referenceDate)
        };
    }
}
