namespace CloudPACS.Backend
{
    using System;
    using System.Linq;
    using System.Threading.Tasks;
    using Microsoft.Azure.Cosmos;
    public class SeriesRepository : ISeriesRepository
    {
        private readonly Container container;

        public SeriesRepository(CosmosClient client)
        {
            container = client.GetContainer("CloudPACS", "Series");
        }

        public async Task AddSeriesAsync(Series series)
        {
            try
            {
                bool exists = await IsSeriesExistsAsync(series.Id, series.studyGuid);
                if (exists)
                {
                    throw new InvalidOperationException($"There is already a series '{series.SeriesId}' under this user");
                }

                await container.CreateItemAsync(series, new PartitionKey(series.studyGuid));
            }
            catch (CosmosException ex)
            {
                Console.WriteLine($"Cosmos error adding series: {ex.StatusCode} — {ex.Message}");
                throw;
            }
        }

        public async Task<bool> IsSeriesExistsAsync(string id, string studyGuid)
        {
            try
            {
                var query = new QueryDefinition(
                    "SELECT VALUE 1 FROM c WHERE c.id = @id AND c.studyGuid = @studyGuid")
                    .WithParameter("@id", id)
                    .WithParameter("@studyGuid", studyGuid);

                using FeedIterator<int> iterator = container.GetItemQueryIterator<int>(
                    query,
                    requestOptions: new QueryRequestOptions { PartitionKey = new PartitionKey(studyGuid) });

                if (iterator.HasMoreResults)
                {
                    FeedResponse<int> response = await iterator.ReadNextAsync();
                    return response.FirstOrDefault() > 0;
                }

                return false;
            }
            catch (CosmosException ex)
            {
                Console.WriteLine($"Cosmos error while checking the existence of the series: {ex.StatusCode} — {ex.Message}");
                throw;
            }
        }

        public async Task UpdateSeriesAsync(Series series, string id, string studyGuid, string userId, string patientId, string patientName)
        {
            try
            {
                series.Id = id;
                series.studyGuid = studyGuid;
                series.UserId = userId;
                series.PatientId = patientId;
                series.PatientName = patientName;
                await container.ReplaceItemAsync(series, id, new PartitionKey(studyGuid));
            }
            catch (CosmosException ex)
            {
                Console.WriteLine($"Cosmos error updating series information: {ex.StatusCode} — {ex.Message}");
                throw;
            }
        }

        public async Task DeleteSeriesAsync(string id, string studyGuid)
        {
            try
            {
                await container.DeleteItemAsync<Series>(id, new PartitionKey(studyGuid));
            }
            catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                Console.WriteLine("The series has not been found");
                return;
            }
            catch (CosmosException ex)
            {
                Console.WriteLine($"Cosmos error while deleting series: {ex.StatusCode} — {ex.Message}");
                throw;
            }
        }

        public async Task<List<Series>> FindSeriesAsync(string studyGuid)
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

                var studySeries = new List<Series>();
                using var iterator = container.GetItemQueryIterator<Series>(query, requestOptions: requestOptions);

                while (iterator.HasMoreResults)
                {
                    var page = await iterator.ReadNextAsync();
                    studySeries.AddRange(page);
                }
                return studySeries;
            }

            catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                Console.WriteLine("The patient list has not been found");
                return new List<Series>();
            }
            catch (CosmosException ex)
            {
                Console.WriteLine($"Cosmos error while reading series list: {ex.StatusCode} — {ex.Message}");
                throw;
            }
        }
    }
}
