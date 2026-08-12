namespace CloudPACS.Backend
{
    using System.Collections.Generic;
    using System.Threading;
    using System.Threading.Tasks;

    public interface IStudyRepository
    {
        Task<List<Study>> GetStudiesByPatientIdAsync(string patientGuid, CancellationToken cancellationToken = default);
        Task<Study?> GetStudyByStudyIdAsync(string studyId, CancellationToken cancellationToken = default);
        Task<Study> CreateStudyAsync(Study study, CancellationToken cancellationToken = default);
        Task<bool> UpdateStudyAsync(string studyId, Study study, CancellationToken cancellationToken = default);
        Task<bool> DeleteStudyAsync(string id, CancellationToken cancellationToken = default);
    }
}