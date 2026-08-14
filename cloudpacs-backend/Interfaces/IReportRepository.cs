namespace CloudPACS.Backend.Interfaces
{
    using System.Threading;
    using System.Threading.Tasks;

    public interface IReportRepository
    {
        Task<List<Report>> GetReportsByStudyIdAsync(string studyId);
        Task<Report> GetReportByReportId(string id);
        Task<Report> CreateReportAsync(Report report);
        Task<Report> UpdateReportAsync(Report report);
    }
}