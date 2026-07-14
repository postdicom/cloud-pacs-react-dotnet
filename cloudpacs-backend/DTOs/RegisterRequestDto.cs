using System.ComponentModel.DataAnnotations;
using CloudPACS.Backend;

public class RegisterRequestDto
{
    [Required]
    public required string Email{ get; set;}
    [Required]
    public required string Name{ get; set;}
    [Required]
    [DataType(DataType.Password)]
    public required string Password{ get; set;}
}