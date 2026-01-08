using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs.UserDTOs;
using backend.Models;

namespace backend.Services.Interfaces
{
    public interface IAuthentificationService
    {
        public Task<List<string>> RegisterUserAsync(User user);
        public Task<List<string>> LoginUserAsync(LoginDTO user);
        public Task LogoutUserAsync(string refreshToken);
        public Task<List<string>> RefreshTokenAsync(string refreshToken);
        public Task<User> GetUserByIdAsync(string userId);
    }
}