var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var checkoutSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  book: { type: Schema.Types.ObjectId, ref: "Book", required: true },
  dueDate: Date,
  returned: { type: Boolean, default: false }
});

var Checkout = mongoose.model("Checkout", checkoutSchema);
module.exports = Checkout;
