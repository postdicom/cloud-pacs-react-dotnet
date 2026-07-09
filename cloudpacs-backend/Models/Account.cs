namespace CloudPACS.Backend
{
    using System;
    using Newtonsoft.Json;
    public class Account
    {
        [JsonProperty("id")]
        public string Id => AccountId;
        public string AccountId { get; set; }
        public string AccountName { get; set; }
        public string AccountPassword { get; set; }
        //public Guid AccountUuid { get; set; }
        //public Guid OwnerUserUuid { get; set; }
        public AccountIdentityInformation IdentityInformation { get; set; }
        public Account(Guid UserUuid, string accountName, /*string phoneNumber, string country,*/ string accountId, string accountPassword)
        {
            //AccountUuid = Guid.NewGuid();
            AccountId = accountId;
            //OwnerUserUuid = UserUuid;
            AccountName = accountName; 
            // TODO: Add a Type field to filter accounts.
            // TODO: Add CreatedAt / UpdatedAt for sorting the accounts later.
            AccountPassword = accountPassword;
            //Role = "Owner";
            IdentityInformation = new AccountIdentityInformation
            {
                Name = AccountName,
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