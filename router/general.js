const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const app = express();
app.use(express.json());
const getBooks = async () => books;
const getBookByIsbn = async (isbn) => books[isbn];
const getBooksByAuthor = async (author) =>
  Object.entries(books)
    .filter(([, book]) => book.author.toLowerCase() === author.toLowerCase())
    .reduce((acc, [isbn, book]) => {
      acc[isbn] = book;
      return acc;
    }, {});
const getBooksByTitle = async (title) =>
  Object.entries(books)
    .filter(([, book]) => book.title.toLowerCase() === title.toLowerCase())
    .reduce((acc, [isbn, book]) => {
      acc[isbn] = book;
      return acc;
    }, {});
const getReviewsByIsbn = async (isbn) => {
  const book = books[isbn];
  return book ? book.reviews : undefined;
};


public_users.post("/register", (req,res) => {
  const username = ((req.body && req.body.username) || (req.query && req.query.username) || "").trim();
  const password = ((req.body && req.body.password) || (req.query && req.query.password) || "").trim();

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (isValid(username)) {
    return res.status(409).json({ message: "User already exists" });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  const allBooks = await getBooks();
  return res.status(200).json(allBooks);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  const book = await getBookByIsbn(isbn);

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  return res.status(200).json(book);
 });
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;
  const authorBooks = await getBooksByAuthor(author);

  return res.status(200).json(authorBooks);
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;
  const titleBooks = await getBooksByTitle(title);

  return res.status(200).json(titleBooks);
});

//  Get book review
public_users.get('/review/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  const reviews = await getReviewsByIsbn(isbn);

  if (!reviews) {
    return res.status(404).json({ message: "Book not found" });
  }

  return res.status(200).json(reviews);
});

module.exports.general = public_users;
