using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Models;
using backend.Repositories.Interfaces;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Http.HttpResults;

namespace backend.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly ICategoryRepository _categoryRepository;
        public CategoryService(ICategoryRepository categoryRepository)
        {
            _categoryRepository = categoryRepository;
        }

        public async Task<Category> CreateCategoryAsync(Category category)
        {
            var existingCategory = await _categoryRepository.GetCategoryByNameAsync(category.Name);
            if (existingCategory != null)
            {
                throw new InvalidOperationException("Category with the same name already exists.");
            }
            return await _categoryRepository.CreateCategoryAsync(category);
        }

        public async Task<Category> DeleteCategoryAsync(int id)
        {
            var existingCategory = await _categoryRepository.GetCategoryByIdAsync(id);
            if (existingCategory == null)
            {
                throw new KeyNotFoundException($"Category with id {id} not found");
            }
            await _categoryRepository.DeleteCategoryAsync(id);
            return existingCategory;
        }

        public async Task<IEnumerable<Category>> GetAllCategoriesAsync()
        {
            return await _categoryRepository.GetAllCategoriesAsync();
        }

        public async Task<Category> GetCategoryByIdAsync(int id)
        {
            var model = await _categoryRepository.GetCategoryByIdAsync(id);
            if (model == null)
            {
                throw new KeyNotFoundException($"Category with id {id} not found");
            }
            return model;
        }

        public async Task<Category> UpdateCategoryAsync(Category category)
        {
            var existingCategory = await _categoryRepository.GetCategoryByIdAsync(category.Id);
            if (existingCategory == null)
            {
                throw new KeyNotFoundException($"Category with id {category.Id} not found");
            }

            var existingCategoryByName = await _categoryRepository.GetCategoryByNameAsync(category.Name);
            if (existingCategoryByName != null && existingCategoryByName.Id != category.Id)
            {
                throw new InvalidOperationException("Another category with the same name already exists.");
            }

            var result = await _categoryRepository.UpdateCategoryAsync(category);
            return result!;
        }
    }
}