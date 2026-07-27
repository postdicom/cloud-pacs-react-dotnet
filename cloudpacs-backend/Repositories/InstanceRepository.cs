namespace CloudPACS.Backend
{
    using System.Threading.Tasks;
    using Microsoft.Azure.Cosmos;

    public class InstanceRepository
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
                new PartitionKey(instance.patientId)
            );
        }
    }
}