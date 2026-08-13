namespace CloudPACS.Backend
{
    using System;
    using Newtonsoft.Json;

    public class Report: Common
    {
        [JsonProperty("studyId")]
        public string studyId { get; set; }
        public string Findings { get; set; }
        public string CreatedByUserId { get; set; }
        public string CreatedByUserName { get; set; }
        public DateTime CreatedAtUtc { get; set; }
        public DateTime? UpdatedAtUtc { get; set; }
        public Report(string id, string studyId, string findings, string createdByUserId, string createdByUserName, DateTime createdAtUtc)
        {
            Id = id;
            this.studyId = studyId;
            Findings = findings;
            CreatedByUserId = createdByUserId;
            CreatedByUserName = createdByUserName;
            CreatedAtUtc = createdAtUtc;
        }
    }
}