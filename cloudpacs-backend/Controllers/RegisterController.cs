namespace CloudPACS.Backend.Controllers
{
    using System;
    using System.Threading.Tasks;
    using Microsoft.AspNetCore.Mvc;

    public record RegisterRequest(string email, string password /*string Username, string PhoneNumber, string Country, string Brandname*/);

    [Route("api")]
    [ApiController]
    public class RegisterController : ControllerBase
    {
        private readonly AccountRepository _accountRepo;

        public RegisterController(AccountRepository accountRepo)
        {
            _accountRepo = accountRepo;
        }
        [HttpPost("test")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest req)
        {
            try
            {
                Console.WriteLine("Attempting to save user to Database...");
                var account = new Account(
                    Guid.NewGuid(),
                    req.email,
                    Guid.NewGuid().ToString(),
                    req.password
                //req.PhoneNumber, 
                //req.Country,     
                );

                await _accountRepo.AddAccountAsync(account);
                Console.WriteLine("Successfully saved!");

                return Ok(new { success = true, message = "Account created." });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"DATABASE ERROR: {ex.Message}");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }
}