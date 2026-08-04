namespace CloudPACS.Backend
{
    using System.Threading.Tasks;
    using Microsoft.Azure.Cosmos;

    public interface IInstanceRepository
    {
        Task UpsertAsync(Instance instance);
        Task AddInstanceAsync(Instance instance);
        Task<bool> IsInstanceExistsAsync(string id, string seriesGuid);
        Task UpdateInstanceAsync(Instance instance, string id, string seriesGuid, string seriesInstanceUid, string studyInstanceUid, string sopInstanceUid);
        Task DeleteInstanceAsync(string id, string seriesGuid);
        Task<List<Instance>> FindInstancesAsync(string studyGuid);
    }
}