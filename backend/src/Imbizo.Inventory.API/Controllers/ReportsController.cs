using Imbizo.Inventory.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Imbizo.Inventory.API.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/[controller]")]
public class ReportsController(IReportService service) : ControllerBase
{
    [HttpGet("inventory")]
    public async Task<IActionResult> Inventory(CancellationToken ct) => Ok(await service.GetInventoryReportAsync(ct));

    [HttpGet("low-stock")]
    public async Task<IActionResult> LowStock(CancellationToken ct) => Ok(await service.GetLowStockReportAsync(ct));

    [HttpGet("valuation")]
    public async Task<IActionResult> Valuation(CancellationToken ct) => Ok(await service.GetValuationReportAsync(ct));

    [HttpGet("deliveries")]
    [Authorize(Roles = "Admin,StoreManager,Auditor")]
    public async Task<IActionResult> Deliveries([FromQuery] DateTime? from, [FromQuery] DateTime? to, CancellationToken ct) =>
        Ok(await service.GetDeliveryHistoryReportAsync(from, to, ct));

    [HttpGet("wastage")]
    public async Task<IActionResult> Wastage(CancellationToken ct) => Ok(await service.GetWastageReportAsync(ct));
}
