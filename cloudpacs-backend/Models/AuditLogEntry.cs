namespace CloudPACS.Backend
{
    using System;
    using Microsoft.Azure.Cosmos;
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
        public string Id { get; init; } = Guid.NewGuid().ToString();
        [JsonProperty("userId")]
        public string UserId { get; init; }
        public AuditActions Action { get; init; }
        public ResourceType ResourceType { get; init; }
        public string ResourceId { get; init; }
        public DateTimeOffset Timestamp { get; init; }
        public string IpAddress { get; init; }
    }
}