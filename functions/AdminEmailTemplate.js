import SendMail from "../utils/SendMail.js";

export const sendAdminOrderNotification = async (adminEmail, customerName, order) => {
  const serviceName = order?.serviceId?.serviceName || "Service Name Not Available";
  const serviceCategory = order?.serviceId?.serviceCategory || "Service Category Not Available";
  
  const subject = `New Order Placed by ${customerName}`;
  const text = `
    <p><strong>Dear Admin,</strong></p>
    <p>A new order has been placed by <strong>${customerName}</strong>.</p>
    
    <h3>Order Details:</h3>
    <ul>
        <li><strong>Service Name:</strong> ${serviceName}</li>
        <li><strong>Category:</strong> ${serviceCategory}</li>
        <li><strong>Pickup Location:</strong> ${order.pickupLocation}</li>
        <li><strong>Dropoff Location:</strong> ${order.dropoffLocation}</li>
        <li><strong>Distance:</strong> ${order.distance} km</li>
        <li><strong>Price:</strong> $${order.price}</li>
        <li><strong>Pickup Time:</strong> ${order.pickupDateTime}</li>
        <li><strong>Order Status:</strong> ${order.orderStatus}</li>
    </ul>
    
    <p>Please review and process this order as needed.</p>
    
    <p>Best regards,</p>
    <p><strong>The Car Rental Service Team</strong></p>
  `;

  try {
    await SendMail(adminEmail, subject, text);
  } catch (error) {
    throw new Error(
      `Failed to send admin notification email: ${
        error?.response?.body || error.message
      }`
    );
  }
};

export default sendAdminOrderNotification;
