namespace CloudPACS.Backend
{
    using System;
    using Newtonsoft.Json;

    public class Series: Common
    {
        [JsonProperty("studyGuid")]
        public string studyGuid {get; set;}
        public string PatientId { get; set; }
        public string PatientName {get; set;}
        public string UserId { get; set;}
        public string SeriesId { get; set;}
        public int numberOfInstances { get; set; }
        public Series(string id, string patientId, string patientName, string userId, string seriesId, string studyGuid, objectType objectType)
        {
            Id = id;
            PatientId = patientId;
            PatientName = patientName;
            UserId = userId;
            SeriesId = seriesId;
            this.studyGuid = studyGuid;
            ObjectType = objectType;
        }
    }
}