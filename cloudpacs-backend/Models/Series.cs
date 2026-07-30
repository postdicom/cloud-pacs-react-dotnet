namespace CloudPACS.Backend
{
    using System;
    using Newtonsoft.Json;

    public class Series
    {
        public Patient Patient { get; set; }
        public string UserId { get; set;}
        public Guid SeriesId { get; set;}
        public int numberOfInstances { get; set; }
        public Series(Patient Patient, string UserId, Guid SeriesId)
        {
            this.Patient = Patient;
            this.UserId = UserId;
            this.SeriesId = SeriesId;
        }
    }
}