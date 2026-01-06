using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs.CategoriesDTOs;
using backend.Models;

namespace backend.Mappers.CategoriesMappers
{
    public static class CategoryMapper
    {
        public static CategoryDTO ToCategoryDTO(this Category category)
        {
            return new CategoryDTO
            {
                Id = category.Id,
                Name = category.Name
            };
        }

        public static Category FromCreateToCategoryDTO(this CreateCategoryDTO createCategoryDto)
        {
            return new Category
            {
                Name = createCategoryDto.Name
            };
        }

        public static Category FromUpdateToCategoryDTO(this UpdateCategoryDTO updateCategoryDto, int id)
        {
            return new Category
            {
                Id = id,
                Name = updateCategoryDto.Name ?? string.Empty
            };
        }
    }
}