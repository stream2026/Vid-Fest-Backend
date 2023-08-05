const express = require("express");
require("dotenv").config();
const connectDB = require("./db/connect");
const app = express();
var cors = require("cors");
const authRouter = require("./routes/authRouter");
const videoRouter=require("./routes/videoRouter");
app.use(cors());
app.use(express.json());
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/videos",videoRouter);
//Port and Connect to DB
const port = process.env.PORT || 2000;
const start = async () => {
  try {
    // await connectDB(process.env.MONGO_URL);
    await connectDB();
    app.listen(port, () => {
         console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
      console.log("error =>", error);
  }
};
start();