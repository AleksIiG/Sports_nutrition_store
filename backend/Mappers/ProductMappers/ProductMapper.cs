using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs.ProductDTOs;
using backend.Mappers.CommentMappers;
using backend.Models;

namespace backend.Mappers.ProductMappers
{
    public static class ProductMapper
    {
        public static ProductDTO ToProductDto(this Product product)
        {
            return new ProductDTO
            {
                Id = product.Id,
                Name = product.Name,
                Price = product.Price,
                Description = product.Description,
                Manufacturer = product.Manufacturer,
                Volume = product.Volume,
                ImageUrl = product.ImageUrl,
                CategoryId = product.CategoryId,
                StockQuantity = product.StockQuantity,
                Comments = product.Comments.Select(c => c.ToCommentDto()).ToList()
            };
        }


        public static Product FromUpdateToProductDto(this UpdateProductDTO dto, int id)
        {
            return new Product
            {
                Id = id,
                Name = dto.Name,
                Price = dto.Price,
                Description = dto.Description,
                Manufacturer = dto.Manufacturer,
                Volume = dto.Volume,
                ImageUrl = dto.ImageUrl,
                CategoryId = dto.CategoryId,
                StockQuantity = dto.StockQuantity
            };
        }

        public static Product FromCreateToProductDto(this CreateProductDTO dto)
        {
            return new Product
            {
                Name = dto.Name,
                Price = dto.Price,
                Description = dto.Description,
                Manufacturer = dto.Manufacturer,
                Volume = dto.Volume,
                CategoryId = dto.CategoryId,
                StockQuantity = dto.StockQuantity
            };
        }

    }
}