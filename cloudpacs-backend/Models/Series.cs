namespace CloudPACS.Backend
{
    using System;
    using Newtonsoft.Json;

    public class Series
    {
        [JsonProperty("studyGuid")]
        public string studyGuid {get; set;}
        [JsonProperty("id")]
        public string id {get; set;}
        public string PatientId { get; set; }
        public string PatientName {get; set;}
        public string UserId { get; set;}
        public string SeriesId { get; set;}
        public int numberOfInstances { get; set; }
        public Series(string Id, string patientId, string patientName, string SeriesId, string studyGuid)
        {
            this.id = Id;
            this.PatientId = patientId;
            this.PatientName = patientName;
            this.SeriesId = SeriesId;
            this.studyGuid = studyGuid;
        }
    }
}