const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require("axios");

public_users.post("/register", (req,res) => {
  const { username, password } = req.body;
  // Check if the username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Both username and password are required" });
  }

  // Check if the username already exists
  if (users.some(user => user.username === username)) {
    return res.status(400).json({ message: "Username already exists" });
  }

  // Register the new user by adding to the users array
  users.push({ username, password });

  res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  
  res.status(200).send(JSON.stringify(books, null, 2)); // JSON.stringify with indentation
});
public_users.get('/async-books', async function (req, res) {
  try {
    const response = await axios.get('http://localhost:5005/');
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({ message: "Error fetching books" });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const {isbn} = req.params;

  if (books[isbn]){
    res.status(200).json(books[isbn]); // Return the book details
  } else {
    res.status(404).json({ message: "Book not found" }); // Return an error if the book doesn't exist
}
  
 });

 public_users.get('/async-isbn/:isbn', async function (req, res) {
  try {
    const { isbn } = req.params;
    const response = await axios.get(`http://localhost:5005/isbn/${isbn}`);
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching book by ISBN:", error);
    res.status(500).json({ message: "Error fetching book by ISBN" });
  }
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const {author} = req.params;
  const booksByAuthor = [];

  for(let key in books){
    if(books[key].author.toLowerCase() === author.toLocaleLowerCase()){
      booksByAuthor.push(books[key]);
    }
  }
  if (booksByAuthor.length>0){
    res.status(200).json(booksByAuthor);
  }else {
    res.status(404).json({ message: "No books found by this author" });  // Return an error if no books are found
  }
});

public_users.get('/async-author/:author', async function (req, res) {
  try {
    const { author } = req.params;
    const response = await axios.get(`http://localhost:5005/author/${author}`);
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching books by author:", error);
    res.status(500).json({ message: "Error fetching books by author" });
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const { title } = req.params;  // Extract the title from the request parameters
    const booksByTitle = [];
    for (let key in books) {
      if (books[key].title.toLowerCase().includes(title.toLowerCase())) {
          booksByTitle.push(books[key]);  // Add the book to the result array if the title matches
      }
  }
  // Check if we found any books with the given title
  if (booksByTitle.length > 0) {
    res.status(200).json(booksByTitle);  // Return the books with the title
    } else {
        res.status(404).json({ message: "No books found with this title" });  
    }
});

public_users.get('/async-title/:title', async (req, res) => {
  const { title } = req.params;

  try {
    const booksByTitle = [];
    await new Promise(resolve => {
      for (let key in books) {
        if (books[key].title.toLowerCase().includes(title.toLowerCase())) {
          booksByTitle.push(books[key]);
        }
      }
      resolve();
    });

    if (booksByTitle.length > 0) {
      res.status(200).json(booksByTitle);
    } else {
      res.status(404).json({ message: "No books found with this title" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error retrieving books by title", error });
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const { isbn } = req.params;  // Extract the ISBN from the request parameters
  if(books[isbn]){
    const reviews = books[isbn].reviews; // Get the reviews for the book

    // Check if the book has reviews
    if(Object.keys(reviews).length>0){
      res.status(200).json(reviews); // Return the reviews if they exist
    } else{
      res.status(404).json({ message: "No reviews available for this book" });  // Return an error if no reviews exist
    }
  } else {
    res.status(404).json({ message: "Book not found" });  // Return an error if the book doesn't exist
  }
  
});

module.exports.general = public_users;

