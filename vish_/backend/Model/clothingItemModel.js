// Model/clothingItemModel.js
import mongoose from "mongoose";

const Schema = mongoose.Schema;

// Schema for materials used in clothing items
const materialSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    trim: true
  },
  cost: {
    type: Number,
    required: true,
    min: 0
  }
});

// Schema for clothing items
const clothingItemSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    description: {
      type: String,
      trim: true
    },
    category: {
      type: String,
      trim: true
    },
    sizes: [{
      type: String,
      enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
    }],
    colors: [{
      type: String,
      trim: true
    }],
    materials: [materialSchema],
    inStock: {
      type: Boolean,
      default: true
    },
    stockQuantity: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

const ClothingItem = mongoose.model("ClothingItem", clothingItemSchema);

export default ClothingItem;
