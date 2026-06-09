using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Models;
using backend.Repositories.Interfaces;
using Backend.Data;
using Microsoft.EntityFrameworkCore;


namespace backend.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly ApplicationDbContext _context;
        public UserRepository(ApplicationDbContext context)
        {
            _context = context;
        }
        public async Task CreateUserAsync(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

        }

        public async Task<User?> GetUserByEmailAsync(string email)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        }

        public Task<User?> GetUserByIdAsync(int userId)
        {
            return _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        }

        public async Task<User?> GetUserByRefreshTokenAsync(string refreshToken)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.RefreshToken == refreshToken);
        }

        public async Task<User?> GetUserByUsernameAsync(string username)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
        }

        public async Task UpdateUserAsync(User user)
        {
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == user.Id);
            if (existingUser == null)
            {
                throw new KeyNotFoundException($"User with id {user.Id} not found");
            }
            _context.Entry(existingUser).CurrentValues.SetValues(user);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteUserAsync(int id)
        {
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == id);
            if (existingUser == null)
            {
                throw new KeyNotFoundException($"User with id {id} not found");
            }
            _context.Users.Remove(existingUser);
            await _context.SaveChangesAsync();
        }

        public async Task<ICollection<User>> GetAllUsersAsync(string? username)
        {
            var users = _context.Users.AsQueryable();

            if (!string.IsNullOrWhiteSpace(username))
            {
                users = users.Where(u => u.Username.ToLower().Contains(username.ToLower()));
            }

            return await users.OrderByDescending(u => u.Id).ToListAsync();
        }
    }
}