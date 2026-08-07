using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
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

        public async Task LogAsync(string userId, string userName, AuditActions action, ResourceType resourceType, string resourceId, string studyDetail)
        {
            try
            {
                var ipAddress = GetClientIpAddress();
                var entry = new AuditLogEntry
                {
                    userId = userId,
                    userName = userName,
                    Action = action,
                    ResourceType = resourceType,
                    ResourceId = resourceId,
                    Timestamp = DateTimeOffset.UtcNow,
                    IpAddress = ipAddress,
                    StudyDetail = studyDetail
                };
                await container.CreateItemAsync(entry, new PartitionKey(entry.userId));
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

        public async Task<List<AuditLogEntry>> GetAuditLogRecordsForUserAsync(string userId)
        {
            try
            {
                var query = new QueryDefinition(
                        "SELECT VALUE c FROM c WHERE c.userId = @userId")
                        .WithParameter("@userId", userId);

                var requestOptions = new QueryRequestOptions
                {
                    PartitionKey = new PartitionKey(userId)
                };

                var recordList = new List<AuditLogEntry>();
                using var iterator = container.GetItemQueryIterator<AuditLogEntry>(query, requestOptions: requestOptions);

                while (iterator.HasMoreResults)
                {
                    var page = await iterator.ReadNextAsync();
                    recordList.AddRange(page);
                }
                return recordList;
            }

            catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                Console.WriteLine("Auditlog entries have not been found");
                return new List<AuditLogEntry>();
            }
            catch (CosmosException ex)
            {
                Console.WriteLine($"Cosmos error while reading the audit log: {ex.StatusCode} — {ex.Message}");
                throw;
            }
        }
    }
}