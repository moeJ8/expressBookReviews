const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];
console.log(users);  // Add this to log the current users array
const isValid = (username)=>{ //returns boolean
  return users.some(user=> user.username === username)
};

const authenticatedUser = (username, password) => {
  const user = users.find(user => user.username === username);
  return user && user.password === password;
};


//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Both username and password are required" });
  }
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  // Generate a JWT token
  const accessToken = jwt.sign({ username }, "access", { expiresIn: 60 * 60 })
  // Save the token in session
  req.session.authorization = { accessToken };  // Store token under authorization
  console.log("Session after login:", req.session);  // Debugging log
  res.status(200).json({ message: "Login successful", accessToken });
});


// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { review } = req.query;

  // Check if user is authenticated
  if (!req.session.authorization) {
    return res.status(403).json({ message: "User not logged in" });
  }

  // Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;

  // Check if user is authenticated
  if (!req.session.authorization) {
    return res.status(403).json({ message: "User not logged in" });
  }

  // Verify the JWT token and extract the username
  const token = req.session.authorization['accessToken'];
  jwt.verify(token, "access", (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "User not authenticated" });
    }

    const username = decoded.username;

    // Check if the book exists
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Check if the review exists for this user
    if (books[isbn].reviews && books[isbn].reviews[username]) {
      // Delete the user's review
      delete books[isbn].reviews[username];
      return res.status(200).json({ message: "Review deleted successfully" });
    } else {
      return res.status(404).json({ message: "Review not found for this user" });
    }
  });
});

  // Verify the JWT token and extract the username
  const token = req.session.authorization['accessToken'];
  jwt.verify(token, "access", (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "User not authenticated" });
    }

    const username = decoded.username;

    if (!review) {
      return res.status(400).json({ message: "Review is required" });
    }
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }

    // If the book doesn't have a review section yet, initialize it as an empty object
    if (!books[isbn].reviews) {
      books[isbn].reviews = {};
    }

    // Check if the user already posted a review and update or add a new one
    books[isbn].reviews[username] = review;

    res.status(200).json({ message: "Review added/modified successfully" });
  });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
