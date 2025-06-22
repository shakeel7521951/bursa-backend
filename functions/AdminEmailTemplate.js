import SendMail from "../utils/SendMail.js";

const sendAdminOrderNotification = async (adminEmail, customerName, order) => {
  const service = order?.serviceId;

  const serviceCategory = order?.serviceCategory || "Indisponibil";
  const serviceName = service?.serviceName || "Indisponibil";
  const destinationFrom = service?.destinationFrom || "Indisponibil";
  const destinationTo = service?.destinationTo || "Indisponibil";
  const travelDate = service?.travelDate
    ? new Date(service.travelDate).toLocaleDateString()
    : "Indisponibil";
  const pickupOption = service?.pickupOption === "yes" ? "Da" : "Nu";

  const subject = `🛎️ Comandă nouă - ${customerName} a rezervat un transport pentru categoria ${serviceCategory}`;

  let details = `
    <ul>
      <li><strong>Client:</strong> ${customerName}</li>
      <li><strong>Categorie:</strong> ${serviceCategory}</li>
      <li><strong>Serviciu:</strong> ${serviceName}</li>
      <li><strong>De la:</strong> ${destinationFrom}</li>
      <li><strong>La:</strong> ${destinationTo}</li>
      <li><strong>Data plecării:</strong> ${travelDate}</li>
      <li><strong>Preluare de la domiciliu:</strong> ${pickupOption}</li>
      <li><strong>Preț total:</strong> €${order.totalPrice}</li>
      <li><strong>Status comandă:</strong> ${order.orderStatus}</li>
      <li><strong>Status plată:</strong> ${order.paymentStatus}</li>
    </ul>
  `;

  switch (serviceCategory) {
    case "passenger":
      details += `
        <ul>
          <li><strong>Locuri rezervate:</strong> ${order.seatsBooked}</li>
          <li><strong>Număr bagaje:</strong> ${order.luggageQuantity}</li>
        </ul>
      `;
      break;

    case "parcel":
      details += `
        <ul>
          <li><strong>Cantitate colete:</strong> ${order.parcelQuantity}</li>
          <li><strong>Greutate totală:</strong> ${order.parcelWeight} kg</li>
        </ul>
      `;
      break;

    case "car_towing":
      details += `
        <ul>
          <li><strong>Detalii vehicul:</strong> ${order.vehicleDetails}</li>
          <li><strong>Cerințe tractare:</strong> ${order.towingRequirements}</li>
        </ul>
      `;
      break;

    case "vehicle_trailer":
      details += `
        <ul>
          <li><strong>Tip vehicul:</strong> ${order.vehicleType}</li>
          <li><strong>Cerințe remorcă:</strong> ${order.trailerRequirements}</li>
        </ul>
      `;
      break;

    case "furniture":
      details += `
        <ul>
          <li><strong>Număr obiecte mobilier:</strong> ${order.furnitureItemCount}</li>
          <li><strong>Dimensiuni:</strong> ${order.furnitureDimensions}</li>
          <li><strong>Fragil:</strong> ${order.fragileItems ? "Da" : "Nu"}</li>
        </ul>
      `;
      break;

    case "animal":
      details += `
        <ul>
          <li><strong>Număr animale:</strong> ${order.animalCount}</li>
          <li><strong>Tip animal:</strong> ${order.animalType}</li>
          <li><strong>Nevoi speciale:</strong> ${order.specialNeeds || "Niciuna"}</li>
          <li><strong>Cușcă necesară:</strong> ${order.cageRequired ? "Da" : "Nu"}</li>
        </ul>
      `;
      break;
  }

  if (order.notes) {
    details += `<p><strong>Note:</strong> ${order.notes}</p>`;
  }

  const message = `
    <p>Bună Admin,</p>
    <p>A fost plasată o comandă nouă de către <strong>${customerName}</strong>.</p>
    ${details}
    <p>Vă rugăm să verificați această rezervare în panoul de administrare.</p>
    <p>— Bursa Trans România Italia</p>
  `;

  try {
    await SendMail(adminEmail, subject, message);
  } catch (err) {
    console.error("Eroare trimitere email:", err);
    throw new Error(`Trimiterea emailului a eșuat: ${err.message}`);
  }
};

export default sendAdminOrderNotification;
