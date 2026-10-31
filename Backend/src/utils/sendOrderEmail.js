import nodemailer from "nodemailer";
import Setting, { ORDER_EMAIL_KEY } from "../models/Setting.js";

export const isEmailConfigured = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

const escapeHtml = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]
  );

const buildHtml = (order) => {
  const address = order.shippingAddress || {};
  const addressText = [
    address.fullName,
    address.house,
    address.street,
    address.landmark,
    address.city,
    address.district,
    address.state,
    address.pincode,
    address.country,
    address.phone,
  ]
    .filter(Boolean)
    .map(escapeHtml)
    .join("<br>");

  const rows = order.items
    .map(
      (item) =>
        `<tr><td style="padding:4px 12px 4px 0">${escapeHtml(item.name)}</td>` +
        `<td style="padding:4px 12px 4px 0">x${escapeHtml(item.quantity)}</td>` +
        `<td style="padding:4px 0">₹${escapeHtml(item.price)}</td></tr>`
    )
    .join("");

  const payment =
    order.paymentMethod === "COD" ? "Cash on Delivery" : "Paid online";
  const remark = order.adminRemark
    ? `<p style="color:#b91c1c"><b>Attention:</b> ${escapeHtml(order.adminRemark)}</p>`
    : "";

  return `
    <h2>New order ${escapeHtml(order.orderNumber)}</h2>
    ${remark}
    <p><b>Total:</b> ₹${escapeHtml(order.totalAmount)}<br>
    <b>Payment:</b> ${payment}${
      order.coupon ? `<br><b>Coupon:</b> ${escapeHtml(order.coupon)}` : ""
    }</p>
    <table style="border-collapse:collapse">${rows}</table>
    <p><b>Ship to:</b><br>${addressText}</p>
  `;
};

// Best effort: the order is already placed, so a mail problem must never reach checkout.
export const notifyNewOrder = async (order) => {
  try {
    // Read on every order so a saved change applies from the next order on.
    const setting = await Setting.findOne({ key: ORDER_EMAIL_KEY });
    const to = setting?.value;
    if (!to) return;

    if (!isEmailConfigured()) {
      console.error(`Order ${order.orderNumber} alert not sent: SMTP is not configured`);
      return;
    }

    const port = Number(process.env.SMTP_PORT) || 587;
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    });

    await transport.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to,
      subject: `New order ${order.orderNumber} - ₹${order.totalAmount}`,
      html: buildHtml(order),
    });
  } catch (error) {
    console.error(`Order ${order?.orderNumber} alert failed:`, error.message);
  }
};
