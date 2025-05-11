import SendMail from "../utils/SendMail.js";

const sendOrderConfirmationEmail = async (
  customerEmail,
  customerName,
  orderDetails
) => {
  const {
    serviceId,
    pickupLocation,
    dropoffLocation,
    distance,
    price,
    pickupDateTime,
  } = orderDetails;

  const serviceName = serviceId?.serviceName || "Service Name Not Available";
  const subject = "🚗 Your Car Rental Booking Confirmation - Trend Car Care";

  const text = `
    <p>Hello <strong>${customerName}</strong>,</p>
    <p>Thank you for choosing <strong>Trend Car Care</strong> for your travel needs! We truly appreciate your trust in our service.</p>
    <h3 style="color: #4CAF50;">📌 Order Details:</h3>
    <ul>
        <li><strong>Service Name:</strong> ${serviceName}</li>
        <li><strong>Pickup Location:</strong> ${pickupLocation}</li>
        <li><strong>Dropoff Location:</strong> ${dropoffLocation}</li>
        <li><strong>Total Distance:</strong> ${distance} km</li>
        <li><strong>Total Price:</strong> $${price} only</li>
        <li><strong>Pickup Date & Time:</strong> ${pickupDateTime}</li>
    </ul>
    <p>🚗 Our driver will arrive at your pickup location on time. If you have any changes or inquiries, feel free to contact us.</p>
    <p>We appreciate your business and look forward to providing you with a smooth and comfortable ride.</p>
    <p>Best regards,</p>
    <p><strong>The Trend Car Care Team</strong></p>
    <p>📧 support@trendcarcare.com | 📞 +123-456-7890</p>
    `;

  try {
    await SendMail(customerEmail, subject, text);
  } catch (error) {
    throw new Error(
      `Failed to send confirmation email: ${
        error?.response?.body || error.message
      }`
    );
  }
};

export default sendOrderConfirmationEmail;