using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Models;

namespace backend.Services.Interfaces
{
    public interface IProductService
    {
        public Task<IEnumerable<Product>> GetProductsAsync();
        public Task<Product> GetByIdAsync(int id);
        public Task<Product> CreateProductAsync(Product product);
        public Task<Product> UpdateProductAsync(Product product);
        public Task<Product> DeleteProductAsync(int id);
    }
}