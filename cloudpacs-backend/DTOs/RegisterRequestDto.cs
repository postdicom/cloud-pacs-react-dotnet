using System.ComponentModel.DataAnnotations;
using CloudPACS.Backend;

public class RegisterRequestDto
{
    [Required]
    public required string Name{ get; set;}
    [Required]
    [DataType(DataType.EmailAddress)]
    public required string Email{ get; set;}
    public required UserRole Role{ get; set;}
    [Required]
    [DataType(DataType.Password)]
    public required string Password{ get; set;}
}