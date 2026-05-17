using Imbizo.Inventory.Domain.Enums;

namespace Imbizo.Inventory.Application.DTOs;

public record LoginRequest(string Email, string Password);

public record LoginResponse(
    string Token,
    Guid UserId,
    string Email,
    string FullName,
    UserRole Role,
    DateTime ExpiresAt);

public record UserDto(Guid Id, string Email, string FullName, UserRole Role, bool IsActive);
