const User = require("../models/user");
const Question = require("../models/question");
const router = require("express").Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
const { mongo } = require("mongoose");
const { ensureAuthenticated } = require("../config/auth");

router.get("/", ensureAuthenticated, async (req, res) => {
  res.render("contest.ejs", {
    name: req.user.name,
  });
});

router.get("/questions", ensureAuthenticated, async (req, res) => {
  User.findOne({ email: req.user.email }).then((user) => {
    if (
      typeof user.questions == null ||
      typeof user.questions == undefined ||
      user.questions.length == 0
    ) {
      Question.find({})
        .limit(10)
        .then((questions) => {
          User.findOne({ email: req.user.email }).then((user) => {
            user.questions = questions;
            user
              .save()
              .then(() => {
                res.send({questions:questions,solved:user.solved});
              })
              .catch((err) => res.sendStatus(500));
          });
        })
        .catch((err) => {
          res.sendStatus(500);
        });
    } else {
      res.send({questions:user.questions,solved:user.solved});
    }
  });
});

router.post("/success", function (req, res) {
  let { questionIndex } = req.body;
  questionIndex-=1;
  User.findOne({ email: req.user.email })
    .then((user) => {
      if (!user.solved.includes(parseInt(questionIndex))) {
        user.solved.push(parseInt(questionIndex));
      }
      user
        .save()
        .then(() => {
          res.sendStatus(200);
        })
        .catch((err) => {
          console.log(err);
          res.sendStatus(500);
        });
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(500);
    });
});

module.exports = router;
