var express = require("express");
var mongoose = require("mongoose");
var session = require("express-session");
require("dotenv").config();

var db = require("./models");

var PORT = process.env.PORT || 3000;

var app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "librarysecret",
    resave: false,
    saveUninitialized: false
  })
);

app.use(express.static("public"));

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/populate", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// seed a library if none exist
db.Library.findOne({}).then(function(found) {
  if (!found) {
    db.Library.create({ name: "Campus Library" }).catch(function(err) {
      console.log(err);
    });
  }
});

function isAuth(req, res, next) {
  if (req.session.userId) return next();
  res.status(401).json({ message: "unauthorized" });
}

// Authentication routes
app.post("/register", function(req, res) {
  db.User.create(req.body)
    .then(function() {
      res.json({ message: "registered" });
    })
    .catch(function(err) {
      res.status(400).json(err);
    });
});

app.post("/login", function(req, res) {
  db.User.findOne({ username: req.body.username }).then(function(user) {
    if (!user) return res.status(400).json({ message: "invalid" });
    user.comparePassword(req.body.password, function(err, match) {
      if (match) {
        req.session.userId = user._id;
        res.json({ message: "logged in" });
      } else {
        res.status(400).json({ message: "invalid" });
      }
    });
  });
});

app.post("/logout", function(req, res) {
  req.session.destroy(function() {
    res.json({ message: "logged out" });
  });
});

// Book routes
app.post("/books", isAuth, function(req, res) {
  db.Book.create(req.body)
    .then(function(dbBook) {
      return db.Library.findOneAndUpdate(
        {},
        { $push: { books: dbBook._id } },
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

app.put("/books/:id", isAuth, function(req, res) {
  db.Book.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then(function(book) {
      res.json(book);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.delete("/books/:id", isAuth, function(req, res) {
  db.Book.findByIdAndDelete(req.params.id)
    .then(function() {
      res.json({ message: "deleted" });
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Library routes
app.get("/library", function(req, res) {
  db.Library.find({})
    .then(function(dbLibrary) {
      res.json(dbLibrary);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.post("/library", isAuth, function(req, res) {
  db.Library.create(req.body)
    .then(function(lib) {
      res.json(lib);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.put("/library/:id", isAuth, function(req, res) {
  db.Library.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then(function(lib) {
      res.json(lib);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.delete("/library/:id", isAuth, function(req, res) {
  db.Library.findByIdAndDelete(req.params.id)
    .then(function() {
      res.json({ message: "deleted" });
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Populated library
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

// Checkout routes
app.post("/checkout", isAuth, function(req, res) {
  var due = req.body.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  db.Checkout.create({
    user: req.session.userId,
    book: req.body.bookId,
    dueDate: due
  })
    .then(function(checkout) {
      res.json(checkout);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.post("/return/:id", isAuth, function(req, res) {
  db.Checkout.findByIdAndUpdate(
    req.params.id,
    { returned: true },
    { new: true }
  )
    .then(function(checkout) {
      res.json(checkout);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.get("/checkout", isAuth, function(req, res) {
  db.Checkout.find({ user: req.session.userId })
    .populate("book")
    .then(function(list) {
      res.json(list);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.listen(PORT, function() {
  console.log("app is listening on " + PORT);
});
