namespace CloudPACS.Backend
{
    using System;
    using Newtonsoft.Json;

    public class Series: Common
    {
        [JsonProperty("studyGuid")]
        public string studyGuid { get; set; }
        public string PatientId { get; set; }
        public string PatientName { get; set; }
        public string UserId { get; set; }
        public string SeriesId { get; set; }
        public string SeriesNumber { get; set; }
        public int NumberOfInstances { get; set; }
        public string SeriesInstanceUid { get; set; }
        public Series(string id, string patientId, string patientName, string userId, string seriesId, string studyGuid, objectType objectType, string seriesInstanceUid, int numberOfInstances)
        {
            Id = id;
            PatientId = patientId;
            PatientName = patientName;
            UserId = userId;
            SeriesId = seriesId;
            this.studyGuid = studyGuid;
            ObjectType = objectType;
            SeriesInstanceUid = seriesInstanceUid;
            NumberOfInstances = numberOfInstances;
        }
    }
}