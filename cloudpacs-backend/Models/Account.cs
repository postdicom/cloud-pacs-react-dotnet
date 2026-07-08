namespace CloudPACS.Backend
{
    using System;
    using Newtonsoft.Json;
    public class Account
    {
        [JsonProperty("id")]
        public string Id => AccountId;
        public string AccountId { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
        //public Guid AccountUuid { get; set; }
        //public Guid OwnerUserUuid { get; set; }
        //public string Role { get; set; }
        public AccountIdentityInformation IdentityInformation { get; set; }
        public Account(Guid UserUuid, string username, /*string phoneNumber, string country,*/ string accountId, string password)
        {
            //AccountUuid = Guid.NewGuid();
            AccountId = accountId;
            //OwnerUserUuid = UserUuid;
            Username = username; 
            // TODO: Remove Username and Password from Account, they belong in User.cs
            // TODO: Add a Type field to filter accounts.
            // TODO: Add CreatedAt / UpdatedAt for sorting the accounts later.
            Password = password;
            //Role = "Owner";
            IdentityInformation = new AccountIdentityInformation
            {
                Name = username,
                EmailAddress = $"jane@hospital.org",
                //CountryName = country,
                //PhoneNumber = phoneNumber
            };
        }
    }
    public class AccountIdentityInformation
    {
        public string Name { get; set; }
        public string EmailAddress { get; set; }
        public string CountryName { get; set; }
        public string PhoneNumber { get; set; }
    }
}