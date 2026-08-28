namespace CloudPACS.Backend
{
    using System.ComponentModel.DataAnnotations;
    using System.Threading.Tasks;
    using static CloudPACS.Backend.Account;

    public interface IAccountRepository
    {
        Task AddAccountAsync(Account account);
        Task<bool> IsAccountExistsAsync(string email, string accountId);
        Task<bool> CanUploadFiles(Account account);
        Task<List<Account>> GetAccounts();
        Task UpdateAccountAsync(Account account, int newTotalStorage, AccountStatus newStatus, string newInternalNotes);
        Task<List<Account>> SearchAccountAsync(string keyword);
        Task<Account?> GetAccount(string accountId);
        Task DeleteAccountByAccountIdAsync(string accountId);
    }
}