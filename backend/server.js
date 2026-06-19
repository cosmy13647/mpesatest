require("dotenv").config();
const express = require("express");
app.use(cors({
  origin: [
    'mpesatest.vercel.app',
    'http://localhost:5173'
  ],
  credentials: true
}));

const { connectDB } = require("./src/config/db");
console.log("DEBUG: About to load mpesaRoutes...");
const path = require('path');
const routePath = path.resolve('./src/routes/routes');
console.log("DEBUG: Routes absolute path:", routePath);
const mpesaRoutes = require("./src/routes/routes");
console.log("DEBUG: mpesaRoutes loaded, mpesaRoutes=", typeof mpesaRoutes, Object.keys(mpesaRoutes).slice(0, 3));
console.log("DEBUG: mpesaRoutes loaded successfully");

console.log("Starting M-Pesa server...");
console.log("MPESA ROUTES LOADED");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.error(`[STDERR] ${req.method} ${req.path}`);
  next();
});

// Connect PostgreSQL
connectDB();

// Test route
app.get("/", (req, res) => {
res.send("M-Pesa Backend Running 🚀");
});

// M-Pesa routes
app.use("/api/mpesa", mpesaRoutes);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
console.log(`Server running on http://localhost:${PORT}`);
});
