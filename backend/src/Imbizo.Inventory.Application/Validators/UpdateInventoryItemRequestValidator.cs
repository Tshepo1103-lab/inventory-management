using FluentValidation;
using Imbizo.Inventory.Application.DTOs;

namespace Imbizo.Inventory.Application.Validators;

public class UpdateInventoryItemRequestValidator : AbstractValidator<UpdateInventoryItemRequest>
{
    public UpdateInventoryItemRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Sku).NotEmpty().MaximumLength(50);
        RuleFor(x => x.SupplierId).NotEmpty();
    }
}
