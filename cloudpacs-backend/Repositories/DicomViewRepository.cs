namespace CloudPACS.Backend
{
    using Microsoft.Azure.Cosmos;
    using System.Linq;
    using CloudPACS.Backend;

    public class DicomViewRepository : IDicomViewRepository
    {
        private readonly Container _instanceContainer;
        private readonly Container _seriesContainer;
        private readonly Container _studyContainer;

        public DicomViewRepository(CosmosClient cosmosClient)
        {
            _instanceContainer = cosmosClient.GetContainer("CloudPACS", "Instance");
            _seriesContainer = cosmosClient.GetContainer("CloudPACS", "Series");
            _studyContainer = cosmosClient.GetContainer("CloudPACS", "Study");
        }

        public async Task<Instance?> GetInstanceByIdAsync(string id)
        {
            var queryDef = new QueryDefinition("SELECT * FROM c WHERE c.id = @id")
                .WithParameter("@id", id);

            using var iterator = _instanceContainer.GetItemQueryIterator<Instance>(queryDef);

            while (iterator.HasMoreResults)
            {
                var response = await iterator.ReadNextAsync();
                var match = response.FirstOrDefault();
                if (match != null)
                {
                    return match;
                }
            }
            return null;
        }

        public async Task<List<Series>> GetSeriesForStudyAsync(string studyInstanceUid)
        {
            var query = new QueryDefinition(
                "SELECT * FROM c WHERE c.studyGuid = @studyUid")
                .WithParameter("@studyUid", studyInstanceUid);

            var iterator = _seriesContainer.GetItemQueryIterator<Series>(
                query,
                requestOptions: new QueryRequestOptions { PartitionKey = new PartitionKey(studyInstanceUid) });

            var results = new List<Series>();
            while (iterator.HasMoreResults)
            {
                results.AddRange(await iterator.ReadNextAsync());
            }
            return results;
        }

        public async Task<List<Instance>> GetInstancesForSeriesAsync(string seriesGuid)
        {
            try
            {
                var query = new QueryDefinition(
                    "SELECT VALUE c FROM c WHERE c.seriesGuid = @seriesGuid")
                    .WithParameter("@seriesGuid", seriesGuid);

                var requestOptions = new QueryRequestOptions
                {
                    PartitionKey = new PartitionKey(seriesGuid)
                };

                var instances = new List<Instance>();
                using var iterator = _instanceContainer.GetItemQueryIterator<Instance>(query, requestOptions: requestOptions);

                while (iterator.HasMoreResults)
                {
                    var page = await iterator.ReadNextAsync();
                    instances.AddRange(page);
                }
                return instances;
            }

            catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                Console.WriteLine("The patient list has not been found");
                return new List<Instance>();
            }
            catch (CosmosException ex)
            {
                Console.WriteLine($"Cosmos error while reading instance list: {ex.StatusCode} — {ex.Message}");
                throw;
            }
        }

        public async Task<Instance?> GetInstanceByPartitionKeyAsync(string id, string seriesGuid)
        {
            try
            {
                var response = await _instanceContainer.ReadItemAsync<Instance>(id, new PartitionKey(seriesGuid));
                return response.Resource;
            }
            catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return null;
            }
        }

        public async Task<Instance?> GetInstanceBySopUidAsync(string sopInstanceUid)
        {
            var query = new QueryDefinition("SELECT * FROM c WHERE c.id = @id")
                .WithParameter("@id", sopInstanceUid);

            var iterator = _instanceContainer.GetItemQueryIterator<Instance>(query);

            while (iterator.HasMoreResults)
            {
                var page = await iterator.ReadNextAsync();
                var match = page.FirstOrDefault();
                if (match != null)
                {
                    return match;
                }
            }
            return null;
        }

        public async Task<Study?> GetStudyByIdAsync(string studyInstanceUid)
        {
            var current = await _studyContainer
                .GetItemQueryIterator<Study>(new QueryDefinition("SELECT * FROM c WHERE c.id = @id")
                    .WithParameter("@id", studyInstanceUid))
                .ReadNextAsync();

            return current.FirstOrDefault();
        }

        public async Task<Study?> GetNextStudyAsync(string patientGuid, string currentStudyId)
        {
            var query = new QueryDefinition(
                "SELECT * FROM c WHERE c.patientGuid = @patientGuid AND c.id != @currentId ORDER BY c.studyDate ASC")
                .WithParameter("@patientGuid", patientGuid)
                .WithParameter("@currentId", currentStudyId);

            var iterator = _studyContainer.GetItemQueryIterator<Study>(
                query,
                requestOptions: new QueryRequestOptions { PartitionKey = new PartitionKey(patientGuid) });

            return (await iterator.ReadNextAsync()).FirstOrDefault();
        }
    }
}