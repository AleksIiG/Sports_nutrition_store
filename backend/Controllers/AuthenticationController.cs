using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using backend.DTOs.UserDTOs;
using backend.Mappers.UserMappers;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthenticationController : ControllerBase
    {
        private readonly IAuthentificationService _authService;
        public AuthenticationController(IAuthentificationService authService)
        {
            _authService = authService;
        }
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDTO registerDTO)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var model = registerDTO.FromRegisterToUserDTO();
                var result = await _authService.RegisterUserAsync(model);
                return Ok(new
                {
                    AccessToken = result[0],
                    RefreshToken = result[1]
                });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"An error occurred while registering the user.\n {ex.Message}" });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO loginDTO)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var result = await _authService.LoginUserAsync(loginDTO);
                return Ok(new
                {
                    AccessToken = result[0],
                    RefreshToken = result[1]
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"An error occurred while logging in the user.\n {ex.Message}" });
            }
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout([FromBody] LogoutDTO logoutDTO)
        {
            if (string.IsNullOrEmpty(logoutDTO.RefreshToken))
            {
                return BadRequest(new { message = "Refresh token is required" });
            }
            try
            {
                await _authService.LogoutUserAsync(logoutDTO.RefreshToken);
                return Ok(new { message = "User logged out successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"An error occurred while logging out the user.\n {ex.Message}" });
            }
        }

        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenDTO refreshTokenDTO)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var result = await _authService.RefreshTokenAsync(refreshTokenDTO.RefreshToken);
                return Ok(new
                {
                    AccessToken = result[0],
                    RefreshToken = result[1]
                });
            }

            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"An error occurred while refreshing the token.\n {ex.Message}" });
            }
        }
        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
            {
                return Unauthorized(new { message = "User ID claim not found" });
            }

            try
            {
                var user = await _authService.GetUserByIdAsync(Convert.ToInt32(userId));
                return Ok(user.ToUserDTO());
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"An error occurred while retrieving the user.\n {ex.Message}" });
            }
        }

        [HttpPost("promote/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ChangeRoleToAdmin([FromRoute] int id)
        {
            try
            {
                var model = await _authService.ChangeRoleToAdmin(id);
                return Ok(model.ToUserDTO());
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"An error occurred while promoting the user.\n {ex.Message}" });
            }
        }


    }
}