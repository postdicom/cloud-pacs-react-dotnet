namespace CloudPACS.Backend
{
    using Newtonsoft.Json;
    public abstract class Common
    {
        [JsonProperty("id")]
        public string Id { get; set; } = String.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }
        public objectType ObjectType {get; set;}
        public enum objectType
        {
            Account,
            Instance,
            Patient,
            Series,
            Study,
            User
        }
    }
}