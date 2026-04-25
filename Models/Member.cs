using System.ComponentModel.DataAnnotations;

namespace BibliotecaApi.Models;

public class Member
{
    public int Id { get; set; }

    [Required]
    [MaxLength(120)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(160)]
    public string Email { get; set; } = string.Empty;

    public DateTime BirthDate { get; set; }

    public MembershipStatus Status { get; set; } = MembershipStatus.Active;

    public ICollection<Loan> Loans { get; set; } = new List<Loan>();

    public int GetAge(DateTime today)
    {
        var age = today.Year - BirthDate.Year;
        if (BirthDate.Date > today.Date.AddYears(-age))
        {
            age--;
        }

        return age;
    }
}
