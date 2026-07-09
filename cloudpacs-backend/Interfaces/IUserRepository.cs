namespace CloudPACS.Backend
{
    using System.Threading.Tasks;

    public interface IUserRepository
    {
        Task AddUserAsync(User user);
        Task<bool> IfEmailExistsAsync(string email, string accountId);
        Task<User> ReadUserAsync(string userId, string accountId); 
        Task DeleteUserAsync(string userId, string accountId);
        Task UpsertUserAsync(User user, UserRole newRole, string newEmail, string newUsername, string newPhoneNumber);
    }
}