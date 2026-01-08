using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Models;

namespace backend.Repositories.Interfaces
{
    public interface IUserRepository
    {
        public Task CreateUserAsync(User user);
        public Task<User?> GetUserByUsernameAsync(string username);
        public Task<User?> GetUserByEmailAsync(string email);
        public Task UpdateUserAsync(User user);
        public Task<User?> GetUserByRefreshTokenAsync(string refreshToken);
        public Task<User?> GetUserByIdAsync(string userId);

    }
}