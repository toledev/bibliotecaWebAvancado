using BibliotecaApi.Models;
using Microsoft.EntityFrameworkCore;

namespace BibliotecaApi.Data;

public class LibraryContext : DbContext
{
    public LibraryContext(DbContextOptions<LibraryContext> options) : base(options)
    {
    }

    public DbSet<Author> Authors => Set<Author>();
    public DbSet<Book> Books => Set<Book>();
    public DbSet<Member> Members => Set<Member>();
    public DbSet<Loan> Loans => Set<Loan>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Author>()
            .HasMany(author => author.Books)
            .WithOne(book => book.Author)
            .HasForeignKey(book => book.AuthorId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Book>()
            .HasIndex(book => book.Isbn)
            .IsUnique();

        modelBuilder.Entity<Book>()
            .HasMany(book => book.Loans)
            .WithOne(loan => loan.Book)
            .HasForeignKey(loan => loan.BookId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Member>()
            .HasIndex(member => member.Email)
            .IsUnique();

        modelBuilder.Entity<Member>()
            .HasMany(member => member.Loans)
            .WithOne(loan => loan.Member)
            .HasForeignKey(loan => loan.MemberId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Author>().HasData(
            new Author { Id = 1, Name = "Machado de Assis", Nationality = "Brasileira" },
            new Author { Id = 2, Name = "Robert C. Martin", Nationality = "Americana" }
        );

        modelBuilder.Entity<Book>().HasData(
            new Book
            {
                Id = 1,
                Title = "Dom Casmurro",
                Isbn = "9788535910663",
                PublishedYear = 1899,
                Genre = BookGenre.Romance,
                CopiesAvailable = 3,
                AuthorId = 1
            },
            new Book
            {
                Id = 2,
                Title = "Clean Code",
                Isbn = "9780132350884",
                PublishedYear = 2008,
                Genre = BookGenre.Technology,
                CopiesAvailable = 2,
                AuthorId = 2
            }
        );

        modelBuilder.Entity<Member>().HasData(
            new Member
            {
                Id = 1,
                FullName = "Ana Souza",
                Email = "ana.souza@email.com",
                BirthDate = new DateTime(1998, 5, 12),
                Status = MembershipStatus.Active
            },
            new Member
            {
                Id = 2,
                FullName = "Pedro Lima",
                Email = "pedro.lima@email.com",
                BirthDate = new DateTime(2012, 8, 3),
                Status = MembershipStatus.Active
            }
        );
    }
}
