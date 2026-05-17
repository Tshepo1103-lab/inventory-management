using Imbizo.Inventory.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Imbizo.Inventory.API.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/[controller]")]
public class DashboardController(IDashboardService service) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct) => Ok(await service.GetDashboardAsync(ct));
}
