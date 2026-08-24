namespace CloudPACS.Backend
{
    using System.ComponentModel.DataAnnotations;
    using System.Threading.Tasks;
    public interface IAccountRepository
    {
        Task AddAccountAsync(Account account);
        Task<bool> IsAccountExistsAsync(string email, string accountId);
        Task<bool> CanUploadFiles(Account account);
    }
}