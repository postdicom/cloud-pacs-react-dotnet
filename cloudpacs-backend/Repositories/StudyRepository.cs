namespace CloudPACS.Backend
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Net;
    using System.Threading;
    using System.Threading.Tasks;
    using Microsoft.Azure.Cosmos;
    using CloudPACS.Backend;

    public class StudyRepository : IStudyRepository
    {
        private readonly Container _container;

        public StudyRepository(CosmosClient cosmosClient)
        {
            _container = cosmosClient.GetContainer("CloudPACS", "Study");
        }

        public async Task<List<Study>> GetStudiesByPatientIdAsync(string patientGuid)
        {
            var results = new List<Study>();

            var query = new QueryDefinition("SELECT VALUE c FROM c WHERE c.patientGuid = @patientGuid")
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
            var query = new QueryDefinition("SELECT * FROM c WHERE c.id = @id")
                .WithParameter("@id", studyId);

            using var iterator = _container.GetItemQueryIterator<Study>(query);            
            while (iterator.HasMoreResults)
            {
                var page = await iterator.ReadNextAsync();
                var match = page.FirstOrDefault();
                if (match != null) return match;
            }

            return null;
        }

        public async Task<Study> CreateStudyAsync(Study study)
        {
            if (string.IsNullOrWhiteSpace(study.patientGuid))
            {
                throw new ArgumentException("PatientGuid is required.", nameof(study));
            }

            if (string.IsNullOrWhiteSpace(study.Id))
            {
                study.Id = Guid.NewGuid().ToString();
            }

            var response = await _container.CreateItemAsync(study, new PartitionKey(study.patientGuid));
            return response.Resource;
        }

        public async Task<bool> UpdateStudyAsync(string studyId, Study study)
        {
            if (string.IsNullOrWhiteSpace(study.patientGuid))
            {
                throw new ArgumentException("PatientGuid (partition key) is required.", nameof(study));
            }
            study.Id = studyId;
            try
            {
                await _container.ReplaceItemAsync(study, studyId, new PartitionKey(study.patientGuid));
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
                await _container.DeleteItemAsync<Study>(id, new PartitionKey(existing.patientGuid));
                return true;
            }
            catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
            {
                return false;
            }
        }
    }
}