const express = require("express");
const { createTodo, updateTodo } = require("./types");
const { todo } = require("./db");

const app = express();
app.use(express.json());
const port = 3000;

// add a todo 
app.post("/todos", async function (req, res) {
    const createPayload = req.body;
    const parsedPayload = createTodo.safeParse(createPayload);
    if (!parsedPayload.success) {
        res.status(411).json({
            msg: "you sent the wrong inputs",
        })
        return;
    }
    // put it in mongo db
    await todo.create({
        title: createPayload.title,
        description: createPayload.description,
        completed: false
    });
    res.json({
        msg: "Todo created"
    })
})
app.get("/todos", async function (req, res) {
    console.log("get method called for getting all todos");
    const todos = await todo.find({});
    console.log(todos);// promise
    res.status(200).json({
        msg: "all todos",
        "todos": todos
    })
})
app.put("/completed", async function (req, res) {
    const updatePayload = req.body;
    const parsedPayload = updateTodo.safeParse(updatePayload);
    if (!parsedPayload.success) {
        res.status(411).json({
            msg: "you sent the wrong inputs",
        })
        return;
    }
    await todo.update({
        _id: req.body.id
    }, {
        completed: true
    })
    res.status(201).json({
        msg: "Todo marked as completed"
    })
})
app.listen(3000);