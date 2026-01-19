using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Models;

namespace backend.Repositories.Interfaces
{
    public interface IOrderRepository
    {
        Task<ICollection<Order>> GetAllOrderAsync();
        Task<Order?> GetOrderByIdAsync(int id);
        Task CreateOrderAsync(Order order);
        Task DeleteOrderAsync(int id);
        Task UpdateOrderAsync(Order order);
        Task<ICollection<Order>> GetOrdersByUserIdAsync(int userId);
    }
}