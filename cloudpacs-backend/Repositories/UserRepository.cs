namespace CloudPACS.Backend
{
    using System;
    using System.Linq;
    using System.Threading.Tasks;
    using Microsoft.Azure.Cosmos;
    using BCrypt.Net;
    using Microsoft.AspNetCore.Http.HttpResults;

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
                bool exists = await IsEmailExistsAsync(user.Email, user.accountId);
                if (exists)
                {
                    throw new InvalidOperationException($"There is already an user with the email of '{user.Email}.'");
                }

                await container.CreateItemAsync(user, new PartitionKey(user.accountId));
            }
            catch (CosmosException ex)
            {
                Console.WriteLine($"Cosmos error adding user: {ex.StatusCode} — {ex.Message}");
                throw;
            }
        }
        public async Task<bool> IsEmailExistsAsync(string email, string accountId)
        {
            try
            {
                var query = new QueryDefinition(
                    "SELECT VALUE 1 FROM c WHERE c.Email = @email AND c.AccountId = @accountId")
                    .WithParameter("@Email", email)
                    .WithParameter("@accountId", accountId);

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
                Console.WriteLine($"Cosmos error while checking email existence: {ex.StatusCode} — {ex.Message}");
                throw;
            }
        }
        public async Task UpdateUserAsync(User user, UserRole newRole, string newEmail, string newUsername, string newPhoneNumber, string userId, string accountId)
        {
            try
            {
                user.Email = newEmail;
                user.Name = newUsername;
                user.Role = newRole;
                await container.ReplaceItemAsync(user, userId, new PartitionKey(accountId));
            }
            catch (CosmosException ex)
            {
                Console.WriteLine($"Cosmos error updating console user: {ex.StatusCode} — {ex.Message}");
                throw;
            }
        }
        public async Task<User?> ReadUserAsync(string userId, string accountId)
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

        public async Task<User?> FindUserAsync(string email)
        {
            try
            {
                var query = new QueryDefinition(
                    "SELECT VALUE c FROM c WHERE c.Email = @email")
                    .WithParameter("@email", email);

                using FeedIterator<User> iterator = container.GetItemQueryIterator<User>(query);

                if (iterator.HasMoreResults)
                {
                    var response = await iterator.ReadNextAsync();
                    return response.FirstOrDefault();
                }
                return null;
            }

            catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                Console.WriteLine("This user does not exist.");
                return null;
            }
        }

        public async Task<bool> IsPasswordValid(LoginRequestDto loginRequestDto, string password)
        {
            return BCrypt.Verify(loginRequestDto.Password, password);
        }

        public async Task<User?> FindUserByUserIdAsync(string accountId)
        {
            try
            {
                var query = new QueryDefinition(
                    "SELECT VALUE c FROM c WHERE c.id = @accountId")
                    .WithParameter("@accountId", accountId);

                using FeedIterator<User> iterator = container.GetItemQueryIterator<User>(query);

                if (iterator.HasMoreResults)
                {
                    var response = await iterator.ReadNextAsync();
                    Console.WriteLine($"[DEBUG] Searching for accountId: '{accountId}'");
                    return response.FirstOrDefault();
                }
                return null;
            }

            catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                Console.WriteLine("This user does not exist.");
                return null;
            }
        }
    }
}