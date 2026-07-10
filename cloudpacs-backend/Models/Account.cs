namespace CloudPACS.Backend
{
    using System;
    using Newtonsoft.Json;
    public class Account
    {
        [JsonProperty("id")]
        public string Id => AccountId;
        [JsonProperty("accountId")]
        public string AccountId { get; set; }
        public string AccountName { get; set; }
        public string AccountPassword { get; set; }
        public AccountIdentityInformation IdentityInformation { get; set; }
        public Account(Guid UserUuid, string accountName, string accountId, string accountPassword)
        {
            AccountId = accountId;
            AccountName = accountName; 
            // TODO: Add a Type field to filter accounts.
            // TODO: Add CreatedAt / UpdatedAt for sorting the accounts later.
            AccountPassword = accountPassword;
            IdentityInformation = new AccountIdentityInformation
            {
                Name = AccountName,
                EmailAddress = $"jane@hospital.org",
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