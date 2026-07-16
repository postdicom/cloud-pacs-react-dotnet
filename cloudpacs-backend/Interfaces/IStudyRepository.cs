namespace CloudPACS.Backend
{
    using System.Collections.Generic;
    using System.Threading.Tasks;

    namespace CloudPACS.Backend
    {
        public interface IStudyRepository
        {
            Task<List<Study>> GetStudiesByPatientIdAsync(string patientId);
            Task<Study> GetStudiesByIdAsync(string studyId);
            Task<Study> CreateStudyAsync(Study study);
            Task<bool> UpdateStudyAsync(string studyId, Study study);
            Task<Study?> GetStudyByStudyIdAsync(string id);
            Task<bool> DeleteStudyAsync(string id);
        }
    }
}