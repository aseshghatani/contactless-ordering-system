const express = require("express");
const path = require("path");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const app = express();
require("./db/conn");

// Import models
const User = require("./models/user");
const Order = require('./models/Order');

// Create a dummy MenuItem model if it doesn't exist
// This is a temporary fix if you don't already have a MenuItem model defined
const mongoose = require('mongoose');
let MenuItem;
try {
  // Try to get the existing model
  MenuItem = mongoose.model('MenuItem');
} catch (e) {
  // If it doesn't exist, create it
  const menuItemSchema = new mongoose.Schema({
    name: String,
    price: Number,
    description: String,
    category: String,
    image: String
  });
  MenuItem = mongoose.model('MenuItem', menuItemSchema);
}

const port = process.env.PORT || 3000;
const static_path = path.join(__dirname, '../public');
app.use(express.static(static_path));

app.use(session({
  secret: "secretKey", // change this in production
  resave: false,
  saveUninitialized: true,
}));

app.use(express.urlencoded({ extended: false })); // for parsing form data
app.use(express.json());

app.set("view engine", "hbs"); //app. an instance of an Express application
app.get("/", (req, res) => {
  res.render("dashboard")
});
app.get("/signup", (req, res) => {
  res.render("sign_up");
});
app.get("/login", (req, res) => {
  res.render("login")
});
app.get("/user_dashboard", (req, res) => {
  const user = req.session.user;
  if (!req.session.user) {
    return res.redirect("/login");
  }
  res.render("user_dashboard", { user: req.session.user });
});

app.get("/menu", async (req, res) => {
  try {
    // Fetch all menu items from the database
    const menuItems = await MenuItem.find({}).sort({ category: 1 });
    
    // Group items by category for organization
    const categorizedMenu = {
      appetizer: menuItems.filter(item => item.category === 'appetizer'),
      main: menuItems.filter(item => item.category === 'main'),
      dessert: menuItems.filter(item => item.category === 'dessert'),
      beverage: menuItems.filter(item => item.category === 'beverage')
    };
    
    // Render the menu page with the menu items and user session
    res.render("menu", { 
      categorizedMenu,
      hasItems: menuItems.length > 0,
      user: req.session.user
    });
  } catch (err) {
    console.error('Error fetching menu items:', err);
    res.status(500).send("Error loading menu items");
  }
});

// Modified profile route to avoid the populate issue
app.get("/profile", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect("/login");
    }

    // Get orders without populate
    const orders = await Order.find({ userId: req.session.user.id }).sort({createdAt:-1});

    // Format the date using toLocaleDateString
    orders.forEach(order => {
      order.formattedDate = order.getFormattedDate();
      order.formattedTime = order.getFormattedTime();
      
      // Set the first item name
      if (order.items && order.items.length > 0) {
        order.firstItemName = order.items[0].name;
      } else {
        order.firstItemName = "No items in this order";
      }
    });

    res.render("profile", {
      user: req.session.user,
      orders: orders
    });
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).send("Error loading orders.");
  }
});

app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const newUser = new User({ name, email, password });
    await newUser.save();
    req.session.user = {
      name: newUser.name,
      id: newUser._id,
      email: newUser.email
    };

    res.status(201).redirect("/user_dashboard");

  } catch (error) {
    console.log(error);
    res.status(400).send("Registration failed");
  }
});

app.get("/editProfile", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  res.render("editProfile", { user: req.session.user });
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
      return res.send("Error logging out");
    }
    res.redirect("/");
  });
});

app.post("/update_profile", async (req, res) => {
  const { name, email } = req.body;
  const uid = req.session.user.id;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      uid,
      { name, email },
      { new: true }
    );

    // Update session data
    req.session.user = {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email
    };

    // Redirect to profile page
    res.redirect('/profile');
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).send("Something went wrong.");
  }
});

app.post('/orders', async (req, res) => {
  // Check if user is logged in
  if (!req.session.user || !req.session.user.id) {
    return res.status(401).json({ error: 'You must be logged in to place an order.' });
  }

  const { cart, tableNumber } = req.body;

  // Validate payload
  if (!Array.isArray(cart) || cart.length === 0) {
    return res.status(400).json({ error: 'Cart is empty.' });
  }
  if (!tableNumber) {
    return res.status(400).json({ error: 'Table number is required.' });
  }

  // Map into Order schema's shape
  const items = cart.map(item => ({
    menuItemId: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity
  }));
  const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  try {
    // Create & save order
    const order = new Order({
      userId: req.session.user.id,
      items,
      totalAmount,
      tableNumber
    });
    await order.save();

    // Reply with the new orderId
    res.status(201).json({
      message: 'Order placed successfully!',
      orderId: order._id
    });

  } catch (err) {
    console.error('Error placing order:', err);
    res.status(500).json({ error: 'Could not place order. Try again later.' });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email.trim() });

    if (!user) {
      return res.status(400).send("User not found");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send("Invalid password");
    }

    req.session.user = {
      name: user.name,
      id: user._id,
      email: user.email,
    };

    res.redirect("/user_dashboard");

  } catch (error) {
    res.status(400).send(error);
  }
});

// Add API route for order details
app.get('/api/orders/:id', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: 'You must be logged in to view order details.' });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if the order belongs to the logged-in user
    if (order.userId.toString() !== req.session.user.id) {
      return res.status(403).json({ error: 'You are not authorized to view this order' });
    }

    // Format the order data for the frontend
    const formattedOrder = {
      _id: order._id,
      
      totalAmount: order.totalAmount,
      tableNumber: order.tableNumber,
      orderDate: order.orderDate,
      status: order.status,
      items: order.items.map(item => ({
        product: {
          name: item.name,
          price: item.price
        },
        quantity: item.quantity
      }))
    };

    res.json(formattedOrder);
  } catch (err) {
    console.error('Error fetching order details:', err);
    res.status(500).json({ error: 'Could not fetch order details.' });
  }
});

app.listen(port, () => {
  console.log(`server is running at: http://localhost:${port}`);
});