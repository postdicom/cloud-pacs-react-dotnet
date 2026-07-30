namespace CloudPACS.Backend
{
    using System;
    using System.Collections.Generic;
    using Newtonsoft.Json;
    public class Instance : Common
    {
        [JsonProperty("seriesGuid")]
        public string seriesGuid { get; set; } = String.Empty;

        public string SeriesInstanceUid { get; set; } = String.Empty;
        public string patientId { get; set; } = String.Empty;
        public string StudyInstanceUid { get; set; } = String.Empty;
        public string SopInstanceUid { get; set; } = String.Empty;
        public string FilePath { get; set; } = String.Empty;
        public double FileSize { get; set; }
        public DateTime UploadDate { get; set; } = default(DateTime);  //public instance to get rid of this
        public Dictionary<string, string> Metadata { get; set; }
        public Instance(string id, string seriesGuid, string SeriesInstanceUid, string StudyInstanceUid, string SopInstanceUid,
        string FilePath, DateTime UploadDate, Dictionary<string, string> Metadata)
        {
            this.Id = id;
            this.seriesGuid = seriesGuid;
            this.SeriesInstanceUid = SeriesInstanceUid;
            this.StudyInstanceUid = StudyInstanceUid;
            this.SopInstanceUid = SopInstanceUid;
            this.FilePath = FilePath;
            this.UploadDate = UploadDate;
            this.Metadata = Metadata;
        }
    }
}