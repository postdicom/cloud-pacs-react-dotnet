namespace CloudPACS.Backend
{
    using System;
    using Newtonsoft.Json;

    public enum AuditActions
    {
        Login,
        Logout,
        ViewStudy,
        UploadDICOM,
        DeleteStudy,
        GenerateReport
    }

    public enum ResourceType
    {
        Session,
        Study,
        Series,
        Report
    }

    public record class AuditLogEntry 
    {
        [JsonProperty("id")]
        public string id { get; init; } = Guid.NewGuid().ToString();
        [JsonProperty("userId")]
        public string userId { get; init; } = String.Empty;
        public string userName { get; init; } = String.Empty;
        public AuditActions Action { get; init; }
        public ResourceType ResourceType { get; init; }
        public string ResourceId { get; init; } = String.Empty;
        public DateTimeOffset Timestamp { get; init; }
        public string IpAddress { get; init; } = String.Empty;
        public string StudyDetail { get; init; } = String.Empty;
    }
}