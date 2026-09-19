import mongoose from "mongoose";
import User from "../models/User.js";

/**
 * Addresses were previously built straight from req.body, which let a client
 * set fields the schema never intended to expose (including _id). Only these
 * fields are ever read, and they are validated here rather than only in the
 * browser — a malformed pincode ends up printed on a real parcel.
 */
const ADDRESS_FIELDS = [
  "fullName",
  "phone",
  "house",     // address: area or street
  "street",    // village or locality
  "landmark",
  "city",      // city or town
  "district",
  "state",
  "pincode",
  "country",
];

const REQUIRED_FIELDS = [
  "fullName",
  "phone",
  "house",
  "city",
  "district",
  "state",
  "pincode",
];

// Nothing here ends up anywhere but a shipping label, so the limits are the
// length of a label line rather than anything the database needs.
const MAX_LENGTHS = {
  fullName: 100,
  house: 300,
  street: 100,
  landmark: 100,
  city: 100,
  district: 100,
  state: 100,
};

const pickAddress = (body) => {
  const address = {};
  for (const field of ADDRESS_FIELDS) {
    if (typeof body[field] !== "string") continue;
    const value = body[field].trim();
    // Empty is kept so the form can clear an optional field (landmark,
    // village); a mandatory field sent empty is caught by validateAddress
    // instead of silently keeping the old value. Country is the exception:
    // blank means "unspecified", and the schema default applies.
    if (!value && field === "country") continue;
    address[field] = value;
  }
  return address;
};

const validateAddress = (address, { partial = false } = {}) => {
  if (!partial) {
    for (const field of REQUIRED_FIELDS) {
      if (!address[field]) return "Please fill all required address fields";
    }
  }

  if (address.phone !== undefined && !/^[0-9]{10}$/.test(address.phone)) {
    return "Enter a valid 10 digit phone number";
  }

  if (address.pincode !== undefined && !/^[1-9][0-9]{5}$/.test(address.pincode)) {
    return "Enter a valid 6 digit pincode";
  }

  for (const [field, limit] of Object.entries(MAX_LENGTHS)) {
    if (address[field] !== undefined && address[field].length > limit) {
      return `${field === "fullName" ? "Name" : field} is too long`;
    }
  }

  return null;
};

export const addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user.addresses.length >= 20) {
      return res
        .status(400)
        .json({ message: "You have reached the maximum number of addresses" });
    }

    const newAddress = pickAddress(req.body);
    const problem = validateAddress(newAddress);
    if (problem) {
      return res.status(400).json({ message: problem });
    }

    const makeDefault =
      req.body.isDefault === true ||
      req.body.isDefault === "true" ||
      user.addresses.length === 0;

    if (makeDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    user.addresses.push({ ...newAddress, isDefault: makeDefault });
    await user.save();

    res.status(201).json({
      message: "Address added successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("addAddress error:", error);
    res.status(500).json({ message: "Could not save address" });
  }
};

export const getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("addresses");
    res.status(200).json(user?.addresses ?? []);
  } catch (error) {
    console.error("getAddresses error:", error);
    res.status(500).json({ message: "Could not load addresses" });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    if (!mongoose.isValidObjectId(addressId)) {
      return res.status(404).json({ message: "Address not found" });
    }

    const user = await User.findById(req.user._id);
    const address = user?.addresses.id(addressId);

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    // Validate what the address will become, not just the fields that
    // arrived: an address saved before district existed must not stay
    // without one once the customer edits it.
    const updates = pickAddress(req.body);
    const problem = validateAddress({ ...address.toObject(), ...updates });
    if (problem) {
      return res.status(400).json({ message: problem });
    }

    if (req.body.isDefault === true || req.body.isDefault === "true") {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
      address.isDefault = true;
    }

    Object.assign(address, updates);
    await user.save();

    res.status(200).json({
      message: "Address updated",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("updateAddress error:", error);
    res.status(500).json({ message: "Could not update address" });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const wasDefault = user.addresses.id(addressId)?.isDefault;

    user.addresses = user.addresses.filter(
      (addr) => addr._id.toString() !== addressId
    );

    // Never leave the customer without a default address.
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    res.status(200).json({
      message: "Address deleted",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("deleteAddress error:", error);
    res.status(500).json({ message: "Could not delete address" });
  }
};

export const setDefaultAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    let found = false;

    user.addresses.forEach((addr) => {
      if (addr._id.toString() === addressId) {
        addr.isDefault = true;
        found = true;
      } else {
        addr.isDefault = false;
      }
    });

    if (!found) {
      return res.status(404).json({ message: "Address not found" });
    }

    await user.save();

    res.status(200).json({
      message: "Default address updated",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("setDefaultAddress error:", error);
    res.status(500).json({ message: "Could not update address" });
  }
};
