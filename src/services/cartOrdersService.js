import pb from '../lib/pocketbase';
import toast from 'react-hot-toast';

/**
 * Service for handling cart order operations
 */
export const cartOrdersService = {
  /**
   * Fetch all cart orders that are not active
   * @returns {Promise<Array>} The list of orders
   * @throws {Error} If the fetch operation fails
   */
  fetchOrders: async () => {
    try {
      const records = await pb.collection('Cart').getFullList({
        sort: '-created',
        filter: 'active = false',
        fields: 'id,created,updated,ordre,status,confirmed,customerInfo,total'
      });
      return records;
    } catch (err) {
      console.error('Error fetching orders:', err);
      toast.error('Failed to load orders');
      throw new Error('Failed to load orders');
    }
  },

  /**
   * Update the status of an order
   * @param {string} orderId - The ID of the order to update
   * @param {string} newStatus - The new status to set
   * @returns {Promise<Object>} The updated order
   * @throws {Error} If the update operation fails
   */
  updateOrderStatus: async (orderId, newStatus) => {
    try {
      const updatedOrder = await pb.collection('Cart').update(orderId, {
        status: newStatus,
        confirmed: newStatus === 'confirmed',
        lastUpdated: new Date().toISOString()
      });
      toast.success(`Order ${newStatus} updated successfully`);
      return updatedOrder;
    } catch (err) {
      console.error('Error updating order:', err);
      toast.error('Failed to update order status');
      throw new Error('Failed to update order status');
    }
  },

  /**
   * Delete an order
   * @param {string} orderId - The ID of the order to delete
   * @returns {Promise<void>}
   * @throws {Error} If the delete operation fails
   */
  deleteOrder: async (orderId) => {
    try {
      await pb.collection('Cart').delete(orderId);
      toast.success('Order deleted successfully');
    } catch (err) {
      console.error('Error deleting order:', err);
      toast.error('Failed to delete order');
      throw new Error('Failed to delete order');
    }
  }
};

export default cartOrdersService;