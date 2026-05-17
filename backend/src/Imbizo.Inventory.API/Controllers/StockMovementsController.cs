using Imbizo.Inventory.Application.DTOs;
using Imbizo.Inventory.Application.Services;
using Imbizo.Inventory.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Imbizo.Inventory.API.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/[controller]")]
public class StockMovementsController(IStockMovementService service) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] StockMovementType? type = null,
        [FromQuery] Guid? itemId = null,
        CancellationToken ct = default) =>
        Ok(await service.GetAllAsync(page, pageSize, type, itemId, ct));

    [HttpPost]
    [Authorize(Roles = "Admin,StoreManager,KitchenManager,Receiver")]
    public async Task<IActionResult> Create([FromBody] CreateStockMovementRequest request, CancellationToken ct) =>
        Ok(await service.CreateAsync(request, ct));
}
