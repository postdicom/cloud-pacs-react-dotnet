namespace CloudPACS.Backend
{
    using System;
    using System.Threading.Tasks;
    using CloudPACS.Backend.Data;
    using DotNetEnv;
    public class User
    {
        public required string Email { get; set; }
        public required string Username { get; set; }
        public required string Password { get; set; }
        public required string Brandname { get; set; }
        public string PhoneNumber { get; set; }
        public Guid UserUuid { get; set; }
        public required string Country { get; set; }
        public User(string username, string password, string phoneNumber, string country)
        {
            Username = username;
            Password = password;
            PhoneNumber = phoneNumber;
            Country = country;
            Brandname = Brandname;
            UserUuid = Guid.NewGuid();
            Email = $"{username}@example.com";
        } 
    }
}

