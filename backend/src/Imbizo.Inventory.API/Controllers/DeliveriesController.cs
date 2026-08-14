using FluentValidation;
using Imbizo.Inventory.Application.DTOs;
using Imbizo.Inventory.Application.Services;
using Imbizo.Inventory.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Imbizo.Inventory.API.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/[controller]")]
public class DeliveriesController(
    IDeliveryService service,
    IValidator<CreateDeliveryRequest> createValidator,
    IWebHostEnvironment env) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] DeliveryStatus? status = null, CancellationToken ct = default) =>
        Ok(await service.GetAllAsync(page, pageSize, status, ct));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var delivery = await service.GetByIdAsync(id, ct);
        return delivery is null ? NotFound() : Ok(delivery);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,StoreManager,Receiver")]
    public async Task<IActionResult> Create([FromBody] CreateDeliveryRequest request, CancellationToken ct)
    {
        await createValidator.ValidateAndThrowAsync(request, ct);
        var created = await service.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPost("{id:guid}/approve")]
    [Authorize(Roles = "Admin,StoreManager")]
    public async Task<IActionResult> Approve(Guid id, [FromBody] ApproveDeliveryRequest request, CancellationToken ct)
    {
        var result = await service.ApproveAsync(id, request, ct);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost("{id:guid}/invoice")]
    [Authorize(Roles = "Admin,StoreManager,Receiver")]
    public async Task<IActionResult> UploadInvoice(Guid id, IFormFile file, CancellationToken ct)
    {
        if (file.Length == 0) return BadRequest(new { error = "File is required." });

        var uploadsPath = Path.Combine(env.ContentRootPath, "uploads", "invoices");
        Directory.CreateDirectory(uploadsPath);
        var fileName = $"{id}_{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        var filePath = Path.Combine(uploadsPath, fileName);

        await using var stream = System.IO.File.Create(filePath);
        await file.CopyToAsync(stream, ct);

        var relativePath = $"/uploads/invoices/{fileName}";
        await service.AttachInvoiceAsync(id, relativePath, ct);
        return Ok(new { path = relativePath });
    }
}
