import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

// A cancelled order is not a sale, whichever way it was cancelled.
const CANCELLED = ["REJECTED", "CANCELLED", "REFUNDED"];
// Placed but not yet with the customer.
const YET_TO_SHIP = ["PENDING", "ACCEPTED", "CONFIRMED"];

// At or below this many left, a product is worth restocking.
const LOW_STOCK_THRESHOLD = 5;
const STOCK_LIST_LIMIT = 50;

// "Today" and "this month" are the shop's, i.e. Indian time.
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/** The instants today and this month began in Indian time. */
const istPeriodStarts = (now = new Date()) => {
  const ist = new Date(now.getTime() + IST_OFFSET_MS);
  const year = ist.getUTCFullYear();
  const month = ist.getUTCMonth();

  return {
    todayStart: new Date(Date.UTC(year, month, ist.getUTCDate()) - IST_OFFSET_MS),
    monthStart: new Date(Date.UTC(year, month, 1) - IST_OFFSET_MS),
  };
};

const sumSince = (start) => ({
  $sum: { $cond: [{ $gte: ["$createdAt", start] }, "$totalAmount", 0] },
});

/** Everything the admin dashboard shows, in one request. */
export const getDashboard = async (req, res) => {
  try {
    const { todayStart, monthStart } = istPeriodStarts();
    const stockFields = "name stock images";

    const [
      [sales],
      statusCounts,
      totalCustomers,
      newCustomersThisMonth,
      [repeat],
      lowStockCount,
      outOfStockCount,
      lowStock,
      outOfStock,
    ] = await Promise.all([
      Order.aggregate([
        { $match: { status: { $nin: CANCELLED } } },
        {
          $group: {
            _id: null,
            revenue: { $sum: "$totalAmount" },
            orders: { $sum: 1 },
            today: sumSince(todayStart),
            thisMonth: sumSince(monthStart),
          },
        },
      ]),
      Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      User.countDocuments({ role: "USER" }),
      User.countDocuments({ role: "USER", createdAt: { $gte: monthStart } }),
      // Customers with two or more orders that were not cancelled.
      Order.aggregate([
        { $match: { status: { $nin: CANCELLED } } },
        { $group: { _id: "$user", orders: { $sum: 1 } } },
        { $match: { orders: { $gte: 2 } } },
        { $count: "customers" },
      ]),
      Product.countDocuments({ stock: { $gt: 0, $lte: LOW_STOCK_THRESHOLD } }),
      Product.countDocuments({ stock: { $lte: 0 } }),
      Product.find({ stock: { $gt: 0, $lte: LOW_STOCK_THRESHOLD } })
        .select(stockFields)
        .sort({ stock: 1, name: 1 })
        .limit(STOCK_LIST_LIMIT)
        .lean(),
      Product.find({ stock: { $lte: 0 } })
        .select(stockFields)
        .sort({ name: 1 })
        .limit(STOCK_LIST_LIMIT)
        .lean(),
    ]);

    const countFor = (statuses) =>
      statusCounts
        .filter((row) => statuses.includes(row._id))
        .reduce((sum, row) => sum + row.count, 0);

    const revenue = sales?.revenue || 0;
    const soldOrders = sales?.orders || 0;

    const toStockRow = (product) => ({
      id: product._id,
      name: product.name,
      stock: product.stock,
      image: product.images?.[0]?.url || "",
    });

    res.status(200).json({
      sales: {
        totalRevenue: Math.round(revenue),
        today: Math.round(sales?.today || 0),
        thisMonth: Math.round(sales?.thisMonth || 0),
        averageOrderValue: soldOrders ? Math.round(revenue / soldOrders) : 0,
      },
      orders: {
        total: statusCounts.reduce((sum, row) => sum + row.count, 0),
        yetToShip: countFor(YET_TO_SHIP),
        shipped: countFor(["SHIPPED"]),
        delivered: countFor(["DELIVERED"]),
        cancelled: countFor(CANCELLED),
      },
      customers: {
        total: totalCustomers,
        newThisMonth: newCustomersThisMonth,
        repeat: repeat?.customers || 0,
      },
      stock: {
        lowStockThreshold: LOW_STOCK_THRESHOLD,
        lowStockCount,
        outOfStockCount,
        lowStock: lowStock.map(toStockRow),
        outOfStock: outOfStock.map(toStockRow),
      },
    });
  } catch (error) {
    console.error("getDashboard error:", error);
    res.status(500).json({ message: "Could not load the dashboard" });
  }
};

/* ------------------------------------------------------------------ *
 * CUSTOMERS
 * ------------------------------------------------------------------ */

// Per customer: how many orders that were not cancelled, and their value.
const withOrderTotals = [
  {
    $lookup: {
      from: "orders",
      let: { userId: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$user", "$$userId"] },
            status: { $nin: CANCELLED },
          },
        },
        {
          $group: {
            _id: null,
            orders: { $sum: 1 },
            spent: { $sum: "$totalAmount" },
          },
        },
      ],
      as: "orderTotals",
    },
  },
  {
    $addFields: {
      orderCount: { $ifNull: [{ $first: "$orderTotals.orders" }, 0] },
      totalSpent: { $ifNull: [{ $first: "$orderTotals.spent" }, 0] },
    },
  },
];

/**
 * Customer list. `filter` matches the dashboard tiles: "new" (joined this
 * month) or "repeat" (two or more orders); anything else lists everyone.
 */
export const getCustomers = async (req, res) => {
  try {
    const { filter } = req.query;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));

    const match = { role: "USER" };
    if (filter === "new") {
      match.createdAt = { $gte: istPeriodStarts().monthStart };
    }

    const [result] = await User.aggregate([
      { $match: match },
      ...withOrderTotals,
      ...(filter === "repeat" ? [{ $match: { orderCount: { $gte: 2 } } }] : []),
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          customers: [
            { $skip: (page - 1) * limit },
            { $limit: limit },
            {
              $project: {
                name: 1,
                email: 1,
                phone: 1,
                createdAt: 1,
                orderCount: 1,
                totalSpent: 1,
              },
            },
          ],
          total: [{ $count: "count" }],
        },
      },
    ]);

    const totalCustomers = result.total[0]?.count || 0;

    res.status(200).json({
      customers: result.customers,
      totalCustomers,
      totalPages: Math.max(1, Math.ceil(totalCustomers / limit)),
      currentPage: page,
    });
  } catch (error) {
    console.error("getCustomers error:", error);
    res.status(500).json({ message: "Could not load customers" });
  }
};

const CUSTOMER_ORDERS_LIMIT = 100;

/** One customer: their details, saved addresses and orders, newest first. */
export const getCustomer = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const [customer, orders] = await Promise.all([
      User.findOne({ _id: req.params.id, role: "USER" })
        .select("name email phone isActive addresses createdAt")
        .lean(),
      Order.find({ user: req.params.id })
        .select("orderNumber createdAt status totalAmount isPaid paymentMethod items")
        .sort({ createdAt: -1 })
        .limit(CUSTOMER_ORDERS_LIMIT)
        .lean(),
    ]);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const counted = orders.filter((order) => !CANCELLED.includes(order.status));

    res.status(200).json({
      customer,
      orderCount: counted.length,
      totalSpent: Math.round(
        counted.reduce((sum, order) => sum + order.totalAmount, 0)
      ),
      orders: orders.map((order) => ({
        _id: order._id,
        orderNumber: order.orderNumber,
        createdAt: order.createdAt,
        status: order.status,
        totalAmount: order.totalAmount,
        isPaid: order.isPaid,
        paymentMethod: order.paymentMethod,
        itemCount: order.items.length,
      })),
    });
  } catch (error) {
    console.error("getCustomer error:", error);
    res.status(500).json({ message: "Could not load customer" });
  }
};
