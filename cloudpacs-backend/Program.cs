namespace CloudPACS.Backend
{
    using System;
    using System.Threading.Tasks;
    using DotNetEnv;

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

            using (var dbInitializer = new CosmosDbInitializer(endpoint, key))
            {
                await dbInitializer.SetupDatabasesAndContainersAsync();
            }

            Console.WriteLine("Initialization process completed.");
        }
    }
}