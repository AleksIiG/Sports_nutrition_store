using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using backend.DTOs.OrderDTOs;
using backend.Helpers;
using backend.Models;
using backend.Repositories.Interfaces;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Http.Features;

namespace backend.Services
{
    public class OrderService : IOrderService
    {
        private readonly IOrderRepository _orderRepository;
        private readonly IProductRepository _productRepository;
        private readonly IUserRepository _userRepository;

        public OrderService(IOrderRepository orderRepository, IProductRepository productRepository, IUserRepository userRepository)
        {
            _productRepository = productRepository;
            _orderRepository = orderRepository;
            _userRepository = userRepository;
        }

        public async Task<Order> ChangeStatusAsync(int id, OrderStatus orderStatus)
        {
            var order = await _orderRepository.GetOrderByIdAsync(id);
            if (order == null)
                throw new KeyNotFoundException($"Order with id {id} not found.");

            if (order.Status == OrderStatus.Paid || order.Status == OrderStatus.Cancelled)
                throw new InvalidOperationException("Cannot change status of completed or cancelled order.");

            order.Status = orderStatus;
            await _orderRepository.UpdateOrderAsync(order);
            return order;

        }



        public async Task<Order> CreateOrderAsync(int userId, CreateOrderDTO createOrderDTO)
        {
            if (createOrderDTO == null || !createOrderDTO.OrderItems.Any())
            {
                throw new InvalidOperationException("Order must contain at least one item.");
            }

            var order = new Order
            {
                UserId = userId,
                CreatedAt = DateTime.UtcNow
            };

            decimal totalPrice = 0;

            foreach (var item in createOrderDTO.OrderItems)
            {
                if (item.Quantity <= 0)
                {
                    throw new InvalidOperationException("Quantity must be greater than zero.");
                }
                var product = await _productRepository.GetByIdAsync(item.ProductId);
                if (product == null)
                    throw new KeyNotFoundException($"Product with id {item.ProductId} not found.");

                var orderItem = new OrderItem
                {
                    ProductId = product.Id,
                    Quantity = item.Quantity,
                    PriceAtPurchase = product.Price
                };
                order.OrderItems.Add(orderItem);
                totalPrice += product.Price * item.Quantity;
            }

            order.TotalPrice = totalPrice;

            await _orderRepository.CreateOrderAsync(order);
            return order;
        }

        public async Task<Order> DeleteOrderAsync(int id)
        {
            var model = await _orderRepository.GetOrderByIdAsync(id);
            if (model == null)
            {
                throw new KeyNotFoundException($"Order with id {id} not found");
            }
            await _orderRepository.DeleteOrderAsync(id);
            return model;
        }

        public async Task<ICollection<Order>> GetAllOrdersAsync()
        {
            return await _orderRepository.GetAllOrderAsync();
        }

        public async Task<Order> GetOrderByIdASync(int id)
        {
            var model = await _orderRepository.GetOrderByIdAsync(id);
            if (model == null)
            {
                throw new KeyNotFoundException($"Order with id {id} not found");
            }
            return model;
        }

        public async Task<Order> UpdateOrderAsync(int userId, int id, UpdateOrderDTO updateOrderDTO)
        {
            var existingIOrder = await _orderRepository.GetOrderByIdAsync(id);
            if (existingIOrder == null)
            {
                throw new KeyNotFoundException($"Order with id {id} not found");
            }
            var user = await _userRepository.GetUserByIdAsync(userId);
            if (existingIOrder.UserId != userId && user?.Role != "Admin")
            {
                throw new InvalidOperationException($"this order does not belong to the user with id {userId}");
            }

            existingIOrder.OrderItems.Clear();

            decimal totalPrice = 0;
            foreach (var item in updateOrderDTO.OrderItems)
            {
                if (item.Quantity <= 0)
                {
                    throw new InvalidOperationException("Quantity must be greater than zero.");
                }
                var product = await _productRepository.GetByIdAsync(item.ProductId);
                if (product == null)
                    throw new KeyNotFoundException($"Product with id {item.ProductId} not found.");

                var orderItem = new OrderItem
                {
                    ProductId = product.Id,
                    Quantity = item.Quantity,
                    PriceAtPurchase = product.Price
                };
                existingIOrder.OrderItems.Add(orderItem);
                totalPrice += product.Price * item.Quantity;
            }

            existingIOrder.TotalPrice = totalPrice;
            existingIOrder.Id = id;

            await _orderRepository.UpdateOrderAsync(existingIOrder);
            return existingIOrder;



        }
    }
}