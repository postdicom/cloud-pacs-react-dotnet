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

        public async Task<Report> GetReportsByStudyIdAsync(string studyId, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(studyId))
            {
                throw new Exception($"StudyId cannot be null or whitespace: {nameof(studyId)}");
            }

            var query = new QueryDefinition("SELECT TOP 1 * FROM c WHERE c.studyId = @studyId")
                .WithParameter("@studyId", studyId);

            var requestOptions = new QueryRequestOptions { PartitionKey = new PartitionKey(studyId) };
            using var iterator = _container.GetItemQueryIterator<Report>(query, requestOptions: requestOptions);

            if (iterator.HasMoreResults)
            {
                var response = await iterator.ReadNextAsync();
                return response.FirstOrDefault();
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