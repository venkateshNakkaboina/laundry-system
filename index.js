const express = require("express");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(bodyParser.json());

let orders = [];

// Price list
const priceList = {
  Shirt: 20,
  Pants: 30,
  Saree: 50
};

// Calculate total
function calculateTotal(garments) {
  let total = 0;
  garments.forEach(item => {
    const price = item.price || priceList[item.type] || 0;
    total += item.quantity * price;
  });
  return total;
}

// ROOT ROUTE
app.get("/", (req, res) => {
  res.send(`
    <h1>Laundry Management System 🚀</h1>
    <p>Available APIs:</p>
    <ul>
      <li>POST /orders</li>
      <li>GET /orders</li>
      <li>PUT /orders/:id/status</li>
      <li>GET /dashboard</li>
    </ul>
  `);
});

// CREATE ORDER
app.post("/orders", (req, res) => {
  const { customerName, phone, garments } = req.body;

  // Basic validation
  if (!customerName || !phone || !garments || garments.length === 0) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Calculate total
  const totalAmount = calculateTotal(garments);

  // Delivery date (+2 days)
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 2);

  const newOrder = {
    id: uuidv4(),
    customerName,
    phone,
    garments,
    totalAmount,
    status: "RECEIVED",
    estimatedDelivery: deliveryDate,
    createdAt: new Date()
  };

  orders.push(newOrder);
  res.json(newOrder);
});

// GET ORDERS (with filters)
app.get("/orders", (req, res) => {
  const { status, name, phone } = req.query;

  let filtered = orders;

  if (status) {
    filtered = filtered.filter(o => o.status === status);
  }

  if (name) {
    filtered = filtered.filter(o =>
      o.customerName.toLowerCase().includes(name.toLowerCase())
    );
  }

  if (phone) {
    filtered = filtered.filter(o => o.phone.includes(phone));
  }

  res.json(filtered);
});

// UPDATE STATUS
app.put("/orders/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ["RECEIVED", "PROCESSING", "READY", "DELIVERED"];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const order = orders.find(o => o.id === id);

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  order.status = status;
  res.json(order);
});

// DASHBOARD
app.get("/dashboard", (req, res) => {
  let totalRevenue = 0;

  let statusBreakdown = {
    RECEIVED: 0,
    PROCESSING: 0,
    READY: 0,
    DELIVERED: 0
  };

  orders.forEach(o => {
    totalRevenue += o.totalAmount;
    statusBreakdown[o.status]++;
  });

  const averageOrderValue = orders.length
    ? totalRevenue / orders.length
    : 0;

  res.json({
    totalOrders: orders.length,
    totalRevenue,
    averageOrderValue,
    statusBreakdown
  });
});

// START SERVER
// START SERVER
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

