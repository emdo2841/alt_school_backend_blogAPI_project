const express = require("express");
const blogRoute = express.Router();
const Blog  = require("../model/blog");
const bodyParser= require('body-parser')
const passport = require('passport');
const blogValidation = require('../validator/blog.validator')
const logger = require('../logger/logger')


function calculateReadingTime(body, averageReadingSpeed = 200) {
  // Count words in the body
  const words = body.split(/\s+/).filter((word) => word !== "").length;

  // Calculate reading time in minutes
  const readingTime = Math.round(words / averageReadingSpeed);

  return readingTime;
}

// blogRoute.get("/", (req, res) => {
//   Blog.find()
//     .then((blog) => {
//       logger.info('this fetch all the book');
//       res.send(blog);
//     })
//     .catch((err) => {
//       logger.error(err.message);
//       res.send(err);
//     });
// });

blogRoute.get('/', async (req, res) => {
  const { page = 1, limit = 10, state } = req.query;

  try {
      let query = {}; // Initialize empty query object

      // If state filter is provided, add it to the query
      if (state == 'published') {
          query.state = state;
      }

      // Paginate the results
      const blogs = await Blog.find(query)
          .skip((page - 1) * limit)
          .limit(parseInt(limit))
          .exec();

      // Count total number of blogs
      const totalBlogs = await Blog.countDocuments(query);

      logger.info('Fetched blogs successfully');
      // Return paginated results
      res.status(200).json({
          totalBlogs,
          totalPages: Math.ceil(totalBlogs / limit),
          currentPage: page,
          blogs
      });
  } catch (error) {
      logger.error('Error fetching blogs:', error.message);
      res.status(500).json({ error: 'Error fetching blogs', details: error.message });
  }
});

// this  is use to fetch the blog by id and also incrementing the read count
blogRoute.get('/:id', async (req, res) => {
  const blogId = req.params.id;

  try {
      // Find the blog post by ID
      const blog = await Blog.findById(blogId).populate('author');

      // If the blog post is found
      if (blog) {
          // Increment the read_count field by 1
          blog.read_count += 1;
          // Save the updated blog post
          await blog.save();
          logger.info('this fetch blog by id');
          // Send the blog post details as the response after saving
          res.status(200).json(blog);
      } else {
          // If the blog post is not found
          res.status(404).json({ error: 'Blog post not found' });
      }
  } catch (error) {
      // If there's an error during the process
      logger.error(err.message);
      res.status(500).json({ error: 'Error getting blog post details', details: error.message });
  }
});

// Define a route to get blog posts by author
blogRoute.get('/:authorName', async (req, res) => {
  const authorName = req.params.authorName;

  try {
    // Find blog posts by author name
    const blogs = await Blog.find({ author: authorName });

    // If blog posts are found
    if (blogs.length > 0) {
      res.status(200).json(blogs);
    } else {
      // If no blog posts are found
      res.status(404).json({ error: 'No blog posts found for the author' });
    }
  } catch (error) {
    // If there's an error during the process
    console.error('Error getting blog posts by author:', error);
    res.status(500).json({ error: 'Error getting blog posts by author', details: error.message });
  }
});

blogRoute.get('/:tag', async (req, res) => {
  const blogName = req.params.blogName;

  try {
    // Find blog posts by name or title
    const blogs = await Blog.find({ name: blogName });

    // If blog posts are found
    if (blogs.length > 0) {
      res.status(200).json(blogs);
    } else {
      // If no blog posts are found
      res.status(404).json({ error: 'No blog posts found with the given name' });
    }
  } catch (error) {
    // If there's an error during the process
    console.error('Error getting blog posts by name:', error);
    res.status(500).json({ error: 'Error getting blog posts by name', details: error.message });
  }
});

blogRoute.post("/", blogValidation, passport.authenticate('jwt', { session: false }), (req, res) => {
  const blog = req.body;
  // Set the time created to current date
  blog.timestamp = new Date();
  // Calculate reading time
  blog.reading_time = calculateReadingTime(blog.body);
  Blog.create(blog) // Create an article
    .then((blog) => {
      logger.info('blog succesfully created');
      res.status(201).send(blog);
    })
    .catch((err) => {
      logger.error(err.message);
      res.send(err);
    });
});
//  update state to publish
blogRoute.put("/:id", passport.authenticate('jwt', { session: false }), async (req, res) => {
  const articleId = req.params.id;
  const { state } = req.body;

  try {
    // Find the article by ID
    const article = await Blog.findById(articleId);

    // If the article is found
    if (article) {
      // Update the state to "published"
      article.state = state;

      // Save the updated article
      const updatedArticle = await article.save();
      logger.info('blog successfully updated');

      res.status(200).json({
        message: "Article state updated successfully",
        blog: updatedArticle,
      });
    } else {
      // If the article is not found
      res.status(404).json({ error: "Article not found" });
    }
  } catch (error) {
    // If there's an error during the update process
    logger.error(err.message);
    res.status(500).json({ error: "Error updating article state", });
  }
});
//route for updating the blog by the user
blogRoute.put("/update/:id", passport.authenticate('jwt', { session: false }), async (req, res) => {
  const blogId = req.params.id;
  const updatedBlogData = req.body; // New data for the blog post

  try {
    // Find the blog post by ID and update it
    const updatedBlog = await Blog.findByIdAndUpdate(
      blogId,
      updatedBlogData,
      { new: true } // Return the updated document
    );

    // If the blog post is found and updated successfully
    if (updatedBlog) {
      res
        .status(200)
        .json({ message: "Blog post updated successfully", blog: updatedBlog });
    } else {
      // If the blog post is not found
      res.status(404).json({ error: "Blog post not found" });
    }
  } catch (error) {
    // If there's an error during the update process
    logger.error(err.message);
    res
      .status(500)
      .json({ error: "Error updating blog post"});
  }
});

// Define a route to delete a blog post
blogRoute.delete("/:id", passport.authenticate('jwt', { session: false }), async (req, res) => {
  const blogId = req.params.id;

  try {
    // Find the blog post by ID and delete it
    const deletedBlog = await Blog.findByIdAndDelete(blogId);

    // If the blog post is found and deleted successfully
    if (deletedBlog) {
      res
        .status(200)
        .json({ message: "Blog post deleted successfully", blog: deletedBlog });
    } else {
      // If the blog post is not found
      res.status(404).json({ error: "Blog post not found" });
    }
  } catch (error) {
    // If there's an error during the delete process
    logger.error(err.message);
    res
      .status(500)
      .json({ error: "Error deleting blog post"});
  }
});

module.exports = blogRoute;
