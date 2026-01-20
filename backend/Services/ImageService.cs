using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using backend.Repositories.Interfaces;
using backend.Services.Interfaces;
using Backend.Data;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class ImageService : IImageService
    {
        private readonly ApplicationDbContext _context;
        public ImageService(ApplicationDbContext context)
        {
            _context = context;
        }
        public async Task ClearDontUsedImagesAsync()
        {
            var imagePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "products");
            if( !Directory.Exists(imagePath))
            {
                return;
            }
            var files = Directory.GetFiles(imagePath);
            var products = await _context.Products.ToListAsync();
            var userImages = products
                .Where(p => !string.IsNullOrEmpty(p.ImageUrl))
                .Select(p => Path.GetFileName(p.ImageUrl))
                .ToHashSet(StringComparer.OrdinalIgnoreCase);

            foreach (var file in files)
            {
                var fileName = Path.GetFileName(file);
                if (!userImages.Contains(fileName))
                {
                    try
                    {
                        File.Delete(file);
                    }
                    catch (Exception ex)
                    {
                        System.Console.WriteLine(ex.Message);
                    }
                }
            }
        }
    }
}