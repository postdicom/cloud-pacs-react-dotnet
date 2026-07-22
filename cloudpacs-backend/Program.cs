namespace CloudPACS.Backend
{
    using System;
    using System.Threading.Tasks;
    using Data;
    using DotNetEnv;
    using CloudPACS.Backend;
    using Microsoft.Azure.Cosmos;
    using Microsoft.AspNetCore.Authentication.JwtBearer;
    using Microsoft.IdentityModel.Tokens;
    using System.Text;

    public class Program
    {
        static async Task Main(string[] args)
        {
            Env.Load("keys.env");
            string endpoint = Environment.GetEnvironmentVariable("COSMOS_ENDPOINT")
                ?? throw new InvalidOperationException("COSMOS_ENDPOINT not set");
            string key = Environment.GetEnvironmentVariable("COSMOS_KEY")
                ?? throw new InvalidOperationException("COSMOS_KEY not set");
            string jwt = Environment.GetEnvironmentVariable("Jwt__SecretKey")
                ?? throw new InvalidOperationException("Couldnt read JWT key");

            Console.WriteLine("Connecting to database");

            var builder = WebApplication.CreateBuilder(args);


            using (var dbInitializer = new CosmosDbInitializer(endpoint, key))
            {
                await dbInitializer.SetupDatabasesAndContainersAsync();
            }
            var cosmosClientOptions = new CosmosClientOptions
            {
                HttpClientFactory = () =>
                {
                    HttpMessageHandler httpMessageHandler = new HttpClientHandler()
                    {
                        ServerCertificateCustomValidationCallback = HttpClientHandler.DangerousAcceptAnyServerCertificateValidator
                    };
                    return new HttpClient(httpMessageHandler);
                },
                ConnectionMode = ConnectionMode.Gateway,
                LimitToEndpoint = true,
            };

            builder.Services.AddSingleton(new CosmosClient(endpoint, key, cosmosClientOptions));
            builder.Services.AddScoped<IAccountRepository, AccountRepository>();
            builder.Services.AddScoped<IUserRepository, UserRepository>();

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend", policy =>
                    policy.WithOrigins("http://localhost:5173")
                          .AllowAnyHeader()
                          .AllowAnyMethod());
            });
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();
            builder.Services.AddHttpContextAccessor();

            builder.Services.AddControllers();

            builder.Services.AddSingleton<AuditLogService>();

            builder.Services
                .AddAuthentication(options =>
                {
                    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                })
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer = "cloudpacs-backend",
                        ValidAudience = "cloudpacs-frontend",
                        IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(jwt)),
                    };
                });

            var app = builder.Build();

            app.UseAuthentication();
            app.UseAuthorization();
            app.UseSwagger();//swager test
            app.UseSwaggerUI();
            app.UseDeveloperExceptionPage();

            app.UseRouting();
            app.UseCors("AllowFrontend");
            app.MapControllers();

            await app.RunAsync();
        }
    }
}