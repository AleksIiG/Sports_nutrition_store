using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Helpers;
using backend.Models;
using backend.Repositories.Interfaces;
using backend.Services.Cache;
using backend.Services.Interfaces;

namespace backend.Services
{
    public class ProductService : IProductService
    {
        private readonly IProductRepository _productRepository;
        private readonly IImageService _imageService;
        private readonly ICacheService _cacheService;
        public ProductService(IProductRepository productRepository, IImageService imageService, ICacheService cacheService)
        {
            _productRepository = productRepository;
            _imageService = imageService;
            _cacheService = cacheService;
        }
        public async Task<Product> CreateProductAsync(Product product)
        {
            var existingProduct = await _productRepository.GetByNameAsync(product.Name);
            if (existingProduct != null)
            {
                throw new InvalidOperationException("Product with the same name already exists.");
            }
            await _productRepository.CreateProductAsync(product);
            await _cacheService.RemoveByPrefixAsync("products");
            return product;
        }

        public async Task<Product> DeleteProductAsync(int id)
        {
            var productModel = await _productRepository.GetByIdAsync(id);
            if (productModel == null)
            {
                throw new KeyNotFoundException("Product not found.");
            }
            await _productRepository.DeleteProductAsync(productModel);
            await _cacheService.RemoveAsync($"product:{id}");
            await _cacheService.RemoveByPrefixAsync("products");
            await _imageService.ClearDontUsedImagesAsync();
            return productModel;
        }

        public async Task<Product> GetByIdAsync(int id)
        {
            var cacheKey = $"product:{id}";
            var cachedProduct = await _cacheService.GetAsync<Product>(cacheKey);
            if (cachedProduct != null)
                return cachedProduct;

            
            var product = await _productRepository.GetByIdAsync(id);
            if (product == null)
            {
                throw new KeyNotFoundException("Product not found.");
            }
            await _cacheService.SetAsync(cacheKey, product, TimeSpan.FromMinutes(10));
            return product;
        }

        public async Task<IEnumerable<Product>> GetProductsAsync(QueryObjectForProducts query)
        {
            var cacheKey = $"products:{query.Name}:{query.Category}";
            var cachedProducts = await _cacheService.GetAsync<IEnumerable<Product>>(cacheKey);
            if (cachedProducts != null)
                return cachedProducts;
            
            var products = await _productRepository.GetAllProductsAsync(query);
            await _cacheService.SetAsync(cacheKey, products, TimeSpan.FromMinutes(10));
            
            return products;
        }

        public async Task<Product> UpdateProductAsync(Product product)
        {
            var existingProduct = await _productRepository.GetByIdAsync(product.Id);
            if (existingProduct == null)
            {
                throw new KeyNotFoundException("Product not found.");
            }
            var existingProductByName = await _productRepository.GetByNameAsync(product.Name);
            if (existingProductByName != null && existingProductByName.Id != product.Id)
            {
                throw new InvalidOperationException("Another product with the same name already exists.");
            }
            await _productRepository.UpdateProductAsync(product);
            await _imageService.ClearDontUsedImagesAsync();
            await _cacheService.RemoveByPrefixAsync("products");
            await _cacheService.RemoveAsync($"product:{product.Id}");
            return product;
        }
    }
}