using BibliotecaApi.Models;

namespace BibliotecaApi.Repositories;

public interface ILoanRepository
{
    Task<List<Loan>> GetAllAsync();
    Task<Loan?> GetByIdAsync(int id);
    Task<Book?> GetBookAsync(int bookId);
    Task<Member?> GetMemberAsync(int memberId);
    Task AddAsync(Loan loan);
    Task<int> SaveChangesAsync();
}
