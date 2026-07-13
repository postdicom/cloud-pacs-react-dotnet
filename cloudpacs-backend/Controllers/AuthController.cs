namespace CloudPACS.Backend.Controllers
{
    using System;
    using BCrypt.Net;
    using System.Threading.Tasks;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.IdentityModel.Tokens;
    using System.IdentityModel.Tokens.Jwt;
    using System.Security.Claims;
    using System.Text;
    using DotNetEnv;

    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAccountRepository accountRepository;
        private IUserRepository userRepository;
        private readonly IConfiguration config;

        public AuthController(IAccountRepository accountRepository, IUserRepository userRepository, IConfiguration config)
        {
            this.accountRepository = accountRepository;
            this.userRepository = userRepository;
            this.config = config;
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
                    registerRequestDto.Name,
                    Guid.NewGuid().ToString(),
                    BCrypt.HashPassword(registerRequestDto.Password)
                //req.PhoneNumber, 
                //req.Country,     
                );

                var user = new User(
                    account.AccountId,
                    registerRequestDto.Name,
                    registerRequestDto.Email,
                    UserRole.Viewer, // default
                    BCrypt.HashPassword(registerRequestDto.Password)
                );

                await accountRepository.AddAccountAsync(account);
                await userRepository.AddUserAsync(user);
                Console.WriteLine("Successfully saved!");

                return Ok(new { success = true, message = "Account created."});
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

                var user = await userRepository.FindUserAsync(loginRequestDto.Email);

                if (user != null)
                {
                    if (await userRepository.IsPasswordValid(loginRequestDto, user.Password))
                    {
                        var token = await GenerateToken(user);
                        return Ok(user); //loginReponseDto
                    }
                    else
                    {
                        return NotFound("The password doesn't match.");
                    }
                }
                return NotFound("The account doesn't exist.");
            }

            catch (Exception ex)
            {
                Console.WriteLine($"DATABASE ERROR: {ex.Message}");
                return BadRequest();
            }
        }

        private async Task<string> GenerateToken(User user)
        {
            Env.Load("keys.env");
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Environment.GetEnvironmentVariable("JWT")));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            List<Claim> claims =
            [
                new (JwtRegisteredClaimNames.Sub, user.UserId),
                new (JwtRegisteredClaimNames.Email, user.Email),
                new(ClaimTypes.Role, user.Role.ToString())
            ];

            var token = new JwtSecurityToken(config["Jwt:Issuer"],
                config["Jwt:Audience"],
                claims,
                expires: DateTime.UtcNow.AddMinutes(480),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}