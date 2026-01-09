using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using backend.Helpers;

namespace backend.DTOs.OrderDTOs
{
    public class ChangeStatusDTO
    {
        [Required]
        [EnumDataType(typeof(OrderStatus), ErrorMessage = "Invalid status value. Try(0 - Pending, 1 - Paid, 2 - Cancelled)")]
        public OrderStatus Status { get; set; }
    }
}