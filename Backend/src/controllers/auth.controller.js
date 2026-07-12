import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Otp from "../models/Otp.js";
import OtpThrottle from "../models/OtpThrottle.js";
import generateToken from "../utils/generateToken.js";
import { sendOtpSms } from "../utils/sendSms.js";

const OTP_EXPIRY_MINUTES = 5;
const MAX_VERIFY_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 30;

// Daily cap: max OTPs one phone can request within a rolling 24h window.
const MAX_OTPS_PER_DAY = 5;
const THROTTLE_WINDOW_HOURS = 24;

const isValidPhone = (phone) => /^[0-9]{10}$/.test(phone);

/**
 * REGISTER USER
 */
export const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password,role } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with email or phone"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role
    });

    const token = generateToken(user);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      }
    });
  } 
  catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error"
    });
  }
};

/**
 * LOGIN USER
 */
export const loginUser = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    if ((!email && !phone) || !password) {
      return res.status(400).json({ message: "Email/Phone and password required" });
    }

    const user = await User.findOne({
      $or: [{ email }, { phone }]
    }).select("+password");


    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Account is blocked" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/**
 * SEND OTP
 * Generates a 6-digit OTP, stores it hashed with a short expiry, and
 * sends it to the phone via SMS.
 */
export const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!isValidPhone(phone)) {
      return res.status(400).json({ message: "Enter a valid 10 digit phone number" });
    }

    // Cooldown: block rapid re-sends to avoid SMS abuse / cost.
    const existing = await Otp.findOne({ phone }).sort({ createdAt: -1 });
    if (existing) {
      const secondsSince = (Date.now() - existing.createdAt.getTime()) / 1000;
      if (secondsSince < RESEND_COOLDOWN_SECONDS) {
        return res.status(429).json({
          message: `Please wait ${Math.ceil(
            RESEND_COOLDOWN_SECONDS - secondsSince
          )}s before requesting a new OTP`,
        });
      }
    }

    // Daily cap: block if this phone already hit the limit in the current window.
    const throttle = await OtpThrottle.findOne({ phone });
    const now = Date.now();
    const windowActive = throttle && throttle.windowExpiresAt.getTime() > now;
    if (windowActive && throttle.count >= MAX_OTPS_PER_DAY) {
      return res.status(429).json({
        message: "Daily OTP limit reached. Please try again later.",
      });
    }

    // Generate a 6-digit code (100000–999999).
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(now + OTP_EXPIRY_MINUTES * 60 * 1000);

    // One active OTP per phone: remove any previous codes first.
    await Otp.deleteMany({ phone });
    await Otp.create({ phone, codeHash, expiresAt });

    // Send it (throws if the provider fails).
    await sendOtpSms(phone, code);

    // Count this send against the daily cap (only after a successful send).
    if (windowActive) {
      throttle.count += 1;
      await throttle.save();
    } else {
      await OtpThrottle.findOneAndUpdate(
        { phone },
        {
          phone,
          count: 1,
          windowExpiresAt: new Date(now + THROTTLE_WINDOW_HOURS * 60 * 60 * 1000),
        },
        { upsert: true }
      );
    }

    res.status(200).json({ message: "OTP sent" });
  } catch (error) {
    console.error("sendOtp error:", error);
    res.status(500).json({ message: "Failed to send OTP. Please try again." });
  }
};

/**
 * VERIFY OTP
 * Checks the code, then logs the user in (auto-registering new phones),
 * issuing the same JWT used elsewhere.
 */
export const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!isValidPhone(phone)) {
      return res.status(400).json({ message: "Enter a valid 10 digit phone number" });
    }
    if (!otp || !/^[0-9]{6}$/.test(otp)) {
      return res.status(400).json({ message: "Enter a valid 6 digit OTP" });
    }

    const record = await Otp.findOne({ phone }).sort({ createdAt: -1 });

    if (!record) {
      return res.status(400).json({ message: "OTP expired. Please request a new one." });
    }

    if (record.expiresAt.getTime() < Date.now()) {
      await Otp.deleteMany({ phone });
      return res.status(400).json({ message: "OTP expired. Please request a new one." });
    }

    if (record.attempts >= MAX_VERIFY_ATTEMPTS) {
      await Otp.deleteMany({ phone });
      return res.status(429).json({
        message: "Too many wrong attempts. Please request a new OTP.",
      });
    }

    const isMatch = await bcrypt.compare(otp, record.codeHash);

    if (!isMatch) {
      record.attempts += 1;
      await record.save();
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // ✅ Correct code — consume it.
    await Otp.deleteMany({ phone });

    // Auto-register if this phone has never logged in.
    let user = await User.findOne({ phone });
    if (!user) {
      user = await User.create({ phone, role: "USER" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Account is blocked" });
    }

    const token = generateToken(user);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("verifyOtp error:", error);
    res.status(500).json({ message: "Failed to verify OTP. Please try again." });
  }
};



export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email !== process.env.ADMIN_EMAIL ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    let admin = await User.findOne({ email });

    if (!admin) {
      const hashedPassword = await bcrypt.hash(password, 10);
      admin = await User.create({
        name: "Admin",
        email,
        phone: "0000000000",
        password: hashedPassword,
        role: "ADMIN",
      });
    } else if (admin.role !== "ADMIN") {
      admin.role = "ADMIN";
      await admin.save();
    }

    const token = generateToken(admin);

    return res.status(200).json({
      success: true,
      message: "Admin signed in successfully",
      data: { token },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyProfile = async (req, res) => {
  try {
    // req.user comes from protect middleware
    res.status(200).json({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/**
 * UPDATE PROFILE (name, email only — phone not editable)
 */
export const updateMyProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name && !email) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    const updates = {};
    if (typeof name === "string" && name.trim()) {
      updates.name = name.trim();
    }
    if (typeof email === "string" && email.trim()) {
      const normalized = email.trim().toLowerCase();
      const existing = await User.findOne({
        email: normalized,
        _id: { $ne: req.user._id },
      });
      if (existing) {
        return res.status(400).json({ message: "Email already in use" });
      }
      updates.email = normalized;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
