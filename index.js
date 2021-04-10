const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
//import routes
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");

dotenv.config();

//connect to database
// mongoose.set("bufferCommands", false);
mongoose.connect(process.env.DB_CONNECT, { useNewUrlParser: true }, (err) => {
  if (err) console.error(err);
  else console.log("Connected to database");
});
//Middlewares
app.use(express.json());
app.use(cors());
//Route Middlewares
app.use("/api/user", authRoute);
app.use("/api/posts", postRoute);
app.listen(3000, () => console.log("Sever up and running"));
