namespace CloudPACS.Backend
{
    using System;
    using System.Threading.Tasks;
    using CloudPACS.Backend.Data;
    using DotNetEnv;
    using CloudPACS.Backend;
    using Microsoft.Azure.Cosmos;

    public class Program
    {
        static async Task Main(string[] args)
        {
            Env.Load("keys.env");
            string endpoint = Environment.GetEnvironmentVariable("COSMOS_ENDPOINT")
                ?? throw new InvalidOperationException("COSMOS_ENDPOINT not set");
            string key = Environment.GetEnvironmentVariable("COSMOS_KEY")
                ?? throw new InvalidOperationException("COSMOS_KEY not set");

            Console.WriteLine("Connecting to database");

            var builder = WebApplication.CreateBuilder(args);

            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

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

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend", policy =>
                    policy.WithOrigins("http://localhost:3000/api/Auth/")
                          .AllowAnyHeader()
                          .AllowAnyMethod());
            });
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            builder.Services.AddControllers();



            var app = builder.Build(); 

            app.UseSwagger();//swager test
            app.UseSwaggerUI();

            app.UseCors("AllowFrontend");
            app.MapControllers();

            await app.RunAsync();
        }
    }
}