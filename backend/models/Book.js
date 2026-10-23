const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    isbn: { type: String, required: true, unique: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    availableQuantity: { type: Number, required: true, min: 0 },
    description: { type: String, default: '' },
    publishedYear: { type: Number, min: 1900 },
    coverImage: { type: String, default: '' },
  },
  { timestamps: true }
);

bookSchema.pre('save', function () {
  if (this.availableQuantity == null && this.quantity) {
    this.availableQuantity = this.quantity;
  }

  if (this.availableQuantity > this.quantity) {
    this.availableQuantity = this.quantity;
  }

  if (this.availableQuantity < 0) {
    this.availableQuantity = 0;
  }
});

module.exports = mongoose.model('Book', bookSchema);
