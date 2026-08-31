using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;
using CloudPACS.Backend;

public class SettingsDto
{
    [Required]
    public required string AccountName { get; set; }
    [Required]
    public required string UserRole { get; set; }
    [Required]
    public required string UserName { get; set; }
    [Required]
    public required string Email { get; set; }
    [Required]
    public required int UsedStorage { get; set; }
    [Required]
    public required int TotalStorage { get; set; }

    [SetsRequiredMembers]
    public SettingsDto(string AccountName, string UserRole, string UserName, string Email, int UsedStorage, int TotalStorage)
    {
        this.AccountName = AccountName;
        this.UserRole = UserRole;
        this.UserName = UserName;
        this.Email = Email;
        this.UsedStorage = UsedStorage;
        this.TotalStorage = TotalStorage;
    }
}