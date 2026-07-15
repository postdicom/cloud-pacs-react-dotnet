namespace CloudPACS.Backend
{
    using System.Threading.Tasks;
    using Microsoft.Azure.Cosmos;

    public interface IPatientRepository
    {
        Task AddPatientAsync(Patient patient);
        Task<bool> IsPatientExistsAsync(string mrn, string userId);
        Task UpdatePatientAsync(Patient patient, string Mrn, string UserId, string Name, DateOnly DoB); 
        Task<List<FeedResponse<Patient>>> SearchPatientAsync(string mnr, string userId);
        Task DeletePatientAsync(string mrn, string userId);
        Task<List<FeedResponse<Patient>>> FindPatientsAsync(string userId);
        Task<Patient> getPatientByMrn(string mrn);
    }
}