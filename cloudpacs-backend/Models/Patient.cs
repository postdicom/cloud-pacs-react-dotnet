namespace CloudPACS.Backend
{
    using System;
    using Newtonsoft.Json;

    public class Patient : Common
    {
        [JsonProperty("userId")]
        public string userId { get; set; }
        public string Mrn { get; set; }
        public string Name { get; set; }
        public string DoB { get; set; }
        public string LastStudy { get; set; }
        public int NumOfStudies {get; set;}
        public Patient(string Id, string userId, string Mrn, string Name, string DoB, int NumOfStudies, objectType objectType)
        {
            this.Id = Id;
            this.userId = userId;
            this.Mrn = Mrn;
            this.Name = Name;
            this.DoB = DoB;
            this.NumOfStudies = NumOfStudies;
            ObjectType = objectType;
        }
    }
}