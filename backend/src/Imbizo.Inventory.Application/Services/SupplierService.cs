using AutoMapper;
using Imbizo.Inventory.Application.Common;
using Imbizo.Inventory.Application.DTOs;
using Imbizo.Inventory.Application.Interfaces;
using Imbizo.Inventory.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Imbizo.Inventory.Application.Services;

public interface ISupplierService
{
    Task<PagedResult<SupplierDto>> GetAllAsync(int page, int pageSize, string? search, CancellationToken ct = default);
    Task<SupplierDto?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<SupplierDto> CreateAsync(CreateSupplierRequest request, CancellationToken ct = default);
    Task<SupplierDto?> UpdateAsync(Guid id, UpdateSupplierRequest request, CancellationToken ct = default);
}

public class SupplierService(IApplicationDbContext db, IMapper mapper) : ISupplierService
{
    public async Task<PagedResult<SupplierDto>> GetAllAsync(int page, int pageSize, string? search, CancellationToken ct = default)
    {
        var query = db.Suppliers.Include(s => s.Deliveries).Where(s => !s.IsDeleted);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.ToLower();
            query = query.Where(s => s.Name.ToLower().Contains(term) || s.ContactPerson.ToLower().Contains(term));
        }

        var total = await query.CountAsync(ct);
        var suppliers = await query.OrderBy(s => s.Name).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);

        var dtos = suppliers.Select(s => new SupplierDto(
            s.Id, s.Name, s.Phone, s.Email, s.Address, s.ContactPerson, s.IsActive,
            s.Deliveries.Count,
            s.Deliveries.Where(d => d.Status == Domain.Enums.DeliveryStatus.Approved).Count() * 1000m)).ToList();

        return new PagedResult<SupplierDto> { Items = dtos, TotalCount = total, Page = page, PageSize = pageSize };
    }

    public async Task<SupplierDto?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var s = await db.Suppliers.Include(x => x.Deliveries).FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted, ct);
        if (s is null) return null;
        return new SupplierDto(s.Id, s.Name, s.Phone, s.Email, s.Address, s.ContactPerson, s.IsActive, s.Deliveries.Count, 0);
    }

    public async Task<SupplierDto> CreateAsync(CreateSupplierRequest request, CancellationToken ct = default)
    {
        var supplier = new Supplier
        {
            Name = request.Name,
            Phone = request.Phone,
            Email = request.Email,
            Address = request.Address,
            ContactPerson = request.ContactPerson
        };
        db.Suppliers.Add(supplier);
        await db.SaveChangesAsync(ct);
        return new SupplierDto(supplier.Id, supplier.Name, supplier.Phone, supplier.Email, supplier.Address, supplier.ContactPerson, supplier.IsActive, 0, 0);
    }

    public async Task<SupplierDto?> UpdateAsync(Guid id, UpdateSupplierRequest request, CancellationToken ct = default)
    {
        var supplier = await db.Suppliers.FirstOrDefaultAsync(s => s.Id == id && !s.IsDeleted, ct);
        if (supplier is null) return null;

        supplier.Name = request.Name;
        supplier.Phone = request.Phone;
        supplier.Email = request.Email;
        supplier.Address = request.Address;
        supplier.ContactPerson = request.ContactPerson;
        supplier.IsActive = request.IsActive;
        supplier.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);

        return new SupplierDto(supplier.Id, supplier.Name, supplier.Phone, supplier.Email, supplier.Address, supplier.ContactPerson, supplier.IsActive, 0, 0);
    }
}
