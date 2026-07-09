namespace CloudPACS.Backend
{
    using System;
    using System.Linq;
    using System.Threading.Tasks;
    using Microsoft.Azure.Cosmos;

    public class UserRepository : IUserRepository
    {
        private readonly Container container;

        public UserRepository(CosmosClient client)
        {
            container = client.GetContainer("Console", "Console-Users");
        }

        public async Task AddUserAsync(User user)
        {
            try
            {
                bool exists = await IfEmailExistsAsync(user.Email, user.AccountId);
                if (exists)
                {
                    throw new InvalidOperationException($"There is already an user with the email of '{user.Email}.'");
                }

                await container.CreateItemAsync(user, new PartitionKey(user.AccountId));
            }
            catch (CosmosException ex)
            {
                Console.WriteLine($"Cosmos error adding user: {ex.StatusCode} — {ex.Message}");
                throw;
            }
        }
        public async Task<bool> IfEmailExistsAsync(string email, string accountId)
        {
            try
            {
                var query = new QueryDefinition(
                    "SELECT VALUE COUNT(1) FROM c WHERE c.email = @email AND c.AccountId = @accountId")
                    .WithParameter("@email", email)
                    .WithParameter("@accountId", accountId);

                using FeedIterator<int> iterator = container.GetItemQueryIterator<int>(
                    query,
                    requestOptions: new QueryRequestOptions { PartitionKey = new PartitionKey(accountId) });

                if (iterator.HasMoreResults)
                {
                    FeedResponse<int> response = await iterator.ReadNextAsync();
                    return response.FirstOrDefault() > 0;
                }

                return false;
            }
            catch (CosmosException ex)
            {
                Console.WriteLine($"Cosmos error while checking email existence: {ex.StatusCode} — {ex.Message}");
                throw;
            }
        }
        public async Task UpsertUserAsync(User user, UserRole newRole, string newEmail, string newUsername, string newPhoneNumber)
        {
            try
            {
                var patchOperations = new List<PatchOperation>
                {
                    PatchOperation.Replace("/Email", newEmail),
                    PatchOperation.Replace("/Role", newRole),
                    PatchOperation.Replace("/PhoneNumber", newPhoneNumber),
                    PatchOperation.Replace("/Username", newUsername)
                };
                await container.PatchItemAsync<User>(user.UserId, new PartitionKey(user.AccountId), patchOperations);
            }
            catch (CosmosException ex)
            {
                Console.WriteLine($"Cosmos error updating console user: {ex.StatusCode} — {ex.Message}");
                throw;
            }
        }
        public async Task<User> ReadUserAsync(string userId, string accountId)
        {
            try
            {
                ItemResponse<User> response = await container.ReadItemAsync<User>(userId, new PartitionKey(accountId));

                return response.Resource;
            }
            catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                Console.WriteLine("The user has not been found");
                return null;
            }
            catch (CosmosException ex)
            {
                Console.WriteLine($"Cosmos error while reading user: {ex.StatusCode} — {ex.Message}");
                throw;
            }
        }
        public async Task DeleteUserAsync(string userId, string accountId)
        {
            try
            {
                await container.DeleteItemAsync<User>(userId, new PartitionKey(accountId));
            }
            catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                Console.WriteLine("This user does not exist.");
                return;
            }
            catch (CosmosException ex)
            {
                Console.WriteLine($"Cosmos error while deleting user: {ex.StatusCode} — {ex.Message}");
                throw;
            }
        }
    }
}