namespace CloudPACS.Backend
{
    using System;
    using System.Collections.Generic;
    using Newtonsoft.Json;
    public class Instance
    {
        [JsonProperty("id")]
        public required string id { get; set; }
        [JsonProperty("seriesGuid")]
        public string seriesGuid { get; set; }
        public string StudyInstanceUid { get; set; }
        public string SopInstanceUid { get; set; }
        public string FilePath { get; set; }
        public double FileSize {get; set;}
        public DateTime UploadDate { get; set; }
        public Dictionary<string, string> Metadata { get; set; }
    }
}