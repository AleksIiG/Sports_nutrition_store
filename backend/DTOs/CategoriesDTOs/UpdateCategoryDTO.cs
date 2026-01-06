using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace backend.DTOs.CategoriesDTOs
{
    public class UpdateCategoryDTO
    {
        [Required]
        [MinLength(2, ErrorMessage = "Name must be at least 2 characters long")]
        public string? Name { get; set; }
    }
}