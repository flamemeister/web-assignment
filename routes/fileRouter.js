const express = require('express');
const exceljs = require('exceljs');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

function fileRouter(Book) {
  router.post('/upload', upload.any(), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    try {
      const workbook = new exceljs.Workbook(); 
      const buffer = req.file.buffer;
      await workbook.xlsx.load(buffer); 

      const worksheet = workbook.getWorksheet(1);

      const books = [];

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber !== 1) {
          const [title, author, genre, publishYear, pagesCount, price] = row.values;

          const book = new Book({
            title,
            author,
            genre,
            publishYear,
            pagesCount,
            price,
          });

          books.push(book);
        }
      });

      await Book.insertMany(books);

      return res.status(200).json({ message: 'File uploaded successfully.' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error processing the file.' });
    }
  });


  router.get('/download', async (req, res) => {
    try {
      const books = await Book.find({}, { _id: 0, __v: 0 }); 

      const workbook = new exceljs.Workbook();
      const worksheet = workbook.addWorksheet('Books');

      worksheet.addRow(['Title', 'Author', 'Genre', 'Publish Year', 'Pages Count', 'Price']);

      books.forEach((book) => {
        const { title, author, genre, publishYear, pagesCount, price } = book;
        worksheet.addRow([title, author, genre, publishYear, pagesCount, price]);
      });

      const buffer = await workbook.xlsx.writeBuffer();
      res.attachment('books.xlsx');
      res.send(buffer);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error fetching data for download.' });
    }
  });

  return router;
}

module.exports = fileRouter;
