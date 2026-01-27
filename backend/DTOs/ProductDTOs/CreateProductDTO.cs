using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace backend.DTOs.ProductDTOs
{
    public class CreateProductDTO
    {
        [Required]
        [MinLength(2, ErrorMessage = "Name must be at least 2 characters long")]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;
        [Required]
        [Range(1, double.MaxValue, ErrorMessage = "Price must be a positive number")]
        public decimal Price { get; set; }
        [MinLength(5, ErrorMessage = "Description must be at least 10 characters long")]
        public string Description { get; set; } = string.Empty;
        [MaxLength(100)]
        [MinLength(3, ErrorMessage = "Manufacturer must be at least 3 characters long")]
        public string Manufacturer { get; set; } = string.Empty;
        [MaxLength(50)]
        [MinLength(5, ErrorMessage = "Volume must be at least 5 characters long")]
        public string Volume { get; set; } = string.Empty;
        public IFormFile? Image { get; set; }
        [Required]
        public int CategoryId { get; set; }
        [Required]
        [Range(1, double.MaxValue, ErrorMessage = "StockQuantity must be a positive number")]
        public int StockQuantity { get; set; }

    }
}