namespace CloudPACS.Backend
{
    using System.Threading.Tasks;
    using Microsoft.Azure.Cosmos;

    public interface IUserRepository
    {
        Task AddUserAsync(User user);
        Task<bool> IsEmailExistsAsync(string email, string accountId);
        Task<User> ReadUserAsync(string userId, string accountId); 
        Task DeleteUserAsync(string userId, string accountId);
        Task UpdateUserAsync(User user, UserRole newRole, string newEmail, string newUsername, string newPhoneNumber, string userId, string accountId);
        Task<User?> FindUserAsync(string email);
        Task<bool> IsPasswordValid(LoginRequestDto loginRequestDto, string password);
    }
}