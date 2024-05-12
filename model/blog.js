const mongoose = require('mongoose');
const { wordCountToReadingTime } = require('../utility/readingTimeCalculator');


  const Schema = mongoose.Schema
  // Define schema for Blog/Article
  const blogSchema = new Schema({
    title: {
      type: String,
      required: true,
      unique: true
    },
    description: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Reference to the 'User' model
        required: false
    },
    state: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft' // Default value is set to 'draft'
    },
    read_count: {
      type: Number,
      default: 0
    },
    reading_time: String,
    tags: [String],
    body: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  });
  // Define a pre-save middleware to auto-increment the read_count field
blogSchema.pre('save', async function (next) {
  // Only auto-increment if the document is new (i.e., being created)
  if (this.isNew) {
      try {
          // Find the highest existing read_count value
          const highestReadCount = await this.constructor.findOne({}, 'read_count').sort({ read_count: -1 }).limit(1);
          // Increment the read_count by 1 or set to 1 if no documents exist yet
          this.read_count = highestReadCount ? highestReadCount.read_count + 1 : 1;
      } catch (error) {
          return next(error);
      }
  }
  next();
});
// Define a pre-save middleware to calculate reading time based on body text
blogSchema.pre('save', function (next) {
  // Calculate word count from body text
  const wordCount = this.body.split(/\s+/).length;
  // Calculate reading time based on word count
  this.reading_time = wordCountToReadingTime(wordCount); // You need to implement wordCountToReadingTime function
  next();
});

// Define a virtual field to combine first_name and last_name
blogSchema.virtual('authorName').get(function () {
  // Access the first_name and last_name fields from the referenced User model
  return `${this.author.first_name} ${this.author.last_name}`;
});

 
  
  // Create model for Blog/Article
  const Blog = mongoose.model("article", blogSchema);
  
  module.exports = Blog; 