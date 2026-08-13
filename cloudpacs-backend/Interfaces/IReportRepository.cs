namespace CloudPACS.Backend.Interfaces
{
    using System.Threading;
    using System.Threading.Tasks;

    public interface IReportRepository
    {
        Task<List<Report>> GetReportsByStudyIdAsync(string studyId, CancellationToken cancellationToken = default);
        Task<Report> GetReportByReportId(string id, CancellationToken cancellationToken = default);
        Task<Report> CreateReportAsync(Report report, CancellationToken cancellationToken = default);
        Task<Report> UpdateReportAsync(Report report, CancellationToken cancellationToken = default);
    }
}