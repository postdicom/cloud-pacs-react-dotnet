using System.ComponentModel.DataAnnotations;

public class PatientListDto
{
    public PatientListDto(string mrn, string userId)
    {
        this.mrn = mrn;
        this.userId = userId;
    }

    [Required]
    public required string mrn{ get; set;}
    [Required]
    public required string userId{ get; set;}
}