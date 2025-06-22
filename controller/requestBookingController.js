import RequestBooking from "../models/RequestBooking.js";
import TransportRequest from "../models/transportRequest.js";

export const createRequestBooking = async (req, res) => {
  try {
    const transporterId = req.user?.id;
    const { requestId } = req.params;

    if (!transporterId || !requestId) {
      return res
        .status(400)
        .json({ message: "ID-ul transportatorului sau ID-ul cererii lipsește" });
    }

    const transportRequest = await TransportRequest.findById(requestId);

    if (!transportRequest) {
      return res.status(404).json({ message: "Cererea de transport nu a fost găsită" });
    }

    transportRequest.status = "accepted";
    await transportRequest.save();

    const newRequest = new RequestBooking({
      transporterId: transporterId,
      requestId: requestId,
    });

    await newRequest.save();

    res.status(201).json({
      message: "Cererea de rezervare a fost acceptată cu succes",
      data: newRequest,
    });
  } catch (error) {
    console.error("Eroare la crearea cererii de rezervare:", error);
    res
      .status(500)
      .json({ message: "Eroare de server la crearea cererii de rezervare" });
  }
};

export const getAcceptedTransporterRequests = async (req, res) => {
  try {
    const transporterId = req.user?.id;

    if (!transporterId) {
      return res
        .status(401)
        .json({ message: "Neautorizat: ID-ul transportatorului nu a fost găsit" });
    }

    const bookings = await RequestBooking.find({ transporterId });
    const requestIds = bookings.map((booking) => booking.requestId);

    const acceptedRequests = await TransportRequest.find({
      _id: { $in: requestIds },
      status: { $in: ["accepted", "fulfilled"] },
    });

    res.status(200).json({
      message: "Cererile acceptate au fost preluate cu succes",
      data: acceptedRequests,
    });
  } catch (error) {
    console.error("Eroare la preluarea cererilor acceptate:", error);
    res
      .status(500)
      .json({ message: "Eroare de server la preluarea cererilor acceptate" });
  }
};

export const markRequestFulfilled = async (req, res) => {
  try {
    const { requestId } = req.params;
    const updated = await TransportRequest.findByIdAndUpdate(
      requestId,
      { status: "fulfilled" },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Cererea nu a fost găsită" });
    }

    res
      .status(200)
      .json({ message: "Cererea a fost marcată ca finalizată", data: updated });
  } catch (error) {
    res.status(500).json({ message: "Eroare la actualizarea statusului cererii" });
  }
};
