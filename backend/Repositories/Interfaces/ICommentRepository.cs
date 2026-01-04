using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Models;

namespace backend.Repositories.Interfaces
{
    public interface ICommentRepository
    {
        public Task<IEnumerable<Comment>> GetAllCommentsAsync();
        public Task<Comment?> GetCommentByIdAsync(int id);
        public Task CreateCommentAsync(Comment comment);
        public Task UpdateCommentAsync(Comment comment);
        public Task DeleteCommentAsync(Comment comment);
    }
}