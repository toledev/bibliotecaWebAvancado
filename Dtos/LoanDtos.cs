using BibliotecaApi.Models;
using System.ComponentModel.DataAnnotations;

namespace BibliotecaApi.Dtos;

public class LoanCreateDto
{
    [Range(1, int.MaxValue)]
    public int BookId { get; set; }

    [Range(1, int.MaxValue)]
    public int MemberId { get; set; }
}

public class LoanReturnDto
{
    public DateTime ReturnDate { get; set; } = DateTime.Today;
}

public class LoanResponseDto
{
    public int Id { get; set; }
    public int BookId { get; set; }
    public string BookTitle { get; set; } = string.Empty;
    public int MemberId { get; set; }
    public string MemberName { get; set; } = string.Empty;
    public DateTime LoanDate { get; set; }
    public DateTime DueDate { get; set; }
    public DateTime? ReturnDate { get; set; }
    public LoanStatus Status { get; set; }
    public decimal Fine { get; set; }
}
