import Order from '../models/Order.js';
import Payment from '../models/Payment.js';

const ORDER_EXPIRY_MINUTES = 30;
const CLEANUP_INTERVAL_MINUTES = 5;

/**
 * Cancels unpaid orders older than ORDER_EXPIRY_MINUTES.
 * Also sweeps orphaned Payment records stuck in 'created' state.
 */
const cleanupExpiredOrders = async () => {
  try {
    const expiryTime = new Date(Date.now() - ORDER_EXPIRY_MINUTES * 60 * 1000);

    // --- Phase 1: Expire unpaid orders in 'Processing' state ---
    const expiredOrders = await Order.find({
      status: 'Processing',
      paymentStatus: 'pending',
      createdAt: { $lt: expiryTime }
    });

    if (expiredOrders.length > 0) {
      console.log(`[Order Cleanup] Found ${expiredOrders.length} expired unpaid order(s)`);

      for (const order of expiredOrders) {
        order.status = 'Cancelled';
        order.paymentStatus = 'failed';
        await order.save();

        // Cancel associated payment records
        await Payment.updateMany(
          { order: order._id, status: 'created' },
          { $set: { status: 'cancelled', updatedAt: new Date() } }
        );

        console.log(`[Order Cleanup] Cancelled expired order: ${order.orderNumber}`);
      }
    }

    // --- Phase 2: Sweep orphaned Payment records stuck in 'created' state ---
    // These are Razorpay orders that were created but never completed,
    // independent of the order status (covers edge cases like browser crashes)
    const orphanedPayments = await Payment.find({
      status: 'created',
      createdAt: { $lt: expiryTime }
    }).populate('order', 'status paymentStatus');

    if (orphanedPayments.length > 0) {
      let cancelledCount = 0;

      for (const payment of orphanedPayments) {
        // Cancel the payment record
        payment.status = 'cancelled';
        payment.updatedAt = new Date();
        await payment.save();
        cancelledCount++;

        // If the associated order is still in a non-terminal state, cancel it too
        if (payment.order && payment.order.status === 'Processing') {
          payment.order.status = 'Cancelled';
          payment.order.paymentStatus = 'failed';
          await payment.order.save();
        }
      }

      if (cancelledCount > 0) {
        console.log(`[Order Cleanup] Cancelled ${cancelledCount} orphaned payment record(s)`);
      }
    }
  } catch (error) {
    console.error('[Order Cleanup] Error during cleanup:', error.message);
  }
};

/**
 * Starts the periodic order cleanup job.
 * Runs every CLEANUP_INTERVAL_MINUTES minutes.
 */
export const startOrderCleanupJob = () => {
  // Run once on startup after a short delay
  setTimeout(cleanupExpiredOrders, 10 * 1000);

  // Then run periodically
  const intervalMs = CLEANUP_INTERVAL_MINUTES * 60 * 1000;
  setInterval(cleanupExpiredOrders, intervalMs);

  console.log(
    `[Order Cleanup] Job started — expires unpaid orders after ${ORDER_EXPIRY_MINUTES}min, checks every ${CLEANUP_INTERVAL_MINUTES}min`
  );
};
