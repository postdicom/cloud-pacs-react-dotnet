using Microsoft.Extensions.AI;

namespace CloudPACS.Backend
{
    public class ReportGenerationService
    {
        private readonly HttpClient httpClient;
        private readonly IChatClient chatClient;
        public ReportGenerationService()
        {
            var host = Host.CreateDefaultBuilder()
                .ConfigureServices(services =>
                {
                    services.AddChatClient(
                    new OllamaChatClient(new Uri("http://localhost:11434"), "gemma4:31b"));
                })
                .Build();

            var chatClient = host.Services.GetRequiredService<IChatClient>();
            httpClient = new HttpClient();
        }

        public async Task GetReport(string uri)
        {
            byte[] imageBytes = await httpClient.GetByteArrayAsync(uri);

            var prompt = new ChatMessage(ChatRole.User, "Explain and analyze this image");
            prompt.Contents.Add(new DataContent(imageBytes, "image/png"));

            Console.WriteLine("AI Response:");
            var response = await chatClient.GetResponseAsync(prompt);
            Console.WriteLine($"\nCaption: {response.Messages[0].Text}");
        }
    }
}







