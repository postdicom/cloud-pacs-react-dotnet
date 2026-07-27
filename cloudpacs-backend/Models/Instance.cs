namespace CloudPACS.Backend
{
    using System;
    using System.Collections.Generic;
    using System.Text.Json.Serialization;
    public class Instance
    {
        [JsonPropertyName("id")]
        public required string Id { get; set; }
        public string patientId { get; set; }
        public string StudyInstanceUid { get; set; }
        public string SeriesInstanceUid { get; set; }
        public string SopInstanceUid { get; set; }
        public string FilePath { get; set; }
        public double FileSize {get; set;}
        public DateTime UploadDate { get; set; }
        public Dictionary<string, string> Metadata { get; set; }
    }
}