namespace BibliotecaApi.Models;

public class Loan
{
    public Loan()
    {
    }

    public Loan(int bookId, int memberId, DateTime loanDate, int loanDays = 14)
    {
        BookId = bookId;
        MemberId = memberId;
        LoanDate = loanDate.Date;
        DueDate = loanDate.Date.AddDays(loanDays);
        Status = LoanStatus.Active;
    }

    public int Id { get; set; }

    public int BookId { get; set; }

    public Book? Book { get; set; }

    public int MemberId { get; set; }

    public Member? Member { get; set; }

    public DateTime LoanDate { get; set; }

    public DateTime DueDate { get; set; }

    public DateTime? ReturnDate { get; set; }

    public LoanStatus Status { get; set; } = LoanStatus.Active;

    public decimal DailyFine { get; set; } = 1.50m;

    public decimal CalculateFine(DateTime referenceDate)
    {
        var endDate = ReturnDate ?? referenceDate.Date;
        var lateDays = (endDate.Date - DueDate.Date).Days;

        return lateDays > 0 ? lateDays * DailyFine : 0m;
    }
}
