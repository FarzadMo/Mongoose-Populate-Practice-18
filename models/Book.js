var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var bookSchema = new Schema({
  author: {
    type: String,
    required: "author name is required",
    trim: true
  },
  title: {
    type: String,
    required: "the title is required",
    trim: true
  }
});

var Book = mongoose.model("Book", bookSchema);

module.exports = Book;
