import SendMail from "../utils/SendMail.js";

const sendOrderFulfillmentEmail = async (customerEmail, customerName, order) => {
    const subject = "🚗 Your Order is Fulfilled - Trend Car Care";

    const text = `
    <p>Hello <strong>${customerName}</strong>,</p>

    <p>We are delighted to inform you that your order with Trend Car Care has been successfully fulfilled! 🚗</p>

    <p>Thank you for choosing us for your travel needs. We truly appreciate your trust in our service and hope you had a smooth and comfortable experience.</p>

    <p>If you have any feedback or require further assistance, please don’t hesitate to reach out. We are always here to help!</p>

    <p>📧 support@trendcarcare.com | 📞 +123-456-7890</p>

    <p>We look forward to serving you again in the future!</p>

    <p>Best regards,</p>
    <p><strong>The Trend Car Care Team</strong></p>
    `;

    try {
        await SendMail(customerEmail, subject, text);
    } catch (error) {
        throw new Error(`Failed to send fulfillment email: ${error?.response?.body || error.message}`);
    }
};

export default sendOrderFulfillmentEmail;
