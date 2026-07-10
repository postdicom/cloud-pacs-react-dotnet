namespace CloudPACS.Backend
{
    using System;
    using System.Linq;
    using System.Threading.Tasks;
    using Microsoft.Azure.Cosmos;
    using Microsoft.Identity.Client;
    using BCrypt.Net;

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
                bool exists = await IsEmailExistsAsync(user.Email, user.AccountId);
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
        public async Task<bool> IsEmailExistsAsync(string email, string accountId)
        {
            try
            {
                var query = new QueryDefinition(
                    "SELECT VALUE COUNT(1) FROM c WHERE c.Email = @email AND c.AccountId = @accountId")
                    .WithParameter("@Email", email)
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
        public async Task UpdateUserAsync(User user, UserRole newRole, string newEmail, string newUsername, string newPhoneNumber, string userId, string accountId)
        {
            try
            {
                user.Email = newEmail;
                user.Name = newUsername;
                user.Role = newRole;
                user.PhoneNumber = newPhoneNumber;
                await container.ReplaceItemAsync(user, userId, new PartitionKey(accountId));
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

        public async Task<bool> CheckPasswordAsync(LoginRequestDto loginRequestDto)
        {
            User? user = await FindUserAsync(loginRequestDto.Email);
            if (user == null)
            {
                return false;
            }

            return BCrypt.Verify(loginRequestDto.Password, user.Password);
        }
    }
}