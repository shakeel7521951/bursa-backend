import SendMail from "../utils/SendMail.js";

export const sendTransporterNotification = async (transporterEmail, order) => {
  const service = order?.serviceId || {};
  const customer = order?.customerId || {};

  const serviceCategory = order?.serviceCategory || "Nu este specificat";

  // Common Fields
  const customerName = customer?.name || "Nume client indisponibil";
  const customerPhone = customer?.phone || "Telefon indisponibil";
  const customerEmail = customer?.email || "Email indisponibil";

  const serviceName = service?.serviceName || "Nu este specificat";
  const from = service?.destinationFrom || "Nu este specificat";
  const to = service?.destinationTo || "Nu este specificat";
  const travelDate = service?.travelDate ? new Date(service.travelDate).toLocaleDateString() : "Nu este specificat";
  const pickupOption = service?.pickupOption === "yes" ? "Disponibil" : "Indisponibil";

  const commonDetails = `
    <li><strong>Nume client:</strong> ${customerName}</li>
    <li><strong>Telefon client:</strong> ${customerPhone}</li>
    <li><strong>Email client:</strong> ${customerEmail}</li>
    <li><strong>Nume serviciu:</strong> ${serviceName}</li>
    <li><strong>Categorie:</strong> ${serviceCategory}</li>
    <li><strong>De la:</strong> ${from}</li>
    <li><strong>La:</strong> ${to}</li>
    <li><strong>Data plecării:</strong> ${travelDate}</li>
    <li><strong>Preluare de la adresă:</strong> ${pickupOption}</li>
    <li><strong>Preț total:</strong> €${order.totalPrice}</li>
    <li><strong>Status comandă:</strong> ${order.orderStatus}</li>
    <li><strong>Status plată:</strong> ${order.paymentStatus}</li>
    <li><strong>Metodă de plată:</strong> ${order.paymentMethod || "Nu este specificată"}</li>
  `;

  // Add category-specific fields
  let categoryDetails = "";

  switch (serviceCategory) {
    case "passenger":
      categoryDetails += `
        <li><strong>Locuri rezervate:</strong> ${order.seatsBooked}</li>
        <li><strong>Bagaje:</strong> ${order.luggageQuantity}</li>
      `;
      break;

    case "parcel":
      categoryDetails += `
        <li><strong>Cantitate colete:</strong> ${order.parcelQuantity}</li>
        <li><strong>Greutate totală:</strong> ${order.parcelWeight} kg</li>
      `;
      break;

    case "car_towing":
      categoryDetails += `
        <li><strong>Detalii vehicul:</strong> ${order.vehicleDetails}</li>
        <li><strong>Cerințe tractare:</strong> ${order.towingRequirements}</li>
      `;
      break;

    case "vehicle_trailer":
      categoryDetails += `
        <li><strong>Tip vehicul:</strong> ${order.vehicleType}</li>
        <li><strong>Cerințe remorcă:</strong> ${order.trailerRequirements}</li>
      `;
      break;

    case "furniture":
      categoryDetails += `
        <li><strong>Număr piese mobilier:</strong> ${order.furnitureItemCount}</li>
        <li><strong>Dimensiuni:</strong> ${order.furnitureDimensions}</li>
        <li><strong>Fragil:</strong> ${order.fragileItems ? "Da" : "Nu"}</li>
      `;
      break;

    case "animal":
      categoryDetails += `
        <li><strong>Număr animale:</strong> ${order.animalCount}</li>
        <li><strong>Tip animal:</strong> ${order.animalType}</li>
        <li><strong>Nevoi speciale:</strong> ${order.specialNeeds || "Niciuna"}</li>
        <li><strong>Cușcă necesară:</strong> ${order.cageRequired ? "Da" : "Nu"}</li>
      `;
      break;

    default:
      categoryDetails += `<li>Nu există detalii suplimentare pentru această categorie.</li>`;
  }

  const notes = order?.notes ? `<p><strong>Observații suplimentare:</strong> ${order.notes}</p>` : "";

  const subject = `🚛 Comandă nouă alocată: Transport pentru ${customerName}`;

  const text = `
    <p><strong>Stimate Transportator,</strong></p>

    <p>Ați fost alocat pentru o nouă comandă de transport de la <strong>Bursa Trans România Italia</strong>.</p>

    <h3 style="color: #007BFF;">🧾 Detalii comandă:</h3>
    <ul>
      ${commonDetails}
      ${categoryDetails}
    </ul>

    ${notes}

    <p>📦 Comanda poate include transport de pasageri, colete, vehicule, mobilier, animale sau alte bunuri.</p>

    <p>Vă rugăm să asigurați preluarea și livrarea la timp și să contactați clientul dacă este necesar.</p>

    <p>Cu stimă,</p>
    <p><strong>Echipa Bursa Trans România Italia</strong></p>
  `;

  try {
    await SendMail(transporterEmail, subject, text);
  } catch (error) {
    throw new Error(
      `Trimiterea emailului către transportator a eșuat: ${
        error?.response?.body || error.message
      }`
    );
  }
};

export default sendTransporterNotification;
