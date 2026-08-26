namespace CloudPACS.Backend
{
    using System.Drawing;
    using System.Threading.Tasks;
    using BCrypt.Net;
    using Microsoft.Azure.Cosmos;
    using static CloudPACS.Backend.Account;

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

        public async Task<List<Account>> GetAccounts()
        {
            try
            {
                var query = new QueryDefinition("SELECT * FROM c");

                var accountList = new List<Account>();
                using var iterator = container.GetItemQueryIterator<Account>(query);

                while (iterator.HasMoreResults)
                {
                    var page = await iterator.ReadNextAsync();
                    accountList.AddRange(page);
                }
                return accountList;
            }

            catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                Console.WriteLine("The account list has not been found");
                return [];
            }
            catch (CosmosException ex)
            {
                Console.WriteLine($"Cosmos error while reading account list: {ex.StatusCode} — {ex.Message}");
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

        public async Task UpdateAccountAsync(Account account, int newTotalStorage, AccountStatus newStatus, string newInternalNotes)
        {
            try
            {
               account.TotalStorage = newTotalStorage;
               account.Status = newStatus;
               account.InternalNotes = newInternalNotes;
                await container.ReplaceItemAsync(account, account.Id, new PartitionKey(account.accountId));
            }
            catch (CosmosException ex)
            {
                Console.WriteLine($"Cosmos error updating account: {ex.StatusCode} — {ex.Message}");
                throw;
            }
        }

        public async Task<List<Account>> SearchAccountAsync(string keyword)
        {
            try
            {
                var query = new QueryDefinition(
                    "SELECT VALUE c FROM c WHERE c.AccountName LIKE @accountName")
                    .WithParameter("@accountName", $"%{keyword}%");

                var requestOptions = new QueryRequestOptions();

                var accountList = new List<Account>();
                using var iterator = container.GetItemQueryIterator<Account>(query, requestOptions: requestOptions);

                while (iterator.HasMoreResults)
                {
                    var page = await iterator.ReadNextAsync();
                    accountList.AddRange(page);
                }
                return accountList;
            }
            catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                Console.WriteLine("The account lis has not been found");
                return [];
            }
            catch (CosmosException ex)
            {
                Console.WriteLine($"Cosmos error while reading account list: {ex.StatusCode} — {ex.Message}");
                throw;
            }
        }

        public async Task<Account?> GetAccount(string accountId)
        {
            var query = new QueryDefinition("SELECT * FROM c WHERE c.accountId = @accountId")
                .WithParameter("@accountId", accountId);

            using var iterator = container.GetItemQueryIterator<Account>(query);            
            while (iterator.HasMoreResults)
            {
                var page = await iterator.ReadNextAsync();
                var match = page.FirstOrDefault();
                if (match != null) return match;
            }

            return null;
        }
    }
}