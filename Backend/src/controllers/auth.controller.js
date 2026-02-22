import bcrypt from "bcryptjs";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import admin from "../config/firebaseAdmin.js";

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
 * FIREBASE LOGIN
 */
export const firebaseLogin = async (req, res) => {
  try {
    const { firebaseToken } = req.body;

    if (!firebaseToken) {
      return res.status(400).json({ message: "Firebase token required" });
    }

    // 🔐 Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(firebaseToken);

    const phone = decodedToken.phone_number;

    if (!phone) {
      return res.status(400).json({ message: "Phone number not verified" });
    }

    // Remove country code (+91)
    const formattedPhone = phone.replace("+91", "");

    let user = await User.findOne({ phone: formattedPhone });

    if (!user) {
      return res.status(404).json({ message: "User not registered" });
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
    res.status(401).json({ message: "Invalid Firebase token" });
  }
};



export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    //
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      let token = jwt.sign(email + password, process.env.JWT_SECRET);
      return res.status(200).json({
        success: true,
        message: 'Admin signed in successfully',
        data: {
          token,
        },
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password',
      });
    }
    res.send('Admin login');
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

