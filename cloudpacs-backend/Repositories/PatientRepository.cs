namespace CloudPACS.Backend
{
    using System;
    using System.Linq;
    using System.Threading.Tasks;
    using Microsoft.Azure.Cosmos;
    public class PatientRepository : IPatientRepository
    {
        private readonly Container container;

        public PatientRepository(CosmosClient client)
        {
            container = client.GetContainer("CloudPACS", "Patient");
        }

        public async Task AddPatientAsync(Patient patient)
        {
            try
            {
                bool exists = await IsPatientExistsAsync(patient.Mrn, patient.userId);
                if (exists)
                {
                    throw new InvalidOperationException($"There is already a patient '{patient.Name}' under this user");
                }

                await container.CreateItemAsync(patient, new PartitionKey(patient.userId));
            }
            catch (CosmosException ex)
            {
                Console.WriteLine($"Cosmos error adding patient: {ex.StatusCode} — {ex.Message}");
                throw;
            }
        }

        public async Task<bool> IsPatientExistsAsync(string mrn, string userId)
        {
            try
            {
                var query = new QueryDefinition(
                    "SELECT VALUE 1 FROM c WHERE c.Mrn = @mrn AND c.UserId = @userId")
                    .WithParameter("@mrn", mrn)
                    .WithParameter("@userId", userId);

                using FeedIterator<int> iterator = container.GetItemQueryIterator<int>(
                    query,
                    requestOptions: new QueryRequestOptions { PartitionKey = new PartitionKey(userId) });

                if (iterator.HasMoreResults)
                {
                    FeedResponse<int> response = await iterator.ReadNextAsync();
                    return response.FirstOrDefault() > 0;
                }

                return false;
            }
            catch (CosmosException ex)
            {
                Console.WriteLine($"Cosmos error while checking the existence of the patient: {ex.StatusCode} — {ex.Message}");
                throw;
            }
        }

        public async Task UpdatePatientAsync(Patient patient, string Mrn, string UserId, string Name, string DoB)
        {
            try
            {
                patient.Mrn = Mrn;
                patient.userId = UserId;
                patient.Name = Name;
                patient.DoB = DoB;
                await container.ReplaceItemAsync(patient, Mrn, new PartitionKey(UserId));
            }
            catch (CosmosException ex)
            {
                Console.WriteLine($"Cosmos error updating patient information: {ex.StatusCode} — {ex.Message}");
                throw;
            }
        }

        public async Task<List<Patient>> SearchPatientAsync(string keyword, string userId)
        {
            try
            {
                var query = new QueryDefinition(
                    "SELECT VALUE c FROM c WHERE c.Name LIKE @Name OR c.Mrn LIKE @mrn OR c.DoB LIKE @dob")
                    .WithParameter("@Name", $"%{keyword}%")
                    .WithParameter("@mrn", $"%{keyword}%")
                    .WithParameter("@dob", $"%{keyword}%");

                var requestOptions = new QueryRequestOptions
                {
                    PartitionKey = new PartitionKey(userId)
                };

                var patientList = new List<Patient>();
                using var iterator = container.GetItemQueryIterator<Patient>(query, requestOptions: requestOptions);

                while (iterator.HasMoreResults)
                {
                    var page = await iterator.ReadNextAsync();
                    patientList.AddRange(page);
                }
                return patientList;
            }
            catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                Console.WriteLine("The patient has not been found");
                return new List<Patient>();
            }
            catch (CosmosException ex)
            {
                Console.WriteLine($"Cosmos error while reading patient list: {ex.StatusCode} — {ex.Message}");
                throw;
            }
        }

        public async Task DeletePatientAsync(PatientListDto patientListDto)
        {
            try
            {
                await container.DeleteItemAsync<Patient>(patientListDto.mrn, new PartitionKey(patientListDto.userId));
            }
            catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                Console.WriteLine("The patient list has not been found");
                return;
            }
            catch (CosmosException ex)
            {
                Console.WriteLine($"Cosmos error while deleting patient: {ex.StatusCode} — {ex.Message}");
                throw;
            }
        }

        public async Task<List<Patient>> FindPatientsAsync(string userId)
        {
            try
            {
                var query = new QueryDefinition(
                    "SELECT VALUE c FROM c WHERE c.userId = @userId")
                    .WithParameter("@userId", userId);

                var requestOptions = new QueryRequestOptions
                {
                    PartitionKey = new PartitionKey(userId)
                };

                var userPatients = new List<Patient>();
                using var iterator = container.GetItemQueryIterator<Patient>(query, requestOptions: requestOptions);

                while (iterator.HasMoreResults)
                {
                    var page = await iterator.ReadNextAsync();
                    userPatients.AddRange(page);
                }
                return userPatients;
            }

            catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                Console.WriteLine("The patient list has not been found");
                return new List<Patient>();
            }
            catch (CosmosException ex)
            {
                Console.WriteLine($"Cosmos error while reading patient list: {ex.StatusCode} — {ex.Message}");
                throw;
            }
        }

        public async Task<Patient?> GetPatientByMrn(PatientListDto patientListDto)
        {
            try
            {
                var query = new QueryDefinition(
                        "SELECT VALUE c FROM c WHERE c.Mrn = @mrn")
                        .WithParameter("@mrn", patientListDto.mrn);
                using FeedIterator<Patient> iterator = container.GetItemQueryIterator<Patient>(query, patientListDto.userId);

                if (iterator.HasMoreResults)
                {
                    var response = await iterator.ReadNextAsync();
                    return response.FirstOrDefault();
                }
                return null;
            }

            catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                Console.WriteLine("This user does not exist.");
                return null;
            }
        }

        public async Task DeletePatientByAccountIdAsync(string accountId)
        {
            try
            {
                await container.DeleteAllItemsByPartitionKeyStreamAsync(new PartitionKey(accountId));
            }
            catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                Console.WriteLine("This user does not exist.");
                return;
            }
            catch (CosmosException ex)
            {
                Console.WriteLine($"Cosmos error while deleting user: {ex.StatusCode} — {ex.Message}");
                throw;
            }
        }
    }
}
