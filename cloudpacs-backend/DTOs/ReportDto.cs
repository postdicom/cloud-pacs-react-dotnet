namespace CloudPACS.Backend.Controllers
{
    using System.ComponentModel.DataAnnotations;

    public class GenerateReportRequestDto
    {
        public string StudyId { get; set; }
        public string ImageBase64 { get; set; }
    }

    public class UpdateReportRequestDto
    {
        [Required]
        public string Findings { get; set; } = string.Empty;

        public string? Impression { get; set; }
        public string? ETag { get; set; }
    }
}