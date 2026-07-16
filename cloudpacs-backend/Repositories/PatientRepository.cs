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
                bool exists = await IsPatientExistsAsync(patient.Mrn, patient.UserId);
                if (exists)
                {
                    throw new InvalidOperationException($"There is already a patient '{patient.Name}' under this user");
                }

                await container.CreateItemAsync(patient, new PartitionKey(patient.Mrn));
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
                    "SELECT VALUE FROM c WHERE c.Mrn = @mrn AND c.userId = @userId")
                    .WithParameter("@mrn", mrn)
                    .WithParameter("@accountId", userId);

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

        public async Task UpdatePatientAsync(Patient patient, string Mrn, string UserId, string Name, DateOnly DoB)
        {
            try
            {
                patient.Mrn = Mrn;
                patient.UserId = UserId;
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

        public async Task<List<FeedResponse<Patient>>> SearchPatientAsync(string search, string userId)
        {
            try
            {
                var query = new QueryDefinition(
                    "SELECT VALUE c FROM c WHERE c.UserId = @userId OR c.Mrn = @mrn OR c.DoB = @dob")
                    .WithParameter("@userId", search)
                    .WithParameter("@mrn", search)
                    .WithParameter("@userId", search);

                using FeedIterator<Patient> iterator = container.GetItemQueryIterator<Patient>(query);

                List<FeedResponse<Patient>> patientList = new List<FeedResponse<Patient>>();
                while (iterator.HasMoreResults)
                {
                    FeedResponse<Patient> response = await iterator.ReadNextAsync();
                    patientList.Add(response);
                }
                return patientList;
            }
            catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                Console.WriteLine("The patient has not been found");
                return null;
            }
            catch (CosmosException ex)
            {
                Console.WriteLine($"Cosmos error while reading patient: {ex.StatusCode} — {ex.Message}");
                throw;
            }
        }

        public async Task DeletePatientAsync(PatientListDto patientListDto)
        {
            try
            {
                await container.DeleteItemAsync<User>(patientListDto.mrn, new PartitionKey(patientListDto.userId));
            }
            catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                Console.WriteLine("This patient does not exist.");
                return;
            }
            catch (CosmosException ex)
            {
                Console.WriteLine($"Cosmos error while deleting patient: {ex.StatusCode} — {ex.Message}");
                throw;
            }
        }

        public async Task<List<FeedResponse<Patient>>> FindPatientsAsync(string userId)
        {
            try
            {
                var query = new QueryDefinition(
                    "SELECT VALUE c FROM c WHERE c.UserId = @userId")
                    .WithParameter("@userId", userId);

                using FeedIterator<Patient> iterator = container.GetItemQueryIterator<Patient>(query);

                List<FeedResponse<Patient>> patientList = new List<FeedResponse<Patient>>();
                while (iterator.HasMoreResults)
                {
                    FeedResponse<Patient> response = await iterator.ReadNextAsync();
                    patientList.Add(response);
                }
                return patientList;
            }

            catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                Console.WriteLine("This patient does not exist.");
                return null;
            }
        }

        public async Task<Patient> GetPatientByMrn(PatientListDto patientListDto)
        {
            try
            {
                var query = new QueryDefinition(
                        "SELECT VALUE (1) c FROM c WHERE c.Mrn = @mrn")
                        .WithParameter("@mrn", patientListDto.mrn);
                using FeedIterator<Patient> iterator = container.GetItemQueryIterator<Patient>(query);

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
    }
}
