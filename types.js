const zod = require("zod");
/**
 * // adding todo in request body
 * {
 * title:string
 * description:string
 * }
 * 
 * // to update a todo
 * {
 * id:string
 * }
 *  */
const createTodo = zod.object({
    title:zod.string(),
    description:zod.string()
})

const updateTodo = zod.object({
    id:zod.string()
})
module.exports = {
    createTodo:createTodo,
    updateTodo:updateTodo
}