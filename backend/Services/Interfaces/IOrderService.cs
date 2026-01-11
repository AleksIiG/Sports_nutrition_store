using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs.CategoriesDTOs;
using backend.DTOs.OrderDTOs;
using backend.Helpers;
using backend.Models;
using Microsoft.EntityFrameworkCore.Update.Internal;

namespace backend.Services.Interfaces
{
    public interface IOrderService
    {
        Task<ICollection<Order>> GetAllOrdersAsync();
        Task<Order> GetOrderByIdASync(int id);
        Task<Order> DeleteOrderAsync(int id);
        Task<Order> CreateOrderAsync(int userId, CreateOrderDTO createOrderDTO);
        Task<Order> ChangeStatusAsync(int id, OrderStatus orderStatus);
        Task<Order> UpdateOrderAsync(int userId, int id, UpdateOrderDTO updateOrderDTO);

    }
}