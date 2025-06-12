import SendMail from "../utils/SendMail.js";

const sendOrderStatusEmail = async (customerEmail, customerName, order, status) => {
  const statusCapitalized = status.charAt(0).toUpperCase() + status.slice(1);

  const subject = `📦 Your Transport Order Status Updated: ${statusCapitalized} - Bursa Trans Romania Italy`;

  const text = `
    <p>Hello <strong>${customerName}</strong>,</p>

    <p>This is to inform you that the status of your transport order with <strong>Bursa Trans Romania Italy</strong> has been updated to: <strong>${statusCapitalized}</strong>.</p>

    <p>Whether it was luggage, passengers, pets, or furniture — we’re committed to keeping you informed at every step of the journey. 🧳🐾🪑</p>

    <p>If you have any questions or concerns, please don’t hesitate to reach out to us:</p>
    <p>📧 contact@bursatrans.com | 📞 +40-123-456-789</p>

    <p>Thank you for choosing our international transport services!</p>

    <p>Best regards,<br><strong>The Bursa Trans Romania Italy Team</strong></p>
  `;

  try {
    await SendMail(customerEmail, subject, text);
  } catch (error) {
    throw new Error(`Failed to send status update email: ${error?.response?.body || error.message}`);
  }
};

export default sendOrderStatusEmail;
