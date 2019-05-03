const express = require('express')
require('./db/mongoose')
const userRoutes = require('./routes/user')
const taskRoutes = require('./routes/task')

const app = express()

app.use(express.json())
app.use('/users', userRoutes)
app.use('/tasks', taskRoutes)
module.exports = app