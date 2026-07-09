using System.ComponentModel.DataAnnotations;

public class RegisterRequestDto
{
    [Required]
    [DataType(DataType.EmailAddress)]
    public required string Email{ get; set;}
    [Required]
    [DataType(DataType.Password)]
    public required string Password{ get; set;}
}