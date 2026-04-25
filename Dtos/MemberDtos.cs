using BibliotecaApi.Models;
using System.ComponentModel.DataAnnotations;

namespace BibliotecaApi.Dtos;

public class MemberRequestDto
{
    [Required]
    [MaxLength(120)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(160)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public DateTime BirthDate { get; set; }

    public MembershipStatus Status { get; set; } = MembershipStatus.Active;
}

public class MemberResponseDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public DateTime BirthDate { get; set; }
    public MembershipStatus Status { get; set; }
    public int Age { get; set; }
}
