/**
 * Todo{
 * title:string
 * description : string
 * completed:boolean
 * }
 * 
 */
const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://pingraushan:hare_krishna_01@cluster0.pwxtrzr.mongodb.net/todos");

const todoSchema = mongoose.Schema({
    title:String,
    description:String,
    completed:Boolean
})
const todo = mongoose.model('todos',todoSchema);
module.exports = {
    todo
}