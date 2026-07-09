namespace CloudPACS.Backend
{
    using System.Threading.Tasks;
    using BCrypt.Net;
    using Microsoft.Azure.Cosmos;

    public class AccountRepository : IAccountRepository
    {
        private readonly Container container;

        public AccountRepository(CosmosClient client)
        {
            container = client.GetContainer("Console", "Client-Accounts");
        }

        public async Task AddAccountAsync(Account account)
        {
            try
            {
                await container.CreateItemAsync(account, new PartitionKey(account.AccountId));
            }
            catch (CosmosException ex)
            {
                throw new System.Exception($"An error has occured while adding the account: {ex.Message}", ex);
            }
        }

        public async Task<Account?> LoginAsync(LoginRequestDto loginRequestDto)
        {
            try
            {
                var query = new QueryDefinition("SELECT * FROM container WHERE c.email = @email").WithParameter("@email", loginRequestDto.Email);

                using FeedIterator<Account> iterator = container.GetItemQueryIterator<Account>(query);

                while (iterator.HasMoreResults)
                {
                    FeedResponse<Account> response = await iterator.ReadNextAsync();
                    Account account = response.FirstOrDefault();
                    if (account != null)
                    {
                        if (BCrypt.Verify(loginRequestDto.Password, account.Password))
                        {
                            return account;
                        }
                    }
                }
                return null;

            }
            catch (Exception e)
            {
                throw new System.Exception($"A problem has occurred while trying to access the account: {e.Message}", e);
            }
        }
    }
}