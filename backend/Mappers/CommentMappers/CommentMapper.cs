using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs.CommentDTOs;
using backend.Models;

namespace backend.Mappers.CommentMappers
{
    public static class CommentMapper
    {
        public static CommentDTO ToCommentDto(this Comment comment)
        {
            return new CommentDTO
            {
                Id = comment.Id,
                Content = comment.Content,
                UserId = comment.UserId,
                CreatedAt = comment.CreatedAt,
                ProductId = comment.ProductId
            };
        }

        public static Comment FromUpdateToCommentDto(this UpdateCommentDTO dto, int id)
        {
            return new Comment
            {
                Id = id,
                Content = dto.Content
            };
        }

        public static Comment FromCreateToCommentDto(this CreateCommentDTO dto, int userID)
        {
            return new Comment
            {
                Content = dto.Content,
                ProductId = dto.ProductId,
                UserId = userID
            };
        }

    }
}