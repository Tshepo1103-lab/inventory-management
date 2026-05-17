using FluentValidation;
using Imbizo.Inventory.Application.DTOs;
using Imbizo.Inventory.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Imbizo.Inventory.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class AuthController(IAuthService authService, IValidator<LoginRequest> validator) : ControllerBase
{
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request, CancellationToken ct)
    {
        await validator.ValidateAndThrowAsync(request, ct);
        var result = await authService.LoginAsync(request, ct);
        if (result is null) return Unauthorized(new { error = "Invalid email or password." });
        return Ok(result);
    }

    [HttpGet("users")]
    [Authorize(Roles = "Admin,StoreManager")]
    public async Task<ActionResult<IReadOnlyList<UserDto>>> GetUsers(CancellationToken ct) =>
        Ok(await authService.GetUsersAsync(ct));
}
