import TransportRequest from "../models/transportRequest.js";

export const createTransportRequest = async (req, res) => {
  try {
    const { departure, destination, date, passengers, category, notes } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Utilizatorul nu este autentificat! Vă rugăm să vă conectați mai întâi." });
    }

    if (!departure || !destination || !date || !passengers || !category) {
      return res.status(400).json({ message: "Toate câmpurile obligatorii trebuie completate." });
    }

    const newRequest = new TransportRequest({
      userId: userId,
      departure,
      destination,
      date,
      passengers,
      category,
      notes,
    });

    const savedRequest = await newRequest.save();
    res.status(201).json({ message: "Cererea de transport a fost creată cu succes", data: savedRequest });

  } catch (error) {
    console.error("Eroare la crearea cererii de transport:", error);
    res.status(500).json({ message: "Eroare internă a serverului" });
  }
};

export const getAllTransportRequests = async (req, res) => {
  try {
    const requests = await TransportRequest.find().populate("userId", "name email");
    res.status(200).json({ data: requests });
  } catch (error) {
    console.error("Eroare la obținerea cererilor:", error);
    res.status(500).json({ message: "Eroare internă a serverului" });
  }
};

export const updateTransportRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const request = await TransportRequest.findById(id);

    if (!request) {
      return res.status(404).json({ message: "Cererea nu a fost găsită" });
    }

    if (request.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Nu aveți permisiunea de a actualiza această cerere" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: "Doar cererile în așteptare pot fi editate" });
    }

    const updated = await TransportRequest.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json({ message: "Cererea a fost actualizată cu succes", data: updated });

  } catch (error) {
    console.error("Eroare la actualizarea cererii:", error);
    res.status(500).json({ message: "Eroare internă a serverului" });
  }
};

export const deleteTransportRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const request = await TransportRequest.findById(id);

    if (!request) {
      return res.status(404).json({ message: "Cererea nu a fost găsită" });
    }

    if (request.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Nu aveți permisiunea de a șterge această cerere" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: "Doar cererile în așteptare pot fi șterse" });
    }

    await TransportRequest.findByIdAndDelete(id);
    res.status(200).json({ message: "Cererea a fost ștearsă cu succes" });

  } catch (error) {
    console.error("Eroare la ștergerea cererii:", error);
    res.status(500).json({ message: "Eroare internă a serverului" });
  }
};

export const getUserTransportRequests = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Neautorizat. Vă rugăm să vă autentificați." });
    }

    const userRequests = await TransportRequest.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({ data: userRequests });
  } catch (error) {
    console.error("Eroare la obținerea cererilor utilizatorului:", error);
    res.status(500).json({ message: "Eroare internă a serverului" });
  }
};
