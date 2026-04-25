using BibliotecaApi.Data;
using BibliotecaApi.Models;
using Microsoft.EntityFrameworkCore;

namespace BibliotecaApi.Repositories;

public class BookRepository : IBookRepository
{
    private readonly LibraryContext _context;

    public BookRepository(LibraryContext context)
    {
        _context = context;
    }

    public Task<List<Book>> GetAllAsync()
    {
        return _context.Books
            .AsNoTracking()
            .Include(book => book.Author)
            .Include(book => book.Loans)
            .OrderBy(book => book.Title)
            .ToListAsync();
    }

    public Task<Book?> GetByIdAsync(int id)
    {
        return _context.Books
            .Include(book => book.Author)
            .Include(book => book.Loans)
            .FirstOrDefaultAsync(book => book.Id == id);
    }

    public Task<bool> AuthorExistsAsync(int authorId)
    {
        return _context.Authors.AnyAsync(author => author.Id == authorId);
    }

    public Task<bool> IsbnExistsAsync(string isbn, int? ignoredBookId = null)
    {
        return _context.Books.AnyAsync(book =>
            book.Isbn == isbn && (!ignoredBookId.HasValue || book.Id != ignoredBookId.Value));
    }

    public Task<bool> HasActiveLoansAsync(int bookId)
    {
        return _context.Loans.AnyAsync(loan => loan.BookId == bookId && loan.Status == LoanStatus.Active);
    }

    public Task AddAsync(Book book)
    {
        return _context.Books.AddAsync(book).AsTask();
    }

    public void Update(Book book)
    {
        _context.Books.Update(book);
    }

    public void Delete(Book book)
    {
        _context.Books.Remove(book);
    }

    public Task<int> SaveChangesAsync()
    {
        return _context.SaveChangesAsync();
    }
}
