using Imbizo.Inventory.Application.Interfaces;
using Imbizo.Inventory.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Imbizo.Inventory.API.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/[controller]")]
public class NotificationsController(INotificationService service, ICurrentUserService currentUser) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] bool unreadOnly = false, CancellationToken ct = default)
    {
        if (!currentUser.UserId.HasValue) return Unauthorized();
        return Ok(await service.GetForUserAsync(currentUser.UserId.Value, unreadOnly, ct));
    }

    [HttpPost("{id:guid}/read")]
    public async Task<IActionResult> MarkRead(Guid id, CancellationToken ct)
    {
        await service.MarkAsReadAsync(id, ct);
        return NoContent();
    }
}
