var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");
var Schema = mongoose.Schema;

var userSchema = new Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true }
});

userSchema.pre("save", function(next) {
  if (!this.isModified("password")) return next();
  this.password = bcrypt.hashSync(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function(pass, cb) {
  bcrypt.compare(pass, this.password, cb);
};

var User = mongoose.model("User", userSchema);
module.exports = User;
