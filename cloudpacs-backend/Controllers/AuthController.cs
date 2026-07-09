namespace CloudPACS.Backend.Controllers
{
    using System;
    using System.Threading.Tasks;
    using Microsoft.AspNetCore.Mvc;

    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAccountRepository accountRepo;

        public AuthController(IAccountRepository accountRepo)
        {
            this.accountRepo = accountRepo;
        }
        [HttpPost]
        [Route("Register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequestDto req)
        {
            try
            {
                Console.WriteLine("Attempting to save user to Database...");
                var account = new Account(
                    Guid.NewGuid(),
                    req.Email,
                    Guid.NewGuid().ToString(),
                    req.Password
                //req.PhoneNumber, 
                //req.Country,     
                );

                await accountRepo.AddAccountAsync(account);
                Console.WriteLine("Successfully saved!");

                return Ok(new { success = true, message = "Account created." });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"DATABASE ERROR: {ex.Message}");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost]
        [Route("Login")]
        public async Task<ActionResult> Login([FromBody] LoginRequestDto loginRequestDto)
        {
            try
            {
                Console.WriteLine("Attempting to get user from Database...");

                var account = await accountRepo.LoginAsync(loginRequestDto);

                if (account != null)
                {
                    return Ok(new { success = true, message = "Account logged in."});
                }

                return NotFound("Account not found");
            }

            catch (Exception ex)
            {
                Console.WriteLine($"DATABASE ERROR: {ex.Message}");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }
}