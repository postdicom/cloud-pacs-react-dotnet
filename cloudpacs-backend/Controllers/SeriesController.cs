namespace CloudPACS.Backend.Controllers
{
    using System.Threading.Tasks;
    using Microsoft.AspNetCore.Mvc;

    [ApiController]
    public class SeriesController : ControllerBase
    {
        private readonly ISeriesRepository seriesRepository;

        public SeriesController(ISeriesRepository seriesRepository)
        {
            this.seriesRepository = seriesRepository;
        }

        [HttpGet]
        [Route("api/studies/{studyId}/series")]
        public async Task<ActionResult<List<Series>>> GetSeriesInStudy(string studyId)
        {
            var series = await seriesRepository.GetSeriesByStudyIdAsync(studyId);
            return Ok(series);
        }

        [HttpGet]
        [Route("/api/v1/series/{seriesId}")]
        public async Task<ActionResult<List<Series>>> GetSeries(string studyId)
        {
            var series = await seriesRepository.GetSeriesByStudyIdAsync(studyId);
            return Ok(series);
        }

        [HttpDelete]
        [Route("/api/v1/series/{seriesId}")]
        public async Task<ActionResult<List<Series>>> DeleteSeries(string seriesId)
        {
            await seriesRepository.DeleteSeriesAsync(seriesId);
            return Ok();
        }

        [HttpPost]
        [Route("/api/v1/series/{seriesId}")]
        public async Task<ActionResult<List<Series>>> GetSeries(string studyId)
        {
            var series = await seriesRepository.GetSeriesByStudyIdAsync(studyId);
            return Ok(series);
        }
    }
}