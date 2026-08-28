namespace CloudPACS.Backend
{
    using System.Threading.Tasks;
    using Microsoft.Azure.Cosmos;

    public interface ISeriesRepository
    {
        Task AddSeriesAsync(Series series);
        Task<bool> IsSeriesExistsAsync(string id, string studyGuid);
        Task UpdateSeriesAsync(Series series, string id, string studyGuid, string userId, string patientId, string patientName);
        Task DeleteSeriesAsync(string id, string studyGuid);
        Task<List<Series>> FindSeriesAsync(string studyGuid);
        Task DeleteSeriesByAccountIdAsync(string accountId);
    }
}