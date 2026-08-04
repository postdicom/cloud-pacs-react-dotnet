namespace CloudPACS.Backend.Controllers
{
    using System;
    using System.Threading.Tasks;
    using Microsoft.AspNetCore.Mvc;

    [Route("api/v1")]
    [ApiController]
    public class SeriesController : ControllerBase
    {
        private readonly ISeriesRepository seriesRepository;
        public SeriesController(ISeriesRepository seriesRepository)
        {
            this.seriesRepository = seriesRepository;
        }

        [HttpGet("studies/{id}/series")]
        public async Task<IActionResult?> GetSeries(string id)
        {
            try
            {
                List<Series> seriesList = await seriesRepository.FindSeriesAsync(id);
                return Ok(seriesList);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"DATABASE ERROR: {ex.Message}");
                return null;
            }

        }
    }
}