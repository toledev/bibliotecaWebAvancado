using BibliotecaApi.Models;

namespace BibliotecaApi.Repositories;

public interface IBookRepository
{
    Task<List<Book>> GetAllAsync();
    Task<Book?> GetByIdAsync(int id);
    Task<bool> AuthorExistsAsync(int authorId);
    Task<bool> IsbnExistsAsync(string isbn, int? ignoredBookId = null);
    Task<bool> HasActiveLoansAsync(int bookId);
    Task AddAsync(Book book);
    void Update(Book book);
    void Delete(Book book);
    Task<int> SaveChangesAsync();
}
