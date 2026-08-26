namespace CloudPACS.Backend
{
    using System.Collections.Generic;
    using System.Threading;
    using System.Threading.Tasks;

    public interface IStudyRepository
    {
        Task<List<Study>> GetStudiesByPatientIdAsync(string patientGuid);
        Task<Study?> GetStudyByStudyIdAsync(string studyId);
        Task<Study> CreateStudyAsync(Study study);
        Task<bool> UpdateStudyAsync(string studyId, Study study);
        Task<bool> DeleteStudyAsync(string id);
        Task<List<Study>> SearchStudyAsync(string keyword, string patientGuid);
        Task DeleteStudyByAccountIdAsync(string accountId);
    }
}