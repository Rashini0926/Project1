//lN0JsEvBRY1XL1s mW9JVwyZUVAOpjrEB

const express = require("express");

const mongoose = require("mongoose");
const router = require("./Route/supplierroutes");
const app = express();
const cors = require("cors");

//Middleware
app.use(express.json());
app.use(cors());
app.use("/suppliers", router);

mongoose.connect("mongodb+srv://rakuni789_db_user:FroaQFBd5EGJkTvj@cluster0.ebnqc1t.mongodb.net/")
.then(()=> console.log("Connected to MongoDB")).then(() => {
    app.listen(5000)
}).catch((err)=> console.log((err)));

