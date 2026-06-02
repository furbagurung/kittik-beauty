import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma.js";
import { generateCustomerToken } from "../utils/generateCustomerToken.js";

const MIN_PASSWORD_LENGTH = 8;

function normalizeEmail(email) {
  return typeof email === "string" ? email.toLowerCase().trim() : "";
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function serializeCustomer(customer) {
  return {
    id: customer.id,
    fullName: customer.fullName,
    email: customer.email,
    phone: customer.phone,
    role: customer.role,
    status: customer.status,
    createdAt: customer.createdAt,
    updatedAt: customer.updatedAt,
  };
}

export async function registerCustomer(req, res) {
  try {
    const fullName = typeof req.body.fullName === "string" ? req.body.fullName.trim() : "";
    const email = normalizeEmail(req.body.email);
    const phone = typeof req.body.phone === "string" && req.body.phone.trim() ? req.body.phone.trim() : null;
    const password = typeof req.body.password === "string" ? req.body.password : "";

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Full name, email, and password are required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Enter a valid email address" });
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const existingCustomer = await prisma.customer.findUnique({ where: { email } });

    if (existingCustomer) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const customer = await prisma.customer.create({
      data: {
        fullName,
        email,
        phone,
        passwordHash,
      },
    });

    return res.status(201).json({
      message: "Registration successful",
      token: generateCustomerToken(customer),
      customer: serializeCustomer(customer),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Customer registration failed",
      error: error.message,
    });
  }
}

export async function loginCustomer(req, res) {
  try {
    const email = normalizeEmail(req.body.email);
    const password = typeof req.body.password === "string" ? req.body.password : "";

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const customer = await prisma.customer.findUnique({ where: { email } });

    if (!customer || customer.status !== "active") {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, customer.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    return res.json({
      message: "Login successful",
      token: generateCustomerToken(customer),
      customer: serializeCustomer(customer),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Customer login failed",
      error: error.message,
    });
  }
}

export function getCurrentCustomer(req, res) {
  return res.json({ customer: req.customer });
}

export function logoutCustomer(_req, res) {
  return res.json({ message: "Logout successful" });
}

export async function updateCustomerProfile(req, res) {
  try {
    const fullName = typeof req.body.fullName === "string" ? req.body.fullName.trim() : "";
    const phone = typeof req.body.phone === "string" && req.body.phone.trim() ? req.body.phone.trim() : null;

    if (!fullName) {
      return res.status(400).json({ message: "Full name is required" });
    }

    const customer = await prisma.customer.update({
      where: { id: req.customer.id },
      data: {
        fullName,
        phone,
      },
    });

    return res.json({
      message: "Profile updated",
      customer: serializeCustomer(customer),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Profile update failed",
      error: error.message,
    });
  }
}

export async function changeCustomerPassword(req, res) {
  try {
    const currentPassword = typeof req.body.currentPassword === "string" ? req.body.currentPassword : "";
    const newPassword = typeof req.body.newPassword === "string" ? req.body.newPassword : "";
    const confirmPassword = typeof req.body.confirmPassword === "string" ? req.body.confirmPassword : "";

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "Current password, new password, and confirm password are required" });
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const customer = await prisma.customer.findUnique({ where: { id: req.customer.id } });

    if (!customer || customer.status !== "active") {
      return res.status(401).json({ message: "Customer account is not active" });
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, customer.passwordHash);

    if (!isCurrentPasswordValid) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.customer.update({
      where: { id: customer.id },
      data: { passwordHash },
    });

    return res.json({ message: "Password changed" });
  } catch (error) {
    return res.status(500).json({
      message: "Password change failed",
      error: error.message,
    });
  }
}
