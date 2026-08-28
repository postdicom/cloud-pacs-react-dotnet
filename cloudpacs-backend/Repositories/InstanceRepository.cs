namespace CloudPACS.Backend
{
    using System.Threading.Tasks;
    using Microsoft.Azure.Cosmos;

    public class InstanceRepository : IInstanceRepository
    {
        private readonly Container _instanceContainer;

        public InstanceRepository(CosmosClient cosmosClient)
        {
            _instanceContainer = cosmosClient.GetContainer("CloudPACS", "Instance");
        }

        public async Task UpsertAsync(Instance instance)
        {
            await _instanceContainer.UpsertItemAsync(
                instance,
                new PartitionKey(instance.seriesGuid)
            );
        }

        public async Task AddInstanceAsync(Instance instance)
        {
            try
            {
                bool exists = await IsInstanceExistsAsync(instance.Id, instance.seriesGuid);
                if (exists)
                {
                    throw new InvalidOperationException($"There is already a series '{instance.Id}' under this user");
                }

                await _instanceContainer.CreateItemAsync(instance, new PartitionKey(instance.seriesGuid));
            }
            catch (CosmosException ex)
            {
                Console.WriteLine($"Cosmos error adding instance: {ex.StatusCode} — {ex.Message}");
                throw;
            }
        }

        public async Task<bool> IsInstanceExistsAsync(string id, string seriesGuid)
        {
            try
            {
                var query = new QueryDefinition(
                    "SELECT VALUE 1 FROM c WHERE c.id = @id AND c.seriesGuid = @seriesGuid")
                    .WithParameter("@id", id)
                    .WithParameter("@seriesGuid", seriesGuid);

                using FeedIterator<int> iterator = _instanceContainer.GetItemQueryIterator<int>(
                    query,
                    requestOptions: new QueryRequestOptions { PartitionKey = new PartitionKey(seriesGuid) });

                if (iterator.HasMoreResults)
                {
                    FeedResponse<int> response = await iterator.ReadNextAsync();
                    return response.FirstOrDefault() > 0;
                }

                return false;
            }
            catch (CosmosException ex)
            {
                Console.WriteLine($"Cosmos error while checking the existence of the instance: {ex.StatusCode} — {ex.Message}");
                throw;
            }
        }

        public async Task UpdateInstanceAsync(Instance instance, string id, string seriesGuid, string seriesInstanceUid, string studyInstanceUid, string sopInstanceUid)
        {
            try
            {
                instance.Id = id;
                instance.seriesGuid = seriesGuid;
                instance.SeriesInstanceUid = seriesInstanceUid;
                instance.StudyInstanceUid = studyInstanceUid;
                instance.SopInstanceUid = sopInstanceUid;
                await _instanceContainer.ReplaceItemAsync(instance, id, new PartitionKey(seriesGuid));
            }
            catch (CosmosException ex)
            {
                Console.WriteLine($"Cosmos error updating instance information: {ex.StatusCode} — {ex.Message}");
                throw;
            }
        }

        public async Task DeleteInstanceAsync(string accountId)
        {
            try
            {
                ResponseMessage response = await _instanceContainer.DeleteAllItemsByPartitionKeyStreamAsync(new PartitionKey(accountId));
            }
            catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                Console.WriteLine("The instance has not been found");
                return;
            }
            catch (CosmosException ex)
            {
                Console.WriteLine($"Cosmos error while deleting instance: {ex.StatusCode} — {ex.Message}");
                throw;
            }
        }

        public async Task<List<Instance>> FindInstancesAsync(string studyGuid)
        {
            try
            {
                var query = new QueryDefinition(
                    "SELECT VALUE c FROM c WHERE c.studyGuid = @studyGuid")
                    .WithParameter("@studyGuid", studyGuid);

                var requestOptions = new QueryRequestOptions
                {
                    PartitionKey = new PartitionKey(studyGuid)
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
    }
}