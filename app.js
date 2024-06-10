const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");



app.use(cors());
app.use(express.json());
app.use('/public', express.static(path.join(__dirname, 'public')));
const user = require("./routes/userRoute");
const product = require("./routes/ProductRoute");
const cart = require("./routes/CartRoute");
const address = require("./routes/AddressRoute");
const order = require("./routes/orderRoute");

app.use("/api/v1", user);
app.use("/api/v2", product);
app.use("/api/v3", cart);
app.use("/api/v4", address);
app.use("/api/v5", order);

module.exports = app;
