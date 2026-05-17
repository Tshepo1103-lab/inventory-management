using AutoMapper;
using Imbizo.Inventory.Application.Common;
using Imbizo.Inventory.Application.DTOs;
using Imbizo.Inventory.Application.Interfaces;
using Imbizo.Inventory.Domain.Entities;
using Imbizo.Inventory.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Imbizo.Inventory.Application.Services;

public interface IDeliveryService
{
    Task<PagedResult<DeliveryDto>> GetAllAsync(int page, int pageSize, DeliveryStatus? status, CancellationToken ct = default);
    Task<DeliveryDto?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<DeliveryDto> CreateAsync(CreateDeliveryRequest request, CancellationToken ct = default);
    Task<DeliveryDto?> ApproveAsync(Guid id, ApproveDeliveryRequest request, CancellationToken ct = default);
    Task<string?> UploadInvoiceAsync(Guid id, Stream fileStream, string fileName, CancellationToken ct = default);
}

public class DeliveryService(
    IApplicationDbContext db,
    IMapper mapper,
    ICurrentUserService currentUser,
    INotificationService notificationService) : IDeliveryService
{
    public async Task<PagedResult<DeliveryDto>> GetAllAsync(int page, int pageSize, DeliveryStatus? status, CancellationToken ct = default)
    {
        var query = db.Deliveries
            .Include(d => d.Supplier)
            .Include(d => d.ReceivedByUser)
            .Include(d => d.ApprovedByUser)
            .Include(d => d.Items).ThenInclude(i => i.InventoryItem)
            .Where(d => !d.IsDeleted);

        if (status.HasValue)
            query = query.Where(d => d.Status == status.Value);

        var total = await query.CountAsync(ct);
        var deliveries = await query.OrderByDescending(d => d.CreatedAt).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);

        return new PagedResult<DeliveryDto>
        {
            Items = mapper.Map<List<DeliveryDto>>(deliveries),
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<DeliveryDto?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var delivery = await GetDeliveryQuery().FirstOrDefaultAsync(d => d.Id == id && !d.IsDeleted, ct);
        return delivery is null ? null : mapper.Map<DeliveryDto>(delivery);
    }

    public async Task<DeliveryDto> CreateAsync(CreateDeliveryRequest request, CancellationToken ct = default)
    {
        if (!currentUser.UserId.HasValue)
            throw new UnauthorizedAccessException("User not authenticated.");

        var delivery = new Delivery
        {
            ReferenceNumber = request.ReferenceNumber,
            SupplierId = request.SupplierId,
            DeliveryDate = request.DeliveryDate,
            DamagedNotes = request.DamagedNotes,
            ReceiverSignature = request.ReceiverSignature,
            Status = DeliveryStatus.Pending,
            ReceivedByUserId = currentUser.UserId.Value
        };

        foreach (var item in request.Items)
        {
            delivery.Items.Add(new DeliveryItem
            {
                InventoryItemId = item.InventoryItemId,
                QuantityDelivered = item.QuantityDelivered,
                QuantityDamaged = item.QuantityDamaged,
                Notes = item.Notes,
                QuantityApproved = 0,
                IsApproved = false
            });
        }

        db.Deliveries.Add(delivery);
        await db.SaveChangesAsync(ct);

        await notificationService.NotifyManagersAsync(
            NotificationType.PendingApproval,
            "Delivery pending approval",
            $"Delivery {delivery.ReferenceNumber} requires manager approval.",
            $"/deliveries/{delivery.Id}",
            ct);

        var created = await GetDeliveryQuery().FirstAsync(d => d.Id == delivery.Id, ct);
        return mapper.Map<DeliveryDto>(created);
    }

    public async Task<DeliveryDto?> ApproveAsync(Guid id, ApproveDeliveryRequest request, CancellationToken ct = default)
    {
        if (!currentUser.UserId.HasValue)
            throw new UnauthorizedAccessException("User not authenticated.");

        var delivery = await GetDeliveryQuery().FirstOrDefaultAsync(d => d.Id == id && !d.IsDeleted, ct);
        if (delivery is null) return null;

        delivery.Status = request.Status;
        delivery.ManagerNotes = request.ManagerNotes;
        delivery.ApprovedByUserId = currentUser.UserId;
        delivery.ApprovedAt = DateTime.UtcNow;
        delivery.UpdatedAt = DateTime.UtcNow;

        if (request.Items is not null)
        {
            foreach (var approval in request.Items)
            {
                var item = delivery.Items.FirstOrDefault(i => i.Id == approval.DeliveryItemId);
                if (item is null) continue;

                item.QuantityApproved = approval.QuantityApproved;
                item.IsApproved = approval.IsApproved;
                item.UpdatedAt = DateTime.UtcNow;

                if (approval.IsApproved && approval.QuantityApproved > 0 &&
                    (request.Status == DeliveryStatus.Approved || request.Status == DeliveryStatus.PartiallyApproved))
                {
                    var inventory = await db.InventoryItems.FirstAsync(i => i.Id == item.InventoryItemId, ct);
                    var before = inventory.Quantity;
                    inventory.Quantity += approval.QuantityApproved;
                    inventory.DateReceived = DateTime.UtcNow;
                    inventory.UpdatedAt = DateTime.UtcNow;

                    db.StockMovements.Add(new StockMovement
                    {
                        InventoryItemId = inventory.Id,
                        MovementType = StockMovementType.Incoming,
                        Quantity = approval.QuantityApproved,
                        QuantityBefore = before,
                        QuantityAfter = inventory.Quantity,
                        Reference = delivery.ReferenceNumber,
                        Notes = $"Approved delivery {delivery.ReferenceNumber}",
                        DeliveryId = delivery.Id,
                        PerformedByUserId = currentUser.UserId.Value
                    });
                }
            }
        }

        await db.SaveChangesAsync(ct);

        if (request.Status == DeliveryStatus.Rejected)
        {
            await notificationService.NotifyUserAsync(
                delivery.ReceivedByUserId,
                NotificationType.RejectedDelivery,
                "Delivery rejected",
                $"Delivery {delivery.ReferenceNumber} was rejected.",
                $"/deliveries/{delivery.Id}",
                ct);
        }

        return mapper.Map<DeliveryDto>(delivery);
    }

    public Task<string?> UploadInvoiceAsync(Guid id, Stream fileStream, string fileName, CancellationToken ct = default)
    {
        // Handled in API layer with file storage
        return Task.FromResult<string?>(null);
    }

    private IQueryable<Delivery> GetDeliveryQuery() =>
        db.Deliveries
            .Include(d => d.Supplier)
            .Include(d => d.ReceivedByUser)
            .Include(d => d.ApprovedByUser)
            .Include(d => d.Items).ThenInclude(i => i.InventoryItem);
}
