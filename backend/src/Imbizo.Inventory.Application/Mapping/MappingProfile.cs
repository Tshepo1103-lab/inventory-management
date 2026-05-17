using AutoMapper;
using Imbizo.Inventory.Application.DTOs;
using Imbizo.Inventory.Domain.Entities;

namespace Imbizo.Inventory.Application.Mapping;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<ApplicationUser, UserDto>();
        CreateMap<Supplier, SupplierDto>()
            .ForMember(d => d.DeliveryCount, o => o.MapFrom(s => s.Deliveries.Count))
            .ForMember(d => d.TotalDeliveredValue, o => o.MapFrom(s => 0m));
        CreateMap<InventoryItem, InventoryItemDto>()
            .ForMember(d => d.SupplierName, o => o.MapFrom(s => s.Supplier.Name))
            .ForMember(d => d.IsLowStock, o => o.MapFrom(s => s.Quantity <= s.MinimumThreshold));
        CreateMap<DeliveryItem, DeliveryItemDto>()
            .ForMember(d => d.ItemName, o => o.MapFrom(i => i.InventoryItem.Name))
            .ForMember(d => d.Sku, o => o.MapFrom(i => i.InventoryItem.Sku));
        CreateMap<Delivery, DeliveryDto>()
            .ForMember(d => d.SupplierName, o => o.MapFrom(d => d.Supplier.Name))
            .ForMember(d => d.ReceivedByName, o => o.MapFrom(d => d.ReceivedByUser.FullName))
            .ForMember(d => d.ApprovedByName, o => o.MapFrom(d => d.ApprovedByUser != null ? d.ApprovedByUser.FullName : null));
        CreateMap<StockMovement, StockMovementDto>()
            .ForMember(d => d.ItemName, o => o.MapFrom(m => m.InventoryItem.Name))
            .ForMember(d => d.PerformedByName, o => o.MapFrom(m => m.PerformedByUser.FullName));
        CreateMap<Notification, NotificationDto>();
    }
}
