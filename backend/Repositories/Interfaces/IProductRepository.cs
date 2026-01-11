using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Helpers;
using backend.Models;

namespace backend.Repositories.Interfaces
{
    public interface IProductRepository
    {
        public Task<IEnumerable<Product>> GetAllProductsAsync(QueryObjectForProducts query);
        public Task<Product?> GetByIdAsync(int id);
        public Task CreateProductAsync(Product product);
        public Task UpdateProductAsync(Product product);
        public Task DeleteProductAsync(Product product);
        public Task<Product?> GetByNameAsync(string name);
    }
}