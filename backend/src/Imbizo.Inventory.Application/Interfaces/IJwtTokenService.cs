using Imbizo.Inventory.Domain.Entities;

namespace Imbizo.Inventory.Application.Interfaces;

public interface IJwtTokenService
{
    string GenerateToken(ApplicationUser user);
}
