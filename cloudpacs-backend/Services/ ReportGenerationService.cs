using System.Drawing;
using Microsoft.Extensions.AI;

namespace CloudPACS.Backend
{
    public class ReportGenerationService
    {
        private readonly IChatClient? chatClient;
        private readonly HttpClient httpClient;
        private ChatMessage? prompt;
        public ReportGenerationService()
        {
            var host = Host.CreateDefaultBuilder()
                .ConfigureServices(services =>
                {
                    services.AddChatClient(
                    new OllamaChatClient(new Uri("http://localhost:11434"), "gemma4:31b"));
                })
                .Build();

            chatClient = host.Services.GetRequiredService<IChatClient>();
            httpClient = new();
        }

        public async Task SetPrompt(byte[] byteArray)
        {
            prompt = new ChatMessage(ChatRole.User, "Say hi");
            prompt.Contents.Add(new DataContent(byteArray, "image/png"));
        }

        public async IAsyncEnumerable<string> GetReport()
        {
            await foreach (var response in chatClient.GetStreamingResponseAsync(prompt))
            {
                yield return response.Text;
            }
            yield return "The response is done";
        }
    }
}