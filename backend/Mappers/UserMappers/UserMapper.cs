using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs.UserDTOs;
using backend.Models;

namespace backend.Mappers.UserMappers
{
    public static class UserMapper
    {
        public static User FromRegisterToUserDTO(this RegisterDTO user)
        {
            return new User
            {
                Username = user.Username,
                Email = user.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(user.Password),
                Role = "User"
            };
        }

        public static User FromLoginToUserDTO(this LoginDTO user)
        {
            return new User
            {
                Email = user.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(user.Password)
            };
        }

        public static UserDTO ToUserDTO(this User user)
        {
            return new UserDTO
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role
            };
        }
    }
}

