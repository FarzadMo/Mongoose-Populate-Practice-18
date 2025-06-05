var express = require("express");
var mongoose = require("mongoose");
var db = require("./models");

var PORT = 3000;

var app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

mongoose.connect("mongodb://localhost/populate", { useNewUrlParser: true });

db.Library.create({ name: "Campus Library" })
  .then(function(dbLibrary) {
    console.log(dbLibrary);
  })
  .catch(function(err) {
    console.log(err);
  });

app.post("/submit", function(req, res) {
  db.Book.create(req.body)
    .then(function(dbbook) {
      return db.Library.findOneAndUpdate(
        {},
        { $push: { books: dbbook._id } },
        { new: true }
      );
    })
    .then(function(dbLibrary) {
      res.json(dbLibrary);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.get("/books", function(req, res) {
  db.Book.find({})
    .then(function(dbBook) {
      res.json(dbBook);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.get("/library", function(req, res) {
  db.Library.find({})
    .then(function(dbLibrary) {
      res.json(dbLibrary);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.get("/populated", function(req, res) {
  db.Library.find({})
    .populate("books")
    .then(function(dbLibrary) {
      res.json(dbLibrary);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.listen(PORT, function() {
  console.log("app is listening on " + PORT);
});
