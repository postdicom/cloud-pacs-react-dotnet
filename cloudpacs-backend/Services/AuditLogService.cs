using Microsoft.Azure.Cosmos;

namespace CloudPACS.Backend
{
    public class AuditLogService
    {
        private readonly Container container;
        private readonly IHttpContextAccessor httpContextAccessor;
        public AuditLogService(CosmosClient client, IHttpContextAccessor httpContextAccessor)
        {
            container = client.GetContainer("CloudPACS", "AuditLog");
            this.httpContextAccessor = httpContextAccessor;
        }

        public async Task LogAsync(string userId, AuditActions action, ResourceType resourceType, string resourceId)
        {
            try
            {
                var ipAddress = GetClientIpAddress();
                var entry = new AuditLogEntry
                {
                    UserId = userId,
                    Action = action,
                    ResourceType = resourceType,
                    ResourceId = resourceId,
                    Timestamp = DateTimeOffset.UtcNow,
                    IpAddress = ipAddress
                };
                await container.CreateItemAsync(entry, new PartitionKey(entry.UserId));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"DATABASE ERROR: {ex.Message}");
            }

        }

        private string? GetClientIpAddress()
        {
            try
            {
                var context = httpContextAccessor.HttpContext;
                if (context == null) return null;

                if (context.Request.Headers.TryGetValue("X-Forwarded-For", out var forwardedFor))
                {
                    var ip = forwardedFor.ToString().Split(',')[0].Trim();
                    if (!string.IsNullOrEmpty(ip)) return ip;
                }

                return context.Connection.RemoteIpAddress?.ToString();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"DATABASE ERROR: {ex.Message}");
                return null;
            }

        }
    }
}