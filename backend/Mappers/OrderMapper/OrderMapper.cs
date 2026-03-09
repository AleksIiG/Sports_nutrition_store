using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs.OrderDTOs;
using backend.Models;

namespace backend.Mappers.OrderMapper
{
    public static class OrderMapper
    {
        public static OrderDTO ToOrderDTO(this Order order)
        {
            return new OrderDTO
            {
                Id = order.Id,
                CreatedAt = order.CreatedAt,
                TotalPrice = order.TotalPrice,
                Status = order.Status,
                Items = order.OrderItems.Select(i => new OrderItemResponseDTO
                {
                    ProductId = i.ProductId,
                    Quantity = i.Quantity,
                    PriceAtPurchase = i.PriceAtPurchase
                }).ToList(),
                UserId = order.UserId,
                ContactInfo = order.ContactInfo
            };

        }
    }
}