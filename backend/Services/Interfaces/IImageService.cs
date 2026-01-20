using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Services.Interfaces
{
    public interface IImageService
    {
        public Task ClearDontUsedImagesAsync();
    }
}