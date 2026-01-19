using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using backend.DTOs.OrderDTOs;
using backend.Helpers;
using backend.Mappers.OrderMapper;
using backend.Services.Interfaces;
using Backend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ActionConstraints;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Sprache;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/orders")]
    public class OrderController : ControllerBase
    {
        private readonly IOrderService _orderService;
        public OrderController(IOrderService orderService)
        {
            _orderService = orderService;
        }
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] CreateOrderDTO createOrderDTO)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            try
            {
                var result = await _orderService.CreateOrderAsync(userId, createOrderDTO);
                return CreatedAtAction(nameof(GetById), new { id = result.Id }, result.ToOrderDTO());
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"An error occurred while creating an order.\n {ex.Message}" });
            }

        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetById([FromRoute] int id)
        {
            try
            {
                var order = await _orderService.GetOrderByIdASync(id);
                return Ok(order.ToOrderDTO());
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"An error occurred while searching an order.\n {ex.Message}" });
            }
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll([FromQuery] QueryObjectForProducts query)
        {
            try
            {
                var orders = await _orderService.GetAllOrdersAsync();
                return Ok(orders.Select(o => o.ToOrderDTO()));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"An error occurred while searching an orders.\n {ex.Message}" });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete([FromRoute] int id)
        {
            try
            {
                await _orderService.DeleteOrderAsync(id);
                return NoContent();
            }

            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"An error occurred while deleating an orders.\n {ex.Message}" });
            }
        }

        [HttpPatch("change-status/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ChangeStatus([FromRoute] int id, [FromBody] ChangeStatusDTO statusDTO)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var order = await _orderService.ChangeStatusAsync(id, statusDTO.Status);
                return Ok(order.ToOrderDTO());
            }

            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"An error occurred while changing status of orders.\n {ex.Message}" });
            }
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Update([FromRoute] int id, [FromBody] UpdateOrderDTO updateOrderDTO)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
            {
                return Unauthorized();
            }

            try
            {
                var result = await _orderService.UpdateOrderAsync(int.Parse(userId), id, updateOrderDTO);
                return Ok(result.ToOrderDTO());
            }

            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"An error occurred while Updating an orders.\n {ex.Message}" });
            }

        }
        [HttpGet("my-orders")]
        [Authorize]
        public async Task<IActionResult> GetMyOrders()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
            {
                return Unauthorized();
            }

            try
            {
                var orders = await _orderService.GetOrdersByUserIdAsync(int.Parse(userId));
                return Ok(orders.Select(o => o.ToOrderDTO()));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"An error occurred while retrieving your orders.\n {ex.Message}" });
            }
        }
    }

}