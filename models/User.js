import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePic: { type: String },
    role: { type: String, default: "User" },
    status: { type: String, default: "unverified" },
    otp: { type: String },
    otpExpires: { type: Date },
  },
  { timestamps: true }
);

// Generate OTP
userSchema.methods.generateOTP = async function () {
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  this.otp = otp;
  this.otpExpires = Date.now() + 5 * 60 * 1000;
  await this.save();
  return otp;
};

// Verify OTP
userSchema.methods.verifyOTP = function (enteredOTP) {
  if (this.otp !== enteredOTP || Date.now() > this.otpExpires) return false;
  return true;
};

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Delete unverified user after OTP expires
userSchema.post("save", function (doc) {
  if (doc.status === "unverified") {
    setTimeout(async () => {
      const user = await mongoose.model("User").findById(doc._id);
      if (user && user.status === "unverified") {
        await user.deleteOne();
        console.log(`Unverified user ${user.email} deleted after OTP expiry.`);
      }
    }, 5 * 60 * 1000); 
  }
});

// Compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT Token
userSchema.methods.generateToken = function () {
  return jwt.sign(
    { id: this._id,name:this.name ,email: this.email, role: this.role,profilePic:this.profilePic },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

const User = mongoose.model("User", userSchema);
export default User;