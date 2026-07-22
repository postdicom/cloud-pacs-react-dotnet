namespace CloudPACS.Backend
{
    using System;
    using System.Collections.Generic;
    using System.Threading.Tasks;
    using CloudPACS.Backend;

    public class StudyService
    {
        private readonly IStudyRepository _studyRepository;

        public StudyService(IStudyRepository studyRepository)
        {
            _studyRepository = studyRepository;
        }

        public async Task<List<Study>> GetStudiesByPatientIdAsync(string patientGuid)
        {
            if (string.IsNullOrWhiteSpace(patientGuid))
                throw new ArgumentException("Patient ID cannot be or empty.");

            return await _studyRepository.GetStudiesByPatientIdAsync(patientGuid);
        }

        public async Task<Study?> GetStudyByStudyIdAsync(string studyId)
        {
            if (string.IsNullOrWhiteSpace(studyId))
                throw new ArgumentException("Study ID cannot be empty.");

            return await _studyRepository.GetStudyByStudyIdAsync(studyId);
        }
    }
}