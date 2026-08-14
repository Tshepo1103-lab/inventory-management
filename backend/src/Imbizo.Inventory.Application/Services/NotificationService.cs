using Imbizo.Inventory.Application.DTOs;
using Imbizo.Inventory.Application.Interfaces;
using Imbizo.Inventory.Domain.Entities;
using Imbizo.Inventory.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Imbizo.Inventory.Application.Services;

public interface INotificationService
{
    Task<IReadOnlyList<NotificationDto>> GetForUserAsync(Guid userId, bool unreadOnly, CancellationToken ct = default);
    Task MarkAsReadAsync(Guid id, CancellationToken ct = default);
    Task NotifyManagersAsync(NotificationType type, string title, string message, string? link, CancellationToken ct = default);
    Task NotifyUserAsync(Guid userId, NotificationType type, string title, string message, string? link, CancellationToken ct = default);
    Task CheckLowStockAsync(CancellationToken ct = default);
}

public class NotificationService(IApplicationDbContext db) : INotificationService
{
    public async Task<IReadOnlyList<NotificationDto>> GetForUserAsync(Guid userId, bool unreadOnly, CancellationToken ct = default)
    {
        var query = db.Notifications.Where(n => n.UserId == userId && !n.IsDeleted);
        if (unreadOnly) query = query.Where(n => !n.IsRead);

        return await query
            .OrderByDescending(n => n.CreatedAt)
            .Take(50)
            .Select(n => new NotificationDto
            {
                Id = n.Id,
                Type = n.Type,
                Title = n.Title,
                Message = n.Message,
                IsRead = n.IsRead,
                Link = n.Link,
                CreatedAt = n.CreatedAt
            })
            .ToListAsync(ct);
    }

    public async Task MarkAsReadAsync(Guid id, CancellationToken ct = default)
    {
        var notification = await db.Notifications.FirstOrDefaultAsync(n => n.Id == id, ct);
        if (notification is null) return;
        notification.IsRead = true;
        notification.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
    }

    public async Task NotifyManagersAsync(NotificationType type, string title, string message, string? link, CancellationToken ct = default)
    {
        var managers = await db.Users
            .Where(u => u.IsActive && (u.Role == UserRole.Admin || u.Role == UserRole.StoreManager))
            .ToListAsync(ct);

        foreach (var manager in managers)
        {
            db.Notifications.Add(new Notification
            {
                UserId = manager.Id,
                Type = type,
                Title = title,
                Message = message,
                Link = link
            });
        }

        await db.SaveChangesAsync(ct);
    }

    public async Task NotifyUserAsync(Guid userId, NotificationType type, string title, string message, string? link, CancellationToken ct = default)
    {
        db.Notifications.Add(new Notification
        {
            UserId = userId,
            Type = type,
            Title = title,
            Message = message,
            Link = link
        });
        await db.SaveChangesAsync(ct);
    }

    public async Task CheckLowStockAsync(CancellationToken ct = default)
    {
        var lowStockItems = await db.InventoryItems
            .Where(i => !i.IsDeleted && i.IsActive && i.Quantity <= i.MinimumThreshold)
            .ToListAsync(ct);

        var managers = await db.Users
            .Where(u => u.IsActive && (u.Role == UserRole.Admin || u.Role == UserRole.StoreManager || u.Role == UserRole.KitchenManager))
            .ToListAsync(ct);

        foreach (var item in lowStockItems)
        {
            foreach (var manager in managers)
            {
                var exists = await db.Notifications.AnyAsync(n =>
                    n.UserId == manager.Id &&
                    n.Type == NotificationType.LowStock &&
                    n.Message.Contains(item.Sku) &&
                    !n.IsRead &&
                    n.CreatedAt > DateTime.UtcNow.AddDays(-1), ct);

                if (exists) continue;

                db.Notifications.Add(new Notification
                {
                    UserId = manager.Id,
                    Type = NotificationType.LowStock,
                    Title = "Low stock alert",
                    Message = $"{item.Name} ({item.Sku}) is below minimum threshold.",
                    Link = $"/inventory/{item.Id}"
                });
            }
        }

        await db.SaveChangesAsync(ct);
    }
}
