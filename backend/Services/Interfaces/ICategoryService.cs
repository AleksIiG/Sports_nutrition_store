using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Models;

namespace backend.Services.Interfaces
{
    public interface ICategoryService
    {
        public Task<IEnumerable<Category>> GetAllCategoriesAsync();
        public Task<Category> GetCategoryByIdAsync(int id);
        public Task<Category> CreateCategoryAsync(Category category);
        public Task<Category> UpdateCategoryAsync(Category category);
        public Task<Category> DeleteCategoryAsync(int id);
    }
}