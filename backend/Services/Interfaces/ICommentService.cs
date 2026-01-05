using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Models;

namespace backend.Services.Interfaces
{
    public interface ICommentService
    {
        public Task<IEnumerable<Comment>> GetAllCommentsAsync();
        public Task<Comment> GetCommentByIdAsync(int id);
        public Task<Comment> CreateCommentAsync(Comment comment);
        public Task<Comment> UpdateCommentAsync(Comment comment);
        public Task<Comment> DeleteCommentAsync(int id);
    }
}