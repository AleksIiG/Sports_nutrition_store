using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs.ProductDTOs;
using backend.Helpers;
using backend.Mappers.ProductMappers;
using backend.Models;
using backend.Services.Interfaces;
using Backend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/products")]
    public class ProductController : ControllerBase
    {
        private readonly IProductService _productService;

        public ProductController(IProductService productService)
        {
            _productService = productService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] QueryObjectForProducts query)
        {
            var products = await _productService.GetProductsAsync(query);
            return Ok(products.Select(p => p.ToProductDto()));
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromForm] CreateProductDTO createProductDTO)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var imageUrl = string.Empty;

            if(createProductDTO.Image != null)
            {
                var uploadsFolder = Path.Combine("wwwroot", "images", "products");
                Directory.CreateDirectory(uploadsFolder);

                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(createProductDTO.Image.FileName)}";
                var filePath = Path.Combine(uploadsFolder, fileName);

                using var stream = new FileStream(filePath, FileMode.Create);
                await createProductDTO.Image.CopyToAsync(stream);

                imageUrl = $"/images/products/{fileName}";
            }

            var product = createProductDTO.FromCreateToProductDto();
            product.ImageUrl = imageUrl;
            try
            {
                var model = await _productService.CreateProductAsync(product);
                return CreatedAtAction(nameof(GetById), new { id = model.Id }, model.ToProductDto());
            }

            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"An error occurred while creating the product.\n {ex.Message}" });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var product = await _productService.GetByIdAsync(id);
                return Ok(product.ToProductDto());
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"An error occurred while retrieving the product.\n {ex.Message}" });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var deletedProduct = await _productService.DeleteProductAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"An error occurred while deleting the product.\n {ex.Message}" });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromForm] UpdateProductDTO updateProductDTO)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var imageUrl = string.Empty;

            if(updateProductDTO.Image != null)
            {
                var uploadsFolder = Path.Combine("wwwroot", "images", "products");
                Directory.CreateDirectory(uploadsFolder);

                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(updateProductDTO.Image.FileName)}";
                var filePath = Path.Combine(uploadsFolder, fileName);

                using var stream = new FileStream(filePath, FileMode.Create);
                await updateProductDTO.Image.CopyToAsync(stream);
                imageUrl = $"/images/products/{fileName}";
                
            }

            var product = updateProductDTO.FromUpdateToProductDto(id);
            if (!string.IsNullOrEmpty(imageUrl))
            {
                product.ImageUrl = imageUrl;
            }

            try
            {
                var updatedProduct = await _productService.UpdateProductAsync(product);
                return Ok(updatedProduct.ToProductDto());
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
                return StatusCode(500, new { message = $"An error occurred while updating the product.\n {ex.Message}" });
            }
        }


    }
}


/* TAsk
DONE ---------------------Write a category controller and service in the same style as the product controller and service.
DONE ---------------------Write a authentication controller and service in the same style as the product controller and service.

Think about buying process and implement order controller 
and service in the same style as the product controller and service.

Finish all controller and fill the missing parts in the controllers and services.


*/
