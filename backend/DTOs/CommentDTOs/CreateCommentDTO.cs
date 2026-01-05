using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace backend.DTOs.CommentDTOs
{
    public class CreateCommentDTO
    {
        [Required]
        [MinLength(5, ErrorMessage = "Content must be at least 5 characters long")]
        [MaxLength(300)]
        public string Content { get; set; } = string.Empty;
        [Required]
        public int ProductId { get; set; }
        [Required]
        public int AuthorId { get; set; }
    }
}