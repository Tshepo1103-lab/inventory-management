using FluentValidation;
using Imbizo.Inventory.Application.Mapping;
using Imbizo.Inventory.Application.Services;
using Imbizo.Inventory.Application.Validators;
using Microsoft.Extensions.DependencyInjection;

namespace Imbizo.Inventory.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddAutoMapper(typeof(MappingProfile));
        services.AddValidatorsFromAssemblyContaining<LoginRequestValidator>();

        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IInventoryService, InventoryService>();
        services.AddScoped<ISupplierService, SupplierService>();
        services.AddScoped<IDeliveryService, DeliveryService>();
        services.AddScoped<IStockMovementService, StockMovementService>();
        services.AddScoped<IDashboardService, DashboardService>();
        services.AddScoped<INotificationService, NotificationService>();
        services.AddScoped<IReportService, ReportService>();

        return services;
    }
}
