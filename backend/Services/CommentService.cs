using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Models;
using backend.Repositories.Interfaces;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Http.HttpResults;

namespace backend.Services
{
    public class CommentService : ICommentService
    {
        private readonly ICommentRepository _commentRepository;
        public CommentService(ICommentRepository commentRepository)
        {
            _commentRepository = commentRepository;
        }
        public async Task<Comment> CreateCommentAsync(Comment comment)
        {
            var existingComment = await _commentRepository.GetCommentByIdAsync(comment.Id);
            if (existingComment != null)
            {
                throw new InvalidOperationException("Comment with the same id already exists.");
            }
            await _commentRepository.CreateCommentAsync(comment);
            return comment;
        }

        public async Task<Comment> DeleteCommentAsync(int id)
        {
            var comment = await _commentRepository.GetCommentByIdAsync(id);
            if (comment == null)
            {
                throw new KeyNotFoundException($"Comment with id {id} not found");
            }
            await _commentRepository.DeleteCommentAsync(comment);
            return comment;
        }

        public async Task<IEnumerable<Comment>> GetAllCommentsAsync()
        {
            var model = await _commentRepository.GetAllCommentsAsync();
            if (model == null)
            {
                throw new("Comments not found");
            }
            return model;
        }

        public async Task<Comment> GetCommentByIdAsync(int id)
        {
            var model = await _commentRepository.GetCommentByIdAsync(id);
            if (model == null)
            {
                throw new KeyNotFoundException($"Comment with id {id} not found");
            }
            return model;
        }

        public async Task<Comment> UpdateCommentAsync(Comment comment)
        {
            var existingComment = await _commentRepository.GetCommentByIdAsync(comment.Id);
            if (existingComment == null)
            {
                throw new KeyNotFoundException("Comment not found.");
            }

            existingComment.Content = comment.Content;

            await _commentRepository.UpdateCommentAsync(existingComment);
            return existingComment;
        }
    }
}