namespace CloudPACS.Backend
{
    using System;
    using Newtonsoft.Json;

    public class Account : Common
    {
        public enum AccountStatus
        {
            Active,
            Passive,
            Deleted
        }

        [JsonProperty("AccountId")]
        public string AccountId { get; set; }
        public string AccountName { get; set; }
        public string AccountPassword { get; set; }
        public AccountStatus Status { get; set; }
        public AccountIdentityInformation IdentityInformation { get; set; }

        public Account(Guid userUuid, string accountName, string accountId, string accountPassword, DateTime? createdAt, DateTime? updatedAt, Common.objectType objectType)
        {
            AccountId = accountId;
            AccountName = accountName;
            CreatedAt = createdAt ?? DateTime.UtcNow;
            UpdatedAt = updatedAt;
            AccountPassword = accountPassword;
            ObjectType = objectType;
            Status = AccountStatus.Active;

            IdentityInformation = new AccountIdentityInformation
            {
                Name = AccountName,
                EmailAddress = $"jane@hospital.org", //TO DO Ibrahim: This will be later changed to whatever Email adress we are inviting
            };
        }
    }
    public class AccountIdentityInformation
    {
        public string Name { get; set; } = String.Empty;
        public string EmailAddress { get; set; } = String.Empty;
        public string CountryName { get; set; } = String.Empty;
        public string PhoneNumber { get; set; } = String.Empty;
    }
}