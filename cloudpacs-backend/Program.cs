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
    using Azure.Storage.Blobs;
    using Microsoft.OpenApi;
    using CloudPACS.Backend.Interfaces;
    using CloudPACS.Backend.Repositories;
    using Microsoft.AspNetCore.Server.Kestrel.Core;

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
            string blobConnectionString = Environment.GetEnvironmentVariable("BLOB_STORAGE_CONNECTION_STRING")
                ?? throw new InvalidOperationException("Couldnt read the blob connection string");

            Console.WriteLine("Connecting to database");

            var builder = WebApplication.CreateBuilder(args);


            using (var dbInitializer = new CosmosDbInitializer(endpoint, key))
            {
                await dbInitializer.SetupDatabasesAndContainersAsync();
            }
            var cosmosClientOptions = new CosmosClientOptions
            {
                ConnectionMode = ConnectionMode.Gateway,
                LimitToEndpoint = true,
            };

            builder.Services.AddSingleton(new CosmosClient(endpoint, key, cosmosClientOptions));
            builder.Services.AddScoped<IAccountRepository, AccountRepository>();
            builder.Services.AddScoped<IUserRepository, UserRepository>();
            builder.Services.AddScoped<IPatientRepository, PatientRepository>();
            builder.Services.AddScoped<IStudyRepository, StudyRepository>();
            builder.Services.AddScoped<ISeriesRepository, SeriesRepository>();
            builder.Services.AddScoped<IInstanceRepository, InstanceRepository>();
            builder.Services.AddScoped<IDicomViewRepository, DicomViewRepository>();
            builder.Services.AddScoped<IReportRepository, ReportRepository>();
            builder.Services.AddSingleton(x => new BlobServiceClient(blobConnectionString));
            builder.Services.AddScoped<ReportGenerationService>();

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend", policy =>
                    policy.WithOrigins("http://localhost:5173")
                          .AllowAnyHeader()
                          .AllowAnyMethod());
            });
            builder.Services.AddEndpointsApiExplorer();

            builder.Services.AddSwaggerGen(options =>
            {
                options.SwaggerDoc("v1", new OpenApiInfo
                {
                    Title = "CloudPACS API",
                    Version = "v1"
                });

                options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Type = SecuritySchemeType.Http,
                    Scheme = "bearer",
                    BearerFormat = "JWT",
                    In = ParameterLocation.Header,
                    Description = jwt
                });

                options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
                {
                    [new OpenApiSecuritySchemeReference("Bearer", document)] = []
                });
            });
            builder.WebHost.ConfigureKestrel(options =>
            {
                options.ConfigureEndpointDefaults(listenOptions =>
            {
                listenOptions.Protocols = HttpProtocols.Http1;
            });
            });

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

            app.UseCors("AllowFrontend");

            Console.WriteLine($"Environment: {app.Environment.EnvironmentName}");

            app.UseSwagger();//swager test
            app.UseSwaggerUI();
            app.UseDeveloperExceptionPage();

            app.UseRouting();



            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();

            await app.RunAsync();
        }
    }
}