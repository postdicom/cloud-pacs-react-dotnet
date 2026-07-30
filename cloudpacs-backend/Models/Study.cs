namespace CloudPACS.Backend
{
    using System;
    using System.Drawing;
    using Newtonsoft.Json;

public class Study
    {
        [JsonProperty("id")]
        public string id { get; set; } = Guid.NewGuid().ToString();
        [JsonProperty("patientGuid")]
        public string patientGuid { get; set; }
        public string Date { get; set; }
        public string Mod { get; set; }
        public string Series { get; set; }
        public int ImageCount { get; set; }
        public Study(string patientGuid, string date, string mod, string series, int imageCount)
        {
            this.patientGuid = patientGuid;
            Date = date;
            Mod = mod;
            Series = series;
            ImageCount = imageCount;

        }
    }
}