import User from "../models/User.js";
import sendMail from "../utils/SendMail.js";

export const register = async (req, res) => {
  try {
    const { name, email, role, password } = req.body;

    let user = await User.findOne({ email });
    if (user)
      return res.status(400).json({ message: "Utilizatorul există deja." });

    user = new User({ name, email, role, password, status: "unverified" });

    const otp = await user.generateOTP();

    await user.save();

    const subject = "Verifică-ți adresa de email - Bursa Trans Romania Italy";
    const text = `
      <p>Salut <strong>${name}</strong>,</p>
      <p>Îți mulțumim pentru înregistrare! Pentru a finaliza procesul, te rugăm să-ți verifici adresa de email.</p>
      <p>Codul tău OTP pentru verificare este:</p>
      <h3 style="font-size: 32px; font-weight: bold; color: #4CAF50;">${otp}</h3>
      <p>Dacă nu ai solicitat acest lucru, poți ignora acest email.</p>
      <p>Cu stimă,</p>
      <p>Bursa Trans Romania Italy</p>
    `;

    await sendMail(email, subject, text);

    res
      .status(201)
      .json({ message: "OTP trimis pe email. Verifică-ți contul." });
  } catch (error) {
    res.status(500).json({ message: "Eroare de server", error: error.message });
  }
};

export const verifyUser = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "Utilizatorul nu a fost găsit." });

    if (!user.verifyOTP(otp)) {
      return res.status(400).json({ message: "OTP invalid sau expirat." });
    }

    user.otp = undefined;
    user.otpExpires = undefined;
    user.status = "verified";
    await user.save();

    const token = user.generateToken();
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000,
      secure: true,
      sameSite: "None",
    });

    res.status(200).json({ message: "Utilizator verificat cu succes." });
  } catch (error) {
    res.status(500).json({ message: "Eroare de server", error: error.message });
  }
};

export const appVerifyUser = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Utilizatorul nu a fost găsit." });
    }

    if (!user.verifyOTP(otp)) {
      return res.status(400).json({ message: "OTP invalid sau expirat." });
    }

    user.otp = undefined;
    user.otpExpires = undefined;
    user.status = "verified";
    await user.save();

    const token = user.generateToken();

    res.status(200).json({
      message: "Utilizator verificat cu succes.",
      token,
      user: {
        id: user._id,
        email: user.email,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Eroare de server", error: error.message });
  }
};

export const forgotPasswordOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Emailul este obligatoriu." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "Nu a fost găsit niciun utilizator cu acest email." });
    }

    const otp = await user.generateOTP();

    const name = user.name;
    const subject = "OTP pentru resetarea parolei";
    const text = `
      <p>Salut <strong>${name}</strong>,</p>
      <p>Am primit o cerere de resetare a parolei contului tău. Pentru a continua, folosește OTP-ul de mai jos:</p>
      <h3 style="font-size: 32px; font-weight: bold; color: #4CAF50;">${otp}</h3>
      <p>Acest cod este valabil pentru o perioadă limitată. Dacă nu ai solicitat resetarea parolei, ignoră acest email sau contactează echipa noastră de suport.</p>
      <p>Cu stimă,</p>
      <p>Bursa Trans Romania Italy</p>
    `;

    await sendMail(email, subject, text);

    user.otp = otp;
    await user.save();

    res.status(200).json({ message: "OTP trimis cu succes!" });
  } catch (error) {
    console.error("Eroare în forgotPasswordOtp:", error);
    res.status(500).json({ message: "Eroare internă a serverului." });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res
        .status(400)
        .json({ message: "Emailul și OTP-ul sunt obligatorii." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "Nu a fost găsit niciun utilizator cu acest email." });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "OTP invalid sau expirat." });
    }

    res.status(200).json({ message: "OTP verificat cu succes." });
  } catch (error) {
    console.error("Eroare în verifyOTP:", error);
    res.status(500).json({ message: "Eroare internă a serverului." });
  }
};
export const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Emailul și parola sunt obligatorii." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "Utilizatorul nu a fost găsit cu acest email." });
    }

    if (!user.otp) {
      return res
        .status(400)
        .json({
          message:
            "OTP-ul nu este verificat. Vă rugăm să verificați OTP-ul mai întâi.",
        });
    }

    user.password = password;
    user.otp = undefined;
    await user.save();

    res.status(200).json({ message: "Parola a fost resetată cu succes." });
  } catch (error) {
    res.status(500).json({ message: "Eroare internă a serverului." });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "Utilizatorul nu a fost găsit." });

    if (user.status === "unverified") {
      await User.deleteOne({ email });
      return res
        .status(403)
        .json({
          message: "Cont neverificat. Vă rugăm să vă înregistrați din nou.",
        });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Email sau parolă incorectă." });

    const token = user.generateToken();
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000,
      secure: true,
      sameSite: "None",
    });

    res.status(200).json({ message: "Autentificare reușită", user });
  } catch (error) {
    res.status(500).json({ message: "Eroare de server", error: error.message });
  }
};

export const appLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Utilizatorul nu a fost găsit." });
    }

    if (user.status === "unverified") {
      await User.deleteOne({ email });
      return res
        .status(403)
        .json({
          message: "Cont neverificat. Vă rugăm să vă înregistrați din nou.",
        });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Email sau parolă incorectă." });
    }

    const token = user.generateToken();

    res.status(200).json({
      message: "Autentificare reușită",
      token,
      user: {
        id: user._id,
        email: user.email,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Eroare de server", error: error.message });
  }
};

export const logout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Utilizator delogat cu succes." });
};

export const myProfile = async (req, res) => {
  try {
    const user = req.user;

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Eroare internă a serverului." });
  }
};

export const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return next(new errorHandler("Toate câmpurile sunt obligatorii.", 400));
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(400).json("Utilizatorul nu a fost găsit!");
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(403).json("Parola veche este incorectă!");
    }

    if (currentPassword === newPassword) {
      return res
        .status(401)
        .json({ message: "Parola veche și cea nouă nu pot fi identice." });
    }

    if (newPassword !== confirmPassword) {
      return res.status(401).json("Parolele nu coincid!");
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Parola a fost actualizată cu succes.",
    });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Eroare internă a serverului. Încercați din nou mai târziu.",
      });
  }
};

export const updateProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Cerere neautorizată." });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Utilizatorul nu a fost găsit." });
    }

    const { role } = req.body;
    user.role = role;
    await user.save();

    return res
      .status(200)
      .json({ message: "Profil actualizat cu succes.", user });
  } catch (error) {
    console.error("Eroare la actualizarea profilului:", error);
    return res.status(500).json({ message: "Eroare internă a serverului." });
  }
};

export const allUsers = async (req, res) => {
  try {
    const users = await User.find();
    if (!users) {
      res.status(404).json({ message: "Niciun utilizator găsit!" });
    }
    res.status(200).json(users);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Eroare internă a serverului. Încercați din nou mai târziu.",
      });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { userId, role } = req.body;

    if (!userId || !role) {
      return res
        .status(400)
        .json({ message: "ID-ul utilizatorului și rolul sunt obligatorii." });
    }

    const updateUserRole = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    );

    if (!updateUserRole) {
      return res
        .status(400)
        .json({
          message: "Ceva nu a funcționat. Încercați din nou mai târziu.",
        });
    }

    res.status(200).json({
      message: "Rolul utilizatorului a fost actualizat cu succes.",
      user: updateUserRole,
    });
  } catch (error) {
    console.error("Eroare la actualizarea rolului utilizatorului:", error);
    res
      .status(500)
      .json({ message: "Eroare internă a serverului", error: error.message });
  }
};
