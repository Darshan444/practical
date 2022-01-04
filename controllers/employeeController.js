const express = require("express");
var router = express.Router();
const mongoose = require("mongoose");
const Employee = mongoose.model("Employee");
const upload = require("../middleware/fileUpload");
const fileDelete = require("../middleware/fileRemove");

router.get("/", (req, res) => {
  res.render("employee/addOrEdit", {
    viewTitle: "Insert Data",
  });
});

router.get("/login", (req, res) => {
  res.render("employee/login", {
    viewTitle: "Login",
  });
});

router.get("/logout", (req, res) => {
  req.session.isLoggedIn = false;
  req.session.user = null;
  res.render("employee/addOrEdit", {
    viewTitle: "Insert Data",
  });
});

router.post("/", upload.single("image"), async (req, res) => {
  // console.log("req=>",req.file)
  if (req.body._id == "") insertRecord(req, res);
  else updateRecord(req, res);
});

router.post("/login", (req, res) => {
  const userName = req.body.email;
  const password = req.body.password;
  // console.log(userName);
  Employee.findOne(
    { $and: [{ email: userName }, { password: password }] },
    (err, doc) => {
      // console.log(doc);
      // console.log(err);
      if (doc != null) {
        req.session.isLoggedIn = true;
        req.session.user = doc;
        res.redirect("list");
      } else {
        res.render("employee/login", {
          viewTitle: "Loging",
          error: "username or password not match",
        });
      }
    }
  );
});

function insertRecord(req, res) {
  // console.log(req.body);
  // console.log(req.file);
  var employee = new Employee();
  employee.fullName = req.body.fullName;
  employee.email = req.body.email;
  employee.mobile = req.body.mobile;
  employee.city = req.body.city;
  employee.password = req.body.password;
  employee.skills = req.body.skills;
  employee.image = req.file?.path;
  // console.log(employee);
  employee.save((err, doc) => {
    if (!err) res.redirect("login");
    else {
      if (err.name == "ValidationError") {
        handleValidationError(err, req.body);
        res.render("employee/addOrEdit", {
          viewTitle: "Insert Data",
          employee: req.body,
        });
      } else console.log("Error during record insertion : " + err);
    }
  });
}

function updateRecord(req, res) {
  const image = req.file?.path;
  if (image && image != "") {
    req.body.image = image;
  }
  // console.log("image=>",image);
  // console.log(req.body);
  Employee.findById(req.session.user._id, (err, docs) => {
    if (!err) {
      Employee.findOneAndUpdate(
        { _id: req.body._id },
        req.body,
        { new: true },
        (err, doc) => {
          if (!err) {
            console.log(docs.image);
            fileDelete.deleteFile(docs.image);
            res.redirect("list");
          } else {
            if (err.name == "ValidationError") {
              handleValidationError(err, req.body);
              res.render("employee/addOrEdit", {
                viewTitle: "Update Employee",
                employee: req.body,
              });
            } else console.log("Error during record update : " + err);
          }
        }
      );
    } else {
      console.log("Error during record update : " + err);
    }
  });
}

router.get("/list", (req, res) => {
  // console.log("req.session=>",req.session);
  // console.log("isAuthenticated=>",req.session.isLoggedIn);
  // console.log("isAuthenticated=>",req.session.user);
  // console.log("Employee=>",Employee);
  if (req.session.isLoggedIn) {
    Employee.findById(req.session.user._id, (err, docs) => {
      // console.log(docs);
      if (!err) {
        res.render("employee/list", {
          list: docs,
        });
      } else {
        console.log("Error in retrieving employee list :" + err);
      }
    });
  } else {
    res.render("employee/login", {
      viewTitle: "Login",
      error: "please login first",
    });
  }
});

function handleValidationError(err, body) {
  for (field in err.errors) {
    switch (err.errors[field].path) {
      case "fullName":
        body["fullNameError"] = err.errors[field].message;
        break;
      case "email":
        body["emailError"] = err.errors[field].message;
        break;
      case "password":
        body["passwordError"] = err.errors[field].message;
        break;
      default:
        break;
    }
  }
}

router.get("/:id", (req, res) => {
  Employee.findById(req.params.id, (err, doc) => {
    if (!err) {
      res.render("employee/addOrEdit", {
        viewTitle: "Update Employee",
        employee: doc,
      });
    }
  });
});

router.get("/delete/:id", (req, res) => {
  Employee.findByIdAndRemove(req.params.id, (err, doc) => {
    if (!err) {
      req.session.isLoggedIn = false;
      req.session.user = null;
      res.redirect("/");
    } else {
      console.log("Error in employee delete :" + err);
    }
  });
});

module.exports = router;
