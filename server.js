const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');

// Initialize the Express app
const app = express();
const port = 5000;

// Enable CORS
app.use(cors());

// Middleware to parse JSON request bodies
app.use(express.json());

// MongoDB connection string (use MongoDB Atlas or local connection string)
const mongoURI = 'mongodb+srv://abhi:abhi0508@cluster0.3vnr9w1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error: ', err));

// Define a User schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  country: { type: String, required: true },
});

// Create a User model based on the schema
const User = mongoose.model('User', userSchema);

// Route for user signup
app.post('/api/signup', async (req, res) => {
  const { name, email, password, country } = req.body;

  if (!name || !email || !password || !country) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Check if the user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // Hash the password before saving it to the database
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create and save a new user
  const newUser = new User({ name, email, password: hashedPassword, country });

  try {
    await newUser.save();
    res.status(201).json({ message: 'Account created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving user to database' });
  }
});

// Route for user login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  // Find the user by email
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Compare the entered password with the stored hashed password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  res.status(200).json({
    message: 'Login successful',
    user: { email: user.email, name: user.name, country: user.country },
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
