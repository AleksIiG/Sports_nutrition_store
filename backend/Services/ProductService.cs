using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Helpers;
using backend.Models;
using backend.Repositories.Interfaces;
using backend.Services.Interfaces;

namespace backend.Services
{
    public class ProductService : IProductService
    {
        private readonly IProductRepository _productRepository;
        private readonly IImageService _imageService;
        public ProductService(IProductRepository productRepository, IImageService imageService)
        {
            _productRepository = productRepository;
            _imageService = imageService;
        }
        public async Task<Product> CreateProductAsync(Product product)
        {
            var existingProduct = await _productRepository.GetByNameAsync(product.Name);
            if (existingProduct != null)
            {
                throw new InvalidOperationException("Product with the same name already exists.");
            }
            await _productRepository.CreateProductAsync(product);
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
            await _imageService.ClearDontUsedImagesAsync();
            return productModel;
        }

        public async Task<Product> GetByIdAsync(int id)
        {
            var product = await _productRepository.GetByIdAsync(id);
            if (product == null)
            {
                throw new KeyNotFoundException("Product not found.");
            }
            return product;
        }

        public async Task<IEnumerable<Product>> GetProductsAsync(QueryObjectForProducts query)
        {
            var products = await _productRepository.GetAllProductsAsync(query);
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
            return product;
        }
    }
}