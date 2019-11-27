var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var librarySchema = new Schema({
  name: {
    type: String,
    trim: true
  },

  books: [
    {
      ref: "Book",
      type: Schema.Types.ObjectId
    }
  ]
});

var Library = mongoose.model("Library", librarySchema);

module.exports = Library;
