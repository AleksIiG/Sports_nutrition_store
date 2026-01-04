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
    }
}