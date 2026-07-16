namespace CloudPACS.Backend
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Net;
    using System.Threading.Tasks;
    using Microsoft.Azure.Cosmos;
    using CloudPACS.Backend;

    public class StudyRepository : IStudyRepository
    {
        private readonly Container _container;

        public StudyRepository(CosmosClient cosmosClient, string databaseName, string containerName)
        {
            _container = cosmosClient.GetContainer(databaseName, containerName);
        }

        public async Task<List<Study>> GetStudiesByPatientIdAsync(string patientGuid)
        {
            var results = new List<Study>();

            var query = new QueryDefinition("SELECT * FROM c WHERE c.patientGuid = @patientGuid")
                .WithParameter("@patientGuid", patientGuid);

            var requestOptions = new QueryRequestOptions
            {
                PartitionKey = new PartitionKey(patientGuid)
            };

            using var iterator = _container.GetItemQueryIterator<Study>(query, requestOptions: requestOptions);
            while (iterator.HasMoreResults)
            {
                var page = await iterator.ReadNextAsync();
                results.AddRange(page);
            }

            return results;
        }

        public async Task<Study?> GetStudyByStudyIdAsync(string studyId)
        {
            var query = new QueryDefinition("SELECT * FROM c WHERE c.studyId = @studyId")
                .WithParameter("@studyId", studyId);

            using var iterator = _container.GetItemQueryIterator<Study>(query);
            while (iterator.HasMoreResults)
            {
                var page = await iterator.ReadNextAsync();
                var match = page.FirstOrDefault();
                if (match != null)
                    return match;
            }

            return null;
        }

        public async Task<Study> CreateStudyAsync(Study newStudy)
        {
            if (string.IsNullOrWhiteSpace(newStudy.PatientGuid))
                throw new ArgumentException("PatientGuid is required.", nameof(newStudy));

            if (string.IsNullOrWhiteSpace(newStudy.Id))
                newStudy.Id = Guid.NewGuid().ToString();

            var response = await _container.CreateItemAsync(newStudy, new PartitionKey(newStudy.PatientGuid));
            return response.Resource;
        }

        public async Task<bool> UpdateStudyAsync(string id, Study updatedStudy)
        {
            if (string.IsNullOrWhiteSpace(updatedStudy.PatientGuid))
                throw new ArgumentException("PatientGuid (partition key) is required.", nameof(updatedStudy));

            updatedStudy.Id = id;

            try
            {
                await _container.ReplaceItemAsync(updatedStudy, id, new PartitionKey(updatedStudy.PatientGuid));
                return true;
            }
            catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
            {
                return false;
            }
        }

        public async Task<bool> DeleteStudyAsync(string id)
        {
            var existing = await GetStudyByStudyIdAsync(id);
            if (existing == null)
            {
                return false;
            }
            try
            {
                await _container.DeleteItemAsync<Study>(id, new PartitionKey(existing.PatientGuid));
                return true;
            }
            catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
            {
                return false;
            }
        }

        public Task<List<Study>> GetStudiesbyPatientIdAsync(string patientId)
        {
            throw new NotImplementedException();
        }

        public Task<Study> GetStudiesByIdAsync(string studyId)
        {
            throw new NotImplementedException();
        }
    }
}