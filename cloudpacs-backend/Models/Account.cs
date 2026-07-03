namespace CloudPACS.Backend
{
    using System;
    public class Account
    {
        public Guid AccountUuid { get; set; }
        public Guid OwnerUserUuid { get; set; }
        public string Role { get; set; }
        public AccountIdentityInformation IdentityInformation { get; set; }
        public Account(Guid UserUuid, string username, string phoneNumber, string country)
        {
            AccountUuid =  Guid.Empty;
            OwnerUserUuid =  Guid.Empty;
            IdentityInformation = new AccountIdentityInformation
            {
                Name = username,
                EmailAddress = $"{username}@example.com",
                CountryName = country,
                PhoneNumber = phoneNumber
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