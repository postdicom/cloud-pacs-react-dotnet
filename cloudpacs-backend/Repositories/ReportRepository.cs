namespace CloudPACS.Backend.Repositories
{
    using System;
    using System.Linq;
    using System.Net;
    using System.Threading;
    using System.Threading.Tasks;
    using Microsoft.Azure.Cosmos;
    using global::CloudPACS.Backend.Interfaces;

    public class ReportRepository : IReportRepository
    {
        private readonly Container _container;

        public ReportRepository(CosmosClient client)
        {
            _container = client.GetContainer("CloudPACS", "Report");
        }

        public async Task<List<Report>> GetReportsByStudyIdAsync(string studyId, CancellationToken cancellationToken = default)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(studyId))
                {
                    throw new Exception($"StudyId cannot be null or whitespace: {nameof(studyId)}");
                }

                var query = new QueryDefinition("SELECT VALUE c FROM c WHERE c.studyId = @studyId")
                    .WithParameter("@studyId", studyId);

                var requestOptions = new QueryRequestOptions
                {
                    PartitionKey = new PartitionKey(studyId)
                };

                var reportList = new List<Report>();
                using var iterator = _container.GetItemQueryIterator<Report>(query, requestOptions: requestOptions);

                while (iterator.HasMoreResults)
                {
                    var page = await iterator.ReadNextAsync();
                    reportList.AddRange(page);
                }
                return reportList;
            }
            catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                Console.WriteLine("Study's reports have not been found");
                return new List<Report>();
            }
            catch (CosmosException ex)
            {
                Console.WriteLine($"Cosmos error while reading report list: {ex.StatusCode} — {ex.Message}");
                throw;
            }
        }

        public async Task<Report> GetReportByReportId(string id, CancellationToken cancellationToken = default)
        {
            var query = new QueryDefinition("SELECT * FROM c WHERE c.id = @id")
                .WithParameter("@id", id);

            using var iterator = _container.GetItemQueryIterator<Report>(query);            
            while (iterator.HasMoreResults)
            {
                var page = await iterator.ReadNextAsync(cancellationToken);
                var match = page.FirstOrDefault();
                if (match != null) return match;
            }

            return null;
        }

        public async Task<Report> CreateReportAsync(Report report, CancellationToken cancellationToken = default)
        {
            if (report == null)
            {
                throw new ArgumentNullException("Report cannot be null.");
            }
            if (string.IsNullOrWhiteSpace(report.studyId))
            {
                throw new ArgumentException("StudyId is required for partitioning.");
            }
            if (report.CreatedAtUtc == default)
            {
                report.CreatedAtUtc = DateTime.UtcNow;
            }

            var response = await _container.CreateItemAsync(report, new PartitionKey(report.studyId));
            return response.Resource;
        }

        public async Task<Report> UpdateReportAsync(Report report, CancellationToken cancellationToken = default)
        {
            if (report == null)
            {
                throw new ArgumentNullException(nameof(report));
            }

            if (string.IsNullOrWhiteSpace(report.studyId))
            {
                throw new ArgumentException("StudyId is required for partitioning.");
            }

            report.UpdatedAtUtc = DateTime.UtcNow;

            var response = await _container.UpsertItemAsync(report, new PartitionKey(report.studyId));
            return response.Resource;
        }
    }
}