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
        private readonly IAccountRepository _accountRepository;
        private IUserRepository _userRepository;
        private readonly IConfiguration _config;

        public AuthController(IAccountRepository accountRepository, IUserRepository userRepository, IConfiguration config)
        {
            _accountRepository = accountRepository;
            _userRepository = userRepository;
            _config = config;
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

                await _accountRepository.AddAccountAsync(account);
                await _userRepository.AddUserAsync(user);
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
                Console.WriteLine(loginRequestDto);
                var user = await _userRepository.FindUserAsync(loginRequestDto.Email);

                if (user != null)
                {
                    if (await _userRepository.IsPasswordValid(loginRequestDto, user.Password))
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
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Environment.GetEnvironmentVariable("Jwt__SecretKey")));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);
            var jwtSettings = _config.GetSection("JwtSettings");

            List<Claim> claims =
            [
                new (JwtRegisteredClaimNames.Sub, user.UserId),
                new (JwtRegisteredClaimNames.Email, user.Email),
                new(ClaimTypes.Role, user.Role.ToString())
            ];

            var issuer = jwtSettings["Issuer"];
            var audience = jwtSettings["Audience"];

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(480),
                signingCredentials: credentials);
                
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}