using System.ComponentModel.DataAnnotations;

namespace BibliotecaApi.Models;

public class Book
{
    public int Id { get; set; }

    [Required]
    [MaxLength(160)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string Isbn { get; set; } = string.Empty;

    public int PublishedYear { get; set; }

    public BookGenre Genre { get; set; }

    public int CopiesAvailable { get; set; }

    public int AuthorId { get; set; }

    public Author? Author { get; set; }

    public ICollection<Loan> Loans { get; set; } = new List<Loan>();
}
