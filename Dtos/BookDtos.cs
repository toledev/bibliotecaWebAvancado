using BibliotecaApi.Models;
using System.ComponentModel.DataAnnotations;

namespace BibliotecaApi.Dtos;

public class BookRequestDto
{
    [Required]
    [MaxLength(160)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string Isbn { get; set; } = string.Empty;

    [Range(1450, 2100)]
    public int PublishedYear { get; set; }

    [Required]
    public BookGenre Genre { get; set; }

    [Range(0, 1000)]
    public int CopiesAvailable { get; set; }

    [Range(1, int.MaxValue)]
    public int AuthorId { get; set; }
}

public class BookResponseDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Isbn { get; set; } = string.Empty;
    public int PublishedYear { get; set; }
    public BookGenre Genre { get; set; }
    public int CopiesAvailable { get; set; }
    public int AuthorId { get; set; }
    public string AuthorName { get; set; } = string.Empty;
    public int ActiveLoans { get; set; }
}

public class BookCopiesPatchDto
{
    [Range(0, 1000)]
    public int CopiesAvailable { get; set; }
}
