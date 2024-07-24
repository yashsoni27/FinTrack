const mongoose = require("mongoose");

const InstitutionSchema = mongoose.Schema({
  institutionId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
  },
  userId: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }]
});

module.exports = mongoose.model("Institution", InstitutionSchema);
