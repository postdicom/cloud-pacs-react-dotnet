namespace CloudPACS.Backend
{
    using System;
    using Newtonsoft.Json;

    public class Patient
    {
        [JsonProperty("id")]
        public string Mrn { get; set; } = "MRN-" + Guid.NewGuid().ToString();
        [JsonProperty("userId")]
        public string userId { get; set; }
        public string Name { get; set; }
        public string DoB { get; set; }
        public string LastStudy { get; set; }
        public int NumOfStudies {get; set;}
        public Patient(string Mrn, string userId, string Name, string DoB, int NumOfStudies)
        {
            this.Mrn = Mrn;
            this.userId = userId;
            this.Name = Name;
            this.DoB = DoB;
            this.NumOfStudies = NumOfStudies;
        }
    }
}