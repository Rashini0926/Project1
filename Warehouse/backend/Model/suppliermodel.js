const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const supplySchema = new Schema({
  Id: {
    type: Number, //datatype
    unique: true,
    required: true, //validate
  },
  Name: {
    type: String,
    required: [true, "Supplier name is required"],
    trim: true,
    minlength: [3, "Supplier name must be at least 3 characters"],
    maxlength: [50, "Supplier name must be less than 50 characters"],
  },
  Person: {
    type: String,
    required: [true, "Contact person is required"],
    trim: true,
    minlength: [3, "Contact person must be at least 3 characters"],
    maxlength: [50, "Contact person must be less than 50 characters"],
  },
  ContactNumber: {
    type: String,
    required: true,
    minlength: [7, "Contact number must be at least 7 digits"],
    maxlength: [15, "Contact number must be at most 15 digits"],
    validate: {
    validator: function(v) {
      return /^\d+$/.test(v); // only digits allowed
    },
    message: props => `${props.value} is not a valid contact number!`
  },
  },
  Email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true, // auto lowercases email
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
  },
  Material: {
    type: String,
    required: [true, "Material is required"],
    trim: true,
    minlength: [2, "Material must be at least 2 characters"],
    maxlength: [100, "Material must be less than 100 characters"],
    
  },
  Status: {
    type: String,
    required: true,
    enum: [ "preferred" ,"active", "inactive", "blacklisted"], // restrict values
    default: "active",
  },
  Address: {
    type: String,
    required: [true, "Address is required"],
    trim: true,
    minlength: [5, "Address must be at least 5 characters"],
    maxlength: [200, "Address must be less than 200 characters"],
  },
});

module.exports = mongoose.model("suppliermodel", supplySchema);
