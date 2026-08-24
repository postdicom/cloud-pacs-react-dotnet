namespace CloudPACS.Backend
{
    using System;
    using Newtonsoft.Json;

    public class Account : Common
    {
        public enum AccountStatus
        {
            Active,
            ViewOnly,
            Suspended
        }
        public enum AccountPlan
        {
            Standard,
            Pro,
            Enterprise
        }

        [JsonProperty("accountId")]
        public string accountId { get; set; }
        public string AccountName { get; set; }
        public string AccountPassword { get; set; }
        public AccountStatus Status { get; set; }
        public AccountIdentityInformation IdentityInformation { get; set; }
        public int TotalStorage { get; set; }
        public int UsedStorage { get; set; }
        public int NumOfUsers { get; set; }
        public string InternalNotes { get; set; }
        public string Slug { get; set; }
        public Account(string id, string accountName, string slug, string accountId, string accountPassword, DateTime? createdAt, objectType objectType, int totalStorage, string internalNotes, string email)
        {
            Id = id;
            this.accountId = accountId;
            AccountName = accountName;
            Slug = slug;
            CreatedAt = createdAt ?? DateTime.UtcNow;
            UpdatedAt = CreatedAt;
            AccountPassword = accountPassword;
            ObjectType = objectType;
            Status = AccountStatus.Active;
            TotalStorage = totalStorage;
            UsedStorage = 0;
            NumOfUsers = 0;
            InternalNotes = internalNotes;

            IdentityInformation = new AccountIdentityInformation
            {
                Name = AccountName,
                EmailAddress = email, //TO DO Ibrahim: This will be later changed to whatever Email adress we are inviting
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