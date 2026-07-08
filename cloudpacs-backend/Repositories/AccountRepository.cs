namespace CloudPACS.Backend
{
    using System.Threading.Tasks;
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
    }
}