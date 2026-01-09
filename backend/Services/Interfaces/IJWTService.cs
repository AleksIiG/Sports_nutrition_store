using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Models;

namespace backend.Services.Interfaces
{
    public interface IJWTService
    {
        public string GenerateAccessToken(User user);
        public string GenerateRefreshToken();
    }
}