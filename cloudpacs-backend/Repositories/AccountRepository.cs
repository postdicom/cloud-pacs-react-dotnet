namespace CloudPACS.Backend
{
    using System.Threading.Tasks;
    using BCrypt.Net;
    using Microsoft.Azure.Cosmos;

    public class AccountRepository : IAccountRepository
    {
        private readonly Container container;
        private readonly UserRepository userRepository;

        public AccountRepository(CosmosClient client) 
        {
            container = client.GetContainer("Console", "Client-Accounts");
        }

        public async Task AddAccountAsync(Account account)
        {
            try
            {
                bool exists = await IsAccountExistsAsync(account.IdentityInformation.EmailAddress, account.accountId);
                if (exists)
                {
                    throw new InvalidOperationException($"There is already an account under this id '{account.accountId}'");
                }
                await container.CreateItemAsync(account, new PartitionKey(account.accountId));
            }
            catch (CosmosException ex)
            {
                throw new Exception($"An error has occured while adding the account: {ex.Message}", ex);
            }
        }

        public async Task<bool> IsAccountExistsAsync(string email, string accountId)
        {
            try
            {
                var query = new QueryDefinition(
                    "SELECT VALUE 1 FROM c WHERE c.IdentityInformation.EmailAddress = @email")
                    .WithParameter("@email", email);

                using FeedIterator<int> iterator = container.GetItemQueryIterator<int>(query);

                if (iterator.HasMoreResults)
                {
                    FeedResponse<int> response = await iterator.ReadNextAsync();
                    return response.FirstOrDefault() > 0;
                }
                return false;
            }
            catch (CosmosException ex)
            {
                Console.WriteLine($"Cosmos error while checking the existence of the account: {ex.StatusCode} — {ex.Message}");
                throw;
            }
        }

        public async Task<bool> CanUploadFiles(Account account)
        {
            try
            {
                var query = new QueryDefinition(
                    "SELECT VALUE c FROM c WHERE c.Status = @status")
                    .WithParameter("@status", account.Status);

                var requestOptions = new QueryRequestOptions
                {
                    PartitionKey = new PartitionKey(account.accountId)
                };

                using var iterator = container.GetItemQueryIterator<Account>(query, requestOptions: requestOptions);

                while (iterator.HasMoreResults)
                {
                    return true;
                }
                return false;
            }

            catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                Console.WriteLine("The account has not been found");
                return false;
            }
            catch (CosmosException ex)
            {
                Console.WriteLine($"Cosmos error while reading account: {ex.StatusCode} — {ex.Message}");
                throw;
            }
        }
    }
}