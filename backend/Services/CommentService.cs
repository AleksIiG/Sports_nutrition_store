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
        public Task<Comment> CreateCommentAsync(Comment comment)
        {
            throw new NotImplementedException();
        }

        public Task<Comment> DeleteCommentAsync(Comment comment)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<Comment>> GetAllCommentsAsync()
        {
            var model = _commentRepository.GetAllCommentsAsync();
            if (model == null)
            {
                throw new("Comments not found");
            }
            return model;
        }

        public Task<Comment?> GetCommentByIdAsync(int id)
        {
            throw new NotImplementedException();
        }

        public Task<Comment> UpdateCommentAsync(Comment comment)
        {
            throw new NotImplementedException();
        }
    }
}