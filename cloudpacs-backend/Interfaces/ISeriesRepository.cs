


namespace CloudPACS.Backend
{
    using System.Threading.Tasks;
    using Microsoft.Azure.Cosmos;

    public interface ISeriesRepository
    {
        Task<List<Series>> GetSeriesByStudyIdAsync(string studyId);
        Task<Series?> GetSeriesBySeriesIdAsync(string seriesId);
        Task<Series?> DeleteSeriesAsync(string seriesId);
    }
}