import Blog from "../models/Blogs.js";

export const addBlog = async (req, res) => {
  try {
    const { title, description, author } = req.body;
    const blogImage = req.file ? req.file.path : null;

    if (!title || !description || !author || !blogImage) {
      return res.status(400).json({ message: "Toate câmpurile sunt obligatorii" });
    }

    const newBlog = new Blog({
      title,
      description,
      author,
      blogImage,
    });

    await newBlog.save();

    res.status(200).json({
      message: "Blogul a fost adăugat cu succes",
      blog: newBlog,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Eroare internă a serverului", error: error.message });
  }
};

export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find();

    if (blogs.length === 0) {
      return res.status(404).json({ message: "Niciun blog găsit!" });
    }

    res.status(200).json({ blogs });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Eroare internă a serverului", error: error.message });
  }
};

export const deleteBlog = async (req, res) => {
  try {
    const { blogId } = req.params;

    const blog = await Blog.findByIdAndDelete(blogId);

    if (!blog) {
      return res.status(404).json({ message: "Blogul nu a fost găsit!" });
    }

    res
      .status(200)
      .json({ message: "Blogul a fost șters cu succes", deletedBlog: blog });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Eroare internă a serverului", error: error.message });
  }
};

export const updateBlog = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { title, author, description } = req.body;
    const blogImage = req.file ? req.file.path : null;

    if (!blogId) {
      return res.status(400).json({ message: "ID-ul blogului este necesar" });
    }

    const blogData = { title, author, description };
    if (blogImage) blogData.blogImage = blogImage;

    const updatedBlog = await Blog.findByIdAndUpdate(blogId, blogData, {
      new: true,
      runValidators: true,
    });

    if (!updatedBlog) {
      return res.status(404).json({ message: "Blogul nu a fost găsit" });
    }

    res.status(200).json({ message: "Blogul a fost actualizat cu succes", updatedBlog });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Eroare internă a serverului", error: error.message });
  }
};

export const getSingleBlog = async (req, res) => {
  try {
    const { blogId } = req.params;
    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).json({ message: "Blogul nu a fost găsit" });
    }

    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ message: "Eroare server", error: error.message });
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
        .json({ message: "Neautorizat: Vă rugăm să vă autentificați mai întâi" });
    }
    if (!commentText) {
      return res.status(400).json({ message: "Textul comentariului este necesar" });
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      blogId,
      { $push: { comments: { userId, text: commentText, date: new Date() } } },
      { new: true, runValidators: true }
    );

    if (!updatedBlog) {
      return res.status(404).json({ message: "Blogul nu a fost găsit" });
    }

    res
      .status(200)
      .json({ message: "Comentariu adăugat cu succes", updatedBlog });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Eroare internă a serverului", error: error.message });
  }
};

export const likeBlog = async (req, res) => {
  try {
    const { blogId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res
        .status(401)
        .json({ message: "Neautorizat. Vă rugăm să vă autentificați mai întâi" });
    }

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: "Blogul nu a fost găsit" });
    }

    const hasLiked = blog.likes.includes(userId);

    if (hasLiked) {
      blog.likes = blog.likes.filter((id) => id.toString() !== userId);
      await blog.save();
      return res.status(200).json({ message: "Like eliminat", blog });
    } else {
      blog.likes.push(userId);
      await blog.save();
      return res.status(200).json({ message: "Blogul a fost apreciat", blog });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Eroare internă a serverului", error: error.message });
  }
};

export const likeComment = async (req, res) => {
  try {
    const { blogId, commentId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res
        .status(401)
        .json({ message: "Neautorizat. Vă rugăm să vă autentificați mai întâi." });
    }

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: "Blogul nu a fost găsit" });
    }

    const comment = blog.comments.find((c) => c._id.toString() === commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comentariul nu a fost găsit" });
    }

    const hasLiked = comment.likes.includes(userId);

    if (hasLiked) {
      comment.likes = comment.likes.filter((id) => id.toString() !== userId);
      await blog.save();
      return res.status(200).json({ message: "Like eliminat de la comentariu", blog });
    } else {
      comment.likes.push(userId);
      await blog.save();
      return res.status(200).json({ message: "Comentariu apreciat", blog });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Eroare internă a serverului", error: error.message });
  }
};
