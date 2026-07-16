namespace CloudPACS.Backend
{
    using System.Collections.Generic;
    using System.Threading.Tasks;

    namespace CloudPACS.Backend
    {
        public interface IStudyController
        {
            public Task GetStudiesForPatientAsync();
            public  Task<Study> GetStudyAsync();
        }
    }
}