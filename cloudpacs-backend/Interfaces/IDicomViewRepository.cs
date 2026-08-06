namespace CloudPACS.Backend
{
    public interface IDicomViewRepository
    {
        Task<Instance?> GetInstanceByIdAsync(string id);
        Task<List<Series>> GetSeriesForStudyAsync(string studyInstanceUid);
        Task<List<Instance>> GetInstancesForSeriesAsync(string studyGuid);
        Task<Instance?> GetInstanceByPartitionKeyAsync(string id, string seriesGuid);
        Task<Instance?> GetInstanceBySopUidAsync(string sopInstanceUid);
        Task<Study?> GetStudyByIdAsync(string studyInstanceUid);
        Task<Study?> GetNextStudyAsync(string patientGuid, string currentStudyId);
    }
}