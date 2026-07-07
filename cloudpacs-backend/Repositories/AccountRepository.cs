namespace CloudPACS.Backend
{
    using System.Threading.Tasks;
    using Microsoft.Azure.Cosmos;

    public class AccountRepository
    {
        private readonly Container container;

        public AccountRepository(CosmosClient client)
        {
            container = client.GetContainer("Console", "Client-Accounts");
        }

        public async Task AddAccountAsync(Account account)
        {
            await container.CreateItemAsync(account, new PartitionKey(account.accountId));
        }
    }
}