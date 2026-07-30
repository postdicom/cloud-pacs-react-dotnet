namespace CloudPACS.Backend
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Net;
    using System.Threading.Tasks;
    using Microsoft.Azure.Cosmos;
    using CloudPACS.Backend;

    public class SeriesRepository : ISeriesRepository
    {
        private readonly Container container;

        public SeriesRepository(CosmosClient cosmosClient, string databaseName, string containerName)
        {
            container = cosmosClient.GetContainer(databaseName, containerName);
        }

        public async Task<List<Series>> GetSeriesByStudyIdAsync(string studyId)
        {
            var results = new List<Series>();

            var query = new QueryDefinition("SELECT * FROM c WHERE c.studyId = @studyId")
                .WithParameter("@studyId", studyId);

            var requestOptions = new QueryRequestOptions
            {
                PartitionKey = new PartitionKey(studyId)
            };

            using var iterator = container.GetItemQueryIterator<Series>(query, requestOptions: requestOptions);
            while (iterator.HasMoreResults)
            {
                var page = await iterator.ReadNextAsync();
                results.AddRange(page);
            }

            return results;
        }

        public async Task GetSeriesBySeriesIdAsync(string seriesId)
        {
            var query = new QueryDefinition("SELECT * FROM c WHERE c.seriesId = @seriesId")
                .WithParameter("@seriesId", seriesId);

            using var iterator = container.GetItemQueryIterator<Series>(query);
            while (iterator.HasMoreResults)
            {
                var page = await iterator.ReadNextAsync();
                var match = page.FirstOrDefault();
                if (match != null)
                    await container.DeleteItemAsync<Series>(seriesId, PartitionKey(patientListDto.userId));
            }

            return null;
        }

        public async Task<Series?> DeleteSeriesAsync(string seriesId)
        {
            var query = new QueryDefinition("SELECT * FROM c WHERE c.seriesId = @seriesId")
                .WithParameter("@seriesId", seriesId);

            using var iterator = container.GetItemQueryIterator<Series>(query);
            while (iterator.HasMoreResults)
            {
                var page = await iterator.ReadNextAsync();
                var match = page.FirstOrDefault();
                if (match != null)
                    return match;
            }

            return null;
        }

        
    }
}