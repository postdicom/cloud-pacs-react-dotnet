namespace CloudPACS.Backend.Controllers
{
    using System;
    using BCrypt.Net;
    using System.Threading.Tasks;
    using Microsoft.AspNetCore.Mvc;

    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAccountRepository accountRepository;
        private IUserRepository userRepository;

        public AuthController(IAccountRepository accountRepository, IUserRepository userRepository)
        {
            this.accountRepository = accountRepository;
            this.userRepository = userRepository;
        }
        [HttpPost]
        [Route("Register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequestDto registerRequestDto)
        {
            try
            {
                Console.WriteLine("Attempting to save user to Database...");
                var account = new Account(
                    Guid.NewGuid(),
                    registerRequestDto.Email,
                    Guid.NewGuid().ToString(),
                    BCrypt.HashPassword(registerRequestDto.Password)
                //req.PhoneNumber, 
                //req.Country,     
                );

                var user = new User(
                    account.AccountId,
                    registerRequestDto.Name,
                    registerRequestDto.Email,
                    registerRequestDto.Role,
                    registerRequestDto.Password
                );

                await accountRepository.AddAccountAsync(account);
                await userRepository.AddUserAsync(user);
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
        public async Task<User?> Login([FromBody] LoginRequestDto loginRequestDto)
        {
            try
            {
                Console.WriteLine("Attempting to get user from Database...");

                var user = await userRepository.FindUserAsync(loginRequestDto.Email);

                if (user != null)
                {
                    if(await userRepository.CheckPasswordAsync(loginRequestDto))
                    {
                        return user;
                    }
                }
                return null; 
            }

            catch (Exception ex)
            {
                Console.WriteLine($"DATABASE ERROR: {ex.Message}");
                return null;
            }
        }
    }
}