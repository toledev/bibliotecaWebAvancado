using BibliotecaApi.Data;
using BibliotecaApi.Models;
using Microsoft.EntityFrameworkCore;

namespace BibliotecaApi.Repositories;

public class LoanRepository : ILoanRepository
{
    private readonly LibraryContext _context;

    public LoanRepository(LibraryContext context)
    {
        _context = context;
    }

    public Task<List<Loan>> GetAllAsync()
    {
        return _context.Loans
            .AsNoTracking()
            .Include(loan => loan.Book)
            .Include(loan => loan.Member)
            .OrderByDescending(loan => loan.LoanDate)
            .ToListAsync();
    }

    public Task<Loan?> GetByIdAsync(int id)
    {
        return _context.Loans
            .Include(loan => loan.Book)
            .Include(loan => loan.Member)
            .FirstOrDefaultAsync(loan => loan.Id == id);
    }

    public Task<Book?> GetBookAsync(int bookId)
    {
        return _context.Books.FirstOrDefaultAsync(book => book.Id == bookId);
    }

    public Task<Member?> GetMemberAsync(int memberId)
    {
        return _context.Members.FirstOrDefaultAsync(member => member.Id == memberId);
    }

    public Task AddAsync(Loan loan)
    {
        return _context.Loans.AddAsync(loan).AsTask();
    }

    public Task<int> SaveChangesAsync()
    {
        return _context.SaveChangesAsync();
    }
}
