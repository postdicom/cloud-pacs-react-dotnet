using System.ComponentModel.DataAnnotations;
using CloudPACS.Backend;

public class InviteDto
{
    [Required]
    [DataType(DataType.EmailAddress)]
    public required string Email{ get; set;}
}