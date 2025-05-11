import express from "express";
import auth from "../middlewares/AuthMiddleWare.js";
import {
  addBlog,
  deleteBlog,
  getAllBlogs,
  getSingleBlog,
  likeBlog,
  likeComment,
  postComment,
  updateBlog,
} from "../controller/blogController.js";
import upload from "../middlewares/multerConfig.js";

const router = express.Router();

// Blog Routes
router.post("/add-blog",upload.single('blogImage'), auth, addBlog);
router.get("/get-all-blogs", getAllBlogs);
router.delete("/delete-blog/:blogId", auth, deleteBlog);
router.put("/update-blog/:blogId", upload.single('blogImage'), auth, updateBlog);
router.get('/get-single-blog/:blogId',getSingleBlog);
// Comment Routes
router.post("/add-comment/:blogId", auth, postComment);
router.put("/blog/:blogId/like", auth, likeBlog);
router.put("/blogs/:blogId/comments/:commentId/like", auth, likeComment);
export default router;