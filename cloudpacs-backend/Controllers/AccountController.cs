namespace CloudPACS.Backend.Controllers
{
    using System;
    using System.ComponentModel.Design.Serialization;
    using System.IdentityModel.Tokens.Jwt;
    using System.Security.Claims;
    using System.Threading.Tasks;
    using CloudPACS.Backend.Interfaces;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using static CloudPACS.Backend.Account;

    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "SuperAdmin")]
    public class AccountController : ControllerBase
    {
        private readonly IAccountRepository accountRepository;
        private readonly IUserRepository userRepository;
        private readonly IPatientRepository patientRepository;
        private readonly IStudyRepository studyRepository;
        private readonly ISeriesRepository seriesRepository;
        private readonly IInstanceRepository instanceRepository;
        private readonly IReportRepository reportRepository;
        private readonly AuditLogService auditLogService;
        public AccountController(IAccountRepository accountRepository, IUserRepository userRepository, IPatientRepository patientRepository,
         IStudyRepository studyRepository, ISeriesRepository seriesRepository, IInstanceRepository instanceRepository, 
         IReportRepository reportRepository, AuditLogService auditLogService)
        {
            this.accountRepository = accountRepository;
            this.userRepository = userRepository;
            this.patientRepository = patientRepository;
            this.studyRepository = studyRepository;
            this.seriesRepository = seriesRepository;
            this.instanceRepository = instanceRepository;
            this.reportRepository = reportRepository;
            this.auditLogService = auditLogService;
        }

        [HttpGet]
        public async Task<IActionResult?> GetAccounts()
        {
            try
            {
                List<Account> accountList = await accountRepository.GetAccounts();
                return Ok(accountList);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"DATABASE ERROR: {ex.Message}");
                return null;
            }
        }

        [HttpGet("{accountId}/users")]
        public async Task<IActionResult?> GetUsers(string accountId)
        {
            try
            {
                List<User> userList = await userRepository.GetUsersByAccountIdAsync(accountId);
                return Ok(userList);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"DATABASE ERROR: {ex.Message}");
                return null;
            }
        }

        [HttpDelete("{accountId}/delete")]
        public async Task<IActionResult?> DeleteAccount(string accountId)
        {
            try
            {
                await instanceRepository.DeleteInstanceAsync(accountId);
                await userRepository.DeleteUserByAccountIdAsync(accountId);
                await studyRepository.DeleteStudyByAccountIdAsync(accountId);
                await seriesRepository.DeleteStudyByAccountIdAsync(accountId);
                await accountRepository.DeleteAccountByAccountIdAsync(accountId);
                await reportRepository.DeleteReportByAccountIdAsync(accountId);
                await patientRepository.DeletePatientByAccountIdAsync(accountId);
                await auditLogService.DeleteAduditLogByAccountIdAsync(accountId);
                return Ok();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"DATABASE ERROR: {ex.Message}");
                return null;
            }
        }

        [HttpPost("{accountId}/updateStorageLimit/{newStorageLimit}")]
        public async Task<IActionResult?> UpdateStorageLimit(string accountId, int newStorageLimit)
        {
            Account account = await accountRepository.GetAccount(accountId);
            await accountRepository.UpdateAccountAsync(account, newStorageLimit, account.Status, account.InternalNotes);
            return Ok();
        }

        [HttpPost("{accountId}/updateStatus")]
        public async Task<IActionResult?> UpdateStorageLimit([FromBody] UpdateStatusDto updateStatusDto, string accountId)
        {
            Account account = await accountRepository.GetAccount(accountId);
            await accountRepository.UpdateAccountAsync(account, account.TotalStorage, updateStatusDto.Status, account.InternalNotes);
            return Ok();
        }

        [HttpPost("{accountId}/updateInternalNotes/{newInternalNotes}")]
        public async Task<IActionResult?> UpdateStorageLimit(string accountId, string newInternalNotes)
        {
            Account account = await accountRepository.GetAccount(accountId);
            await accountRepository.UpdateAccountAsync(account, account.TotalStorage, account.Status, newInternalNotes);
            return Ok();
        }

        [HttpGet]
        [Route("search/{keyword}")]
        public async Task<IActionResult?> SearchForAccount(string keyword)
        {
            try
            {
                List<Account> accountList = await accountRepository.SearchAccountAsync(keyword);
                return Ok(accountList);
            }


            catch (Exception ex)
            {
                Console.WriteLine($"DATABASE ERROR: {ex.Message}");

                return NotFound(new List<Account>());
            }
        }
    }
}