using System.ComponentModel.DataAnnotations;

namespace BibliotecaApi.Models;

public class Author
{
    public int Id { get; set; }

    [Required]
    [MaxLength(120)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(80)]
    public string Nationality { get; set; } = string.Empty;

    public ICollection<Book> Books { get; set; } = new List<Book>();
}
