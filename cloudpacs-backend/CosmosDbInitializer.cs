namespace CloudPACS.Backend
{
    using System;
    using System.Net.Http;
    using System.Threading.Tasks;
    using Microsoft.Azure.Cosmos;

    public class CosmosDbInitializer : IDisposable
    {
        private readonly CosmosClient client;
        public CosmosDbInitializer(string endpoint, string key)
        {
            var cosmosClientOptions = new CosmosClientOptions
            {
                HttpClientFactory = () =>
                {
                    HttpMessageHandler httpMessageHandler = new HttpClientHandler()
                    {
                        // This is only here for development wont be in the final version
                        ServerCertificateCustomValidationCallback = HttpClientHandler.DangerousAcceptAnyServerCertificateValidator
                    };
                    return new HttpClient(httpMessageHandler);
                },
                ConnectionMode = ConnectionMode.Gateway,
                LimitToEndpoint = true,
            };

            client = new CosmosClient(endpoint, key, cosmosClientOptions);
        }
        public async Task SetupDatabasesAndContainersAsync()
        {
            try
            {
                var cloudPacsDbResponse = await client.CreateDatabaseIfNotExistsAsync("CloudPACS");
                var cloudPacsDb = cloudPacsDbResponse.Database;
                
                var consoleDbResponse = await client.CreateDatabaseIfNotExistsAsync("Console");
                var consoleDb = consoleDbResponse.Database;
                // CloudPACS DB Containers
                await CreateContainer(cloudPacsDb, "AuditLog", "/userId");
                await CreateContainer(cloudPacsDb, "Instance", "/seriesGuid");
                await CreateContainer(cloudPacsDb, "Patient", "/customerId");
                await CreateContainer(cloudPacsDb, "Series", "/studyGuid");
                await CreateContainer(cloudPacsDb, "Study", "/patientGuid");

                // Console DB Containers
                await CreateContainer(consoleDb, "Client-Accounts", "/accountId");
                await CreateContainer(consoleDb, "Console-Users", "/accountId");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Connection or setup failed: {ex}");
            }
        }
        private async Task CreateContainer(Database db, string containerName, string partitionKeyPath)
        {
            try
            {
                ContainerProperties containerProperties = new ContainerProperties(
                    id: containerName,
                    partitionKeyPath: partitionKeyPath
                );
                
                if(db.CreateContainerIfNotExistsAsync(containerProperties) != null)
                {
                    Console.WriteLine($"This {db.Id}/{containerName} container is already in the database.");
                }
                else
                {
                    Container container = await db.CreateContainerIfNotExistsAsync(containerProperties);
                    Console.WriteLine($"{db.Id}/{containerName} is created to the database");
                }
            }
            catch (CosmosException cosmosEx)
            {
                Console.WriteLine($"Cosmos DB Error on {db.Id}/{containerName} — Status Code: {cosmosEx.StatusCode}, Message: {cosmosEx.Message}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"General error on {db.Id}/{containerName} — {ex.Message}");
            }
        }
        public void Dispose()
        {
            client?.Dispose();
        }
    }
}