using System.ComponentModel.DataAnnotations;

namespace BibliotecaApi.Dtos;

public class AuthorRequestDto
{
    [Required]
    [MaxLength(120)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(80)]
    public string Nationality { get; set; } = string.Empty;
}

public class AuthorResponseDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Nationality { get; set; } = string.Empty;
}
