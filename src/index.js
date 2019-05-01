const express = require('express')
require('./db/mongoose')
const userRoutes = require('./routes/user')
const taskRoutes = require('./routes/task')

const app = express()
const port = process.env.PORT

app.use(express.json())
app.use('/users', userRoutes)
app.use('/tasks', taskRoutes)

app.listen(port, () => {
  console.log('Server is up on port', port)
})
