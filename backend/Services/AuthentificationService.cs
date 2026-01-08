using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs.UserDTOs;
using backend.Models;
using backend.Repositories.Interfaces;
using backend.Services.Interfaces;
using Humanizer;

namespace backend.Services
{
    public class AuthentificationService : IAuthentificationService
    {
        private readonly IUserRepository _userRepository;
        private readonly IJWTService _jwtService;
        public AuthentificationService(IUserRepository userRepository, IJWTService jwtService)
        {
            _userRepository = userRepository;
            _jwtService = jwtService;
        }

        public async Task<List<string>> LoginUserAsync(LoginDTO user)
        {
            var userByEmail = await _userRepository.GetUserByEmailAsync(user.Email);
            if (userByEmail == null)
            {
                throw new KeyNotFoundException("User with this email does not exist");
            }
            if (!BCrypt.Net.BCrypt.Verify(user.Password, userByEmail.PasswordHash))
            {
                throw new UnauthorizedAccessException("Incorrect password");
            }
            userByEmail.RefreshToken = _jwtService.GenerateRefreshToken();
            await _userRepository.UpdateUserAsync(userByEmail);

            return new List<string>
            {
                _jwtService.GenerateAccessToken(userByEmail),
                userByEmail.RefreshToken
            };

        }

        public async Task LogoutUserAsync(string refreshToken)
        {
            var userByRefreshToken = await _userRepository.GetUserByRefreshTokenAsync(refreshToken);
            if (userByRefreshToken == null)
            {
                throw new KeyNotFoundException("User with this refresh token does not exist");
            }
            userByRefreshToken.RefreshToken = string.Empty;
            await _userRepository.UpdateUserAsync(userByRefreshToken);
        }

        public async Task<List<string>> RegisterUserAsync(User user)
        {
            var userByName = await _userRepository.GetUserByUsernameAsync(user.Username);
            if (userByName != null)
            {
                throw new InvalidOperationException("Username is already taken");
            }
            var userByEmail = await _userRepository.GetUserByEmailAsync(user.Email);
            if (userByEmail != null)
            {
                throw new InvalidOperationException("Email is already registered");
            }
            user.RefreshToken = _jwtService.GenerateRefreshToken();

            await _userRepository.CreateUserAsync(user);

            return new List<string>
            {
                _jwtService.GenerateAccessToken(user),
                user.RefreshToken

            };



        }

        public async Task<List<string>> RefreshTokenAsync(string refreshToken)
        {
            var userByRefreshToken = await _userRepository.GetUserByRefreshTokenAsync(refreshToken);
            if (userByRefreshToken == null)
            {
                throw new KeyNotFoundException("User with this refresh token does not exist");
            }
            userByRefreshToken.RefreshToken = _jwtService.GenerateRefreshToken();
            await _userRepository.UpdateUserAsync(userByRefreshToken);

            return new List<string>
            {
                _jwtService.GenerateAccessToken(userByRefreshToken),
                userByRefreshToken.RefreshToken
            };
        }

        public async Task<User> GetUserByIdAsync(string userId)
        {
            var user = await _userRepository.GetUserByIdAsync(userId);
            if (user == null)
            {
                throw new KeyNotFoundException("User with this ID does not exist");
            }
            return user;

        }
    }
}