const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

// import model
const Post = require("../../models/Post");
const Profile = require("../../models/Profile");
//Load validation
const validatePostInput = require("../../validation/post");

// @route   GET api/posts
// @desc    Get posts
// @access  Public

router.get("/", (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => {
      res.json(posts);
    })
    .catch(err => res.status(404).json({ nopostsfound: "No posts found" }));
});

// @route   GET api/posts/:id
// @desc    Get post by id
// @access  Public

router.get("/:id", (req, res) => {
  Post.findById(req.params.id)
    .then(post => {
      res.json(post);
    })
    .catch(err =>
      res.status(404).json({ nopostfound: "No post found with that ID" })
    );
});

// @route   GET api/posts/test
// @desc    Tests posts route
// @access  Public
router.get("/test", (req, res) => {
  res.json({ msg: "Posts Works" });
});

// @route   POST api/posts
// @desc    Create post
// @access  Private

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);
    //   Check validation
    if (!isValid) {
      // if any errors
      return res.status(404).json(errors);
    }
    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    });

    newPost.save().then(post => {
      res.json(post);
    });
  }
);

// @route   DELETE api/posts/:id
// @desc    Delete post
// @access  Private

router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user._id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          // Check for post owner
          //   console.log(post.user.toString() + "===" + req.user._id);
          if (post.user.toString() !== req.user._id.toString()) {
            return res
              .status(401)
              .json({ noauthorized: "User not authorized" });
          }

          // Delete
          post.remove().then(() => {
            res.json({ success: true });
          });
        })
        .catch(err => res.status(404).json({ postnotfound: "No post found" }));
    });
  }
);

// @route   POST api/posts/like/:id
// @desc    Like post
// @access  Private

router.post(
  "/like/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user._id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (
            post.likes.filter(
              like => like.user.toString() === req.user._id.toString()
            ).length > 0
          ) {
            return res
              .status(400)
              .json({ alreadyliked: "User already liked this post" });
          }
          post.likes.unshift({ user: req.user._id });
          post.save().then(post => {
            res.json(post);
          });
        })
        .catch(err => res.status(400).json({ postnotfound: "No post found" }));
    });
  }
);

// @route   POST api/posts/unlike/:id
// @desc    unlike post
// @access  Private

router.post(
  "/unlike/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user._id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (
            post.likes.filter(
              like => like.user.toString() === req.user._id.toString()
            ).length === 0
          ) {
            return res
              .status(400)
              .json({ notliked: "You have not yet liked this post" });
          }
          //   Get index
          const removeIndex = post.likes
            .map(item => item.user.toString())
            .indexOf(req.user._id);

          // Splice
          post.likes.splice(removeIndex, 1);

          // Save
          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(400).json({ postnotfound: "No post found" }));
    });
  }
);

module.exports = router;
