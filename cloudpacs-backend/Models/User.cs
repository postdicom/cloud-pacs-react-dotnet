namespace CloudPACS.Backend
{
    using System;
    using Newtonsoft.Json;

    public enum UserRole
    {
        Admin,
        Radiologist,
        Viewer,
        SuperAdmin
    }

    public class User: Common
    {
        [JsonProperty("accountId")]
        public string accountId { get; set; } // partition key — links user to their clinic/account
        public string Name { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public UserRole Role { get; set; }
        public DateTime? LastLoginAt { get; set; }
        public string Status { get; set; }

        public User(string id, string accountId, string name, string email, UserRole role, string password)
        {
            Id = id;
            this.accountId = accountId;
            Name = name;
            Email = email;
            Role = role;
            Password = password;
            Status = "Invited";
        }
    }
}