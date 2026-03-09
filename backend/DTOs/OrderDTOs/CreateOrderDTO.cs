using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace backend.DTOs.OrderDTOs
{
    public class CreateOrderDTO
    {
        public List<CreateOrderItemDTO> OrderItems { get; set; } = new List<CreateOrderItemDTO>();
        [Required]
        public string ContactInfo { get; set; } = string.Empty;
    }
}