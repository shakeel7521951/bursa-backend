import Blog from "../models/Blogs.js";

export const addBlog = async (req, res) => {
  try {
    const { title, description, author } = req.body;
    const blogImage = req.file ? req.file.path : null;

    if (!title || !description || !author || !blogImage) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newBlog = new Blog({
      title,
      description,
      author,
      blogImage,
    });

    await newBlog.save();

    res.status(200).json({
      message: "Blog added successfully",
      blog: newBlog,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find();

    if (blogs.length === 0) {
      return res.status(404).json({ message: "No blogs found!" });
    }

    res.status(200).json({ blogs });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export const deleteBlog = async (req, res) => {
  try {
    const { blogId } = req.params;

    const blog = await Blog.findByIdAndDelete(blogId);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found!" });
    }

    res
      .status(200)
      .json({ message: "Blog deleted successfully", deletedBlog: blog });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export const updateBlog = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { title, author, description } = req.body;
    const blogImage = req.file ? req.file.path : null;

    if (!blogId) {
      return res.status(400).json({ message: "Blog ID is required" });
    }

    const blogData = { title, author, description };
    if (blogImage) blogData.blogImage = blogImage;

    const updatedBlog = await Blog.findByIdAndUpdate(blogId, blogData, {
      new: true,
      runValidators: true,
    });

    if (!updatedBlog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.status(200).json({ message: "Blog updated successfully", updatedBlog });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export const getSingleBlog = async (req, res) => {
  try {
    const { blogId } = req.params;
    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const postComment = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { commentText } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Please log in first" });
    }
    if (!commentText) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      blogId,
      { $push: { comments: { userId, text: commentText, date: new Date() } } },
      { new: true, runValidators: true }
    );

    if (!updatedBlog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res
      .status(200)
      .json({ message: "Comment added successfully", updatedBlog });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export const likeBlog = async (req, res) => {
  try {
    const { blogId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized. Please log in first" });
    }

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const hasLiked = blog.likes.includes(userId);

    if (hasLiked) {
      blog.likes = blog.likes.filter((id) => id.toString() !== userId);
      await blog.save();
      return res.status(200).json({ message: "Like removed", blog });
    } else {
      blog.likes.push(userId);
      await blog.save();
      return res.status(200).json({ message: "Blog liked", blog });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export const likeComment = async (req, res) => {
  try {
    const { blogId, commentId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized. Please log in first." });
    }

    const blog = await Blog.findById(blogId);
    if (!blog) {
      console.log("Blog not found");
      return res.status(404).json({ message: "Blog not found" });
    }

    console.log("Blog comments:", blog.comments);

    const comment = blog.comments.find((c) => c._id.toString() === commentId);
    if (!comment) {
      console.log("Comment not found");
      return res.status(404).json({ message: "Comment not found" });
    }

    const hasLiked = comment.likes.includes(userId);
    console.log("Has liked:", hasLiked);

    if (hasLiked) {
      comment.likes = comment.likes.filter((id) => id.toString() !== userId);
      await blog.save();
      return res.status(200).json({ message: "Like removed from comment", blog });
    } else {
      comment.likes.push(userId);
      await blog.save();
      return res.status(200).json({ message: "Comment liked", blog });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

