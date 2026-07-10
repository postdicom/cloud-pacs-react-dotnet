using CloudPACS.Backend;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authorization.Infrastructure;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.Configuration;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace CloudPACS.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class JwtController : ControllerBase
    {
        AuthController authController;
        private readonly IConfiguration config;
        public JwtController(IConfiguration config)
        {
            this.config = config;
        }

        [AllowAnonymous]
        [HttpPost]
        public async Task<ActionResult> Login([FromBody] LoginRequestDto loginRequestDto)
        {
            User user = await authController.Login(loginRequestDto);
            if (user != null)
            {
                var token = await GenerateToken(user);
                //localStorage.setItem("jwtToken", response.data.token);
                return Ok(token);
            }

            return NotFound("user not found");
        }

        // To generate token
        private async Task<string> GenerateToken(User user)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("AxiaAzNam03290saivOvFcEywf4n6Vaud18ms2aIUSUYws2MXbxTU2"));
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
