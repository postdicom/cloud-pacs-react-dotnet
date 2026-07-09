namespace CloudPACS.Backend
{
    using System.Threading.Tasks;

    public interface IUserRepository
    {
        Task AddUserAsync(User user);
        Task<bool> IfEmailExistsAsync(string email, string accountId);
    }
}