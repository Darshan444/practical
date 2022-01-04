const mongoose = require("mongoose");

mongoose.connect(
  "mongodb+srv://darshan:<password>@cluster0.lkhgl.mongodb.net/EmployeeDB?retryWrites=true&w=majority",
  { useNewUrlParser: true },
  (err) => {
    if (!err) {
      console.log("MongoDB Connection Succeeded.");
    } else {
      console.log("Error in DB connection : " + err);
    }
  }
);

require("./employee.model");
