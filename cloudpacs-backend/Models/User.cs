namespace CloudPACS.Backend
{
    using System;
    using Newtonsoft.Json;

    public enum UserRole
    {
        Admin,
        Radiologist,
        Viewer
    }

    public class User
    {
        [JsonProperty("id")]
        public string UserId { get; set; } = Guid.NewGuid().ToString();
        [JsonProperty("accountId")]
        public string AccountId { get; set; } // partition key — links user to their clinic/account
        public string Name { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string PhoneNumber {get; set;}
        public UserRole Role { get; set; }
        public DateTime? LastLoginAt { get; set; }

        public User(string accountId, string name, string email, UserRole role, string password)
        {
            AccountId = accountId;
            Name = name;
            Email = email;
            Role = role;
            Password = password;
        }
    }
}