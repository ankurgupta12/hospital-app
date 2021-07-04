// import
const express = require("express");
const cors = require("cors");

var app = express();
const PORT = process.env.PORT || 5000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());


// Route for hospital controller
app.use("/hospital", require("./controller/hospital"));

// Route for department controller
app.use("/department", require("./controller/department"));

// default port running at 3000
app.listen(PORT, () => console.log(`server started at PORT ${PORT}....`));
