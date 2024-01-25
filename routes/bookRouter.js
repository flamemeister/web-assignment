const express = require('express');
const bookController = require('../controllers/bookController');
const Author = require('../models/authorModel');
const Genre = require('../models/genreModel');

function routes(Book) {
  const bookRouter = express.Router();
  const controller = bookController(Book);

  bookRouter.route('/books')
  .get(controller.get)
  .post(async (req, res) => {
    try {
      const { title, author, genre, publishYear, pagesCount, price } = req.body;

      // Split author into name and surname
      const [authorName, authorSurname] = author.split(' ');

      // Find or create the author based on both name and surname
      let authorObj = await Author.findOne({ name: authorName, surname: authorSurname });

      if (!authorObj) {
        authorObj = new Author({ name: authorName, surname: authorSurname });
        await authorObj.save();
      }

      let genreObj = await Genre.findOne({ name: genre });
      if (!genreObj) {
        genreObj = new Genre({ name: genre });
        await genreObj.save();
      }

      const book = new Book({
        title,
        author: authorObj._id,
        genre: genreObj._id,
        publishYear,
        pagesCount,
        price,
      });

      await book.save();
      res.status(201).json(book);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  bookRouter.use('/books/:bookId', async (req, res, next) => {
    try {
      const book = await Book.findById(req.params.bookId)
        .populate('author')  
        .populate('genre');   

      if (!book) {
        return res.sendStatus(404);
      }

      req.book = book;
      return next();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  bookRouter.route('/books/:bookId')
    .get((req, res) => {
      const returnBook = req.book.toJSON();
      returnBook.links = {};
      const genre = returnBook.genre.name.replace(' ', '%20');
      returnBook.links.FilterByThisGenre = `http://${req.headers.host}/api/books?genre=${genre}`;
      res.json(returnBook);
    })
    .put(async (req, res) => {
      const { book } = req;
      book.title = req.body.title;
      book.author = req.body.author;
      book.genre = req.body.genre;

      try {
        let authorObj = await Author.findOne({ name: req.body.author });
        if (!authorObj) {
          authorObj = new Author({ name: req.body.author });
          await authorObj.save();
        }


        let genreObj = await Genre.findOne({ name: req.body.genre });
        if (!genreObj) {
          genreObj = new Genre({ name: req.body.genre });
          await genreObj.save();
        }

        book.author = authorObj._id;
        book.genre = genreObj._id;

        await book.save();
        res.json(book);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    })
    .patch((req, res) => {
      const { book } = req;
      if (req.body._id) delete req.body._id;
      Object.entries(req.body).forEach(item => book[item[0]] = item[1]);
      req.book.save((err) => {
        if (err) return res.send(err);
        return res.json(book);
      });
    })
    .delete((req, res) => {
      req.book.remove((err) => {
        if (err) return res.send(err);
        return res.sendStatus(204);
      });
    });

  return bookRouter;
}

module.exports = routes;
