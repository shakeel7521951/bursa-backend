import SendMail from "../utils/SendMail.js";

const sendOrderStatusEmail = async (customerEmail, customerName, order, status) => {
  const statusCapitalized = status.charAt(0).toUpperCase() + status.slice(1);

  const subject = `📦 Actualizare status comandă transport: ${statusCapitalized} - Bursa Trans România Italia`;

  const text = `
    <p>Bună <strong>${customerName}</strong>,</p>

    <p>Vă informăm că statusul comenzii dvs. de transport cu <strong>Bursa Trans România Italia</strong> a fost actualizat la: <strong>${statusCapitalized}</strong>.</p>

    <p>Fie că este vorba despre bagaje, pasageri, animale de companie sau mobilă — ne angajăm să vă ținem la curent la fiecare pas al călătoriei. 🧳🐾🪑</p>

    <p>Dacă aveți întrebări sau nelămuriri, nu ezitați să ne contactați:</p>
    <p>📧 contact@bursatrans.com | 📞 +40-123-456-789</p>

    <p>Vă mulțumim că ați ales serviciile noastre de transport internațional!</p>

    <p>Cu stimă,<br><strong>Echipa Bursa Trans România Italia</strong></p>
  `;

  try {
    await SendMail(customerEmail, subject, text);
  } catch (error) {
    throw new Error(`Trimiterea emailului cu statusul comenzii a eșuat: ${error?.response?.body || error.message}`);
  }
};

export default sendOrderStatusEmail;
