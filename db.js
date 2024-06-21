/**
 * Todo{
 * title:string
 * description : string
 * completed:boolean
 * }
 * https://cloud.mongodb.com/v2/65a00d4a3a198533b829fbc0#/metrics/replicaSet/6675d23a2f279843017bec77/explorer/todos/todos/find
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