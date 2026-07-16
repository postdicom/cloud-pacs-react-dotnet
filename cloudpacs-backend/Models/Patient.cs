namespace CloudPACS.Backend
{
    using System;
    using Newtonsoft.Json;

    public class Patient
    {
        [JsonProperty("id")]
        public string Mrn { get; set; } = "MRN-" + Guid.NewGuid().ToString();
        [JsonProperty("userId")]
        public string UserId { get; set; }
        public string Name { get; set; }
        public DateOnly DoB { get; set; }
        public string LastStudy { get; set; }
        public int NumOfStudies {get; set;}
        public Patient(string Mrn, string UserId, string Name, DateOnly DoB)
        {
            this.Mrn = Mrn;
            this.UserId = UserId;
            this.Name = Name;
            this.DoB = DoB;
        }
    }
}