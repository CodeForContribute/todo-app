const express = require("express");
const app = express();
app.use(express.json());
const port = 3000;

// add a todo 
app.post("/todo", function (req, res) {

})
app.get("/todos", function (req, res) {

})
app.put("/completed", function (req, res) {

})
app.listen((port) => {
    console.log("app is listening at port:${port}")
});