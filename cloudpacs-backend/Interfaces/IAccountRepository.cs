namespace CloudPACS.Backend
{
    using System.Threading.Tasks;
    public interface IAccountRepository
    {
        Task AddAccountAsync(Account account);
        Task<Account?> LoginAsync(LoginRequestDto loginRequestDto);
    }
}