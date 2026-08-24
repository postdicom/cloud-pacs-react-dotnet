using System.ComponentModel.DataAnnotations;
using CloudPACS.Backend;

public class RegisterRequestDto
{
    [Required]
    public required string Email{ get; set;}
    [Required]
    public required string AccountName{ get; set;}
    [Required]
    public required string UserName{ get; set;}
    [Required]
    [DataType(DataType.Password)]
    public required string Password{ get; set;}
    [Required]
    public required int TotalStorage{ get; set;}
    [Required]
    public required string InternalNotes{ get; set;}
    [Required]
    public required string Slug{ get; set;}
}