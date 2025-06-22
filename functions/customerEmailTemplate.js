import SendMail from "../utils/SendMail.js";

const sendOrderConfirmationEmail = async (
  customerEmail,
  customerName,
  orderDetails
) => {
  const {
    serviceId,
    serviceCategory,
    totalPrice,
    seatsBooked,
    luggageQuantity,
    parcelQuantity,
    parcelWeight,
    vehicleDetails,
    towingRequirements,
    vehicleType,
    trailerRequirements,
    furnitureItemCount,
    furnitureDimensions,
    fragileItems,
    animalCount,
    animalType,
    specialNeeds,
    cageRequired,
  } = orderDetails;

  const {
    serviceName = "Indisponibil",
    destinationFrom = "Indisponibil",
    destinationTo = "Indisponibil",
    travelDate,
    pickupOption = "Indisponibil",
  } = serviceId || {};

  const formattedDate = travelDate
    ? new Date(travelDate).toLocaleDateString()
    : "Indisponibil";

  const subject = "🚌 Confirmare rezervare transport - Bursa Trans România Italia";

  let extraDetails = "";

  switch (serviceCategory) {
    case "passenger":
      extraDetails = `
        <li><strong>Locuri rezervate:</strong> ${seatsBooked}</li>
        <li><strong>Număr bagaje:</strong> ${luggageQuantity}</li>
      `;
      break;
    case "parcel":
      extraDetails = `
        <li><strong>Cantitate colete:</strong> ${parcelQuantity}</li>
        <li><strong>Greutate colete:</strong> ${parcelWeight} kg</li>
      `;
      break;
    case "car_towing":
      extraDetails = `
        <li><strong>Detalii vehicul:</strong> ${vehicleDetails}</li>
        <li><strong>Cerințe tractare:</strong> ${towingRequirements}</li>
      `;
      break;
    case "vehicle_trailer":
      extraDetails = `
        <li><strong>Tip vehicul:</strong> ${vehicleType}</li>
        <li><strong>Cerințe remorcă:</strong> ${trailerRequirements}</li>
      `;
      break;
    case "furniture":
      extraDetails = `
        <li><strong>Număr obiecte mobilier:</strong> ${furnitureItemCount}</li>
        <li><strong>Dimensiuni:</strong> ${furnitureDimensions}</li>
        <li><strong>Obiecte fragile:</strong> ${fragileItems ? "Da" : "Nu"}</li>
      `;
      break;
    case "animal":
      extraDetails = `
        <li><strong>Număr animale:</strong> ${animalCount}</li>
        <li><strong>Tip animal:</strong> ${animalType}</li>
        <li><strong>Nevoi speciale:</strong> ${specialNeeds || "Niciuna"}</li>
        <li><strong>Cușcă necesară:</strong> ${cageRequired ? "Da" : "Nu"}</li>
      `;
      break;
    default:
      extraDetails = "";
  }

  const text = `
    <p>Bună <strong>${customerName}</strong>,</p>

    <p>Vă mulțumim pentru rezervarea făcută cu <strong>Bursa Trans România Italia</strong>. Suntem specializați în transport sigur și de încredere între România și Italia, oferind servicii pentru <strong>pasageri, bagaje, mobilier, animale și altele</strong>.</p>

    <h3 style="color: #4CAF50;">📦 Detalii rezervare:</h3>
    <ul>
      <li><strong>Nume serviciu:</strong> ${serviceName}</li>
      <li><strong>Tip serviciu:</strong> ${serviceCategory}</li>
      <li><strong>De la:</strong> ${destinationFrom}</li>
      <li><strong>La:</strong> ${destinationTo}</li>
      <li><strong>Data plecării:</strong> ${formattedDate}</li>
      <li><strong>Preluare de la domiciliu:</strong> ${
        pickupOption === "yes" ? "Disponibilă" : "Indisponibilă"
      }</li>
      ${extraDetails}
      <li><strong>Preț total:</strong> €${totalPrice}</li>
    </ul>

    <p>🚌 Echipa noastră va ajunge la locația de preluare conform programării. Dacă aveți actualizări sau cerințe speciale, vă rugăm să ne contactați în avans.</p>

    <p>Vă mulțumim pentru încrederea acordată serviciilor noastre și așteptăm cu nerăbdare să vă deservim nevoile de transport între România și Italia.</p>

    <p>Cu respect,</p>
    <p><strong>Bursa Trans România Italia</strong></p>
    <p>📧 support@bursatransromaniaitalia.com | 📞 +123-456-7890</p>
  `;

  try {
    await SendMail(customerEmail, subject, text);
  } catch (error) {
    throw new Error(
      `Trimiterea emailului de confirmare a eșuat: ${error?.response?.body || error.message}`
    );
  }
};

export default sendOrderConfirmationEmail;
