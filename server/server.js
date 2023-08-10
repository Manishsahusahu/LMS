const app = require('./app.js')

const PORT = process.env.PORT || 5001;

app.listen(PORT, ()=>{
    console.log(`Server is listening at http://localhost:${PORT}`)
})