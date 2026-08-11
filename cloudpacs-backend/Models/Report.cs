namespace CloudPACS.Backend
{
    using System;

    public class Report: Common
    {
        public string StudyId { get; set; }
        public string Findings { get; set; }
        public string CreatedByUserId { get; set; }
        public DateTime CreatedAtUtc { get; set; }
        public DateTime? UpdatedAtUtc { get; set; }
        public Report(string id, string studyId, string findings, string createdByUserId, DateTime createdAtUtc)
        {
            Id = id;
            StudyId = studyId;
            Findings = findings;
            CreatedByUserId = createdByUserId;
            CreatedAtUtc = createdAtUtc;
        }
    }
}