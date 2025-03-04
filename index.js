import express from "express"

import authorRoutes from "./routes/authors.js"
import pubRoutes from "./routes/publisher.js"
import memberRoutes from "./routes/member.js"
import cors from "cors"


const app = express()
const PORT = 8080
app.use(cors());
app.use(express.json())

app.get ('/',async(req, res) => {
    res.json({
        msg: "Hello ExpressJS"
    })
} )

app.use('/member' , memberRoutes)
app.use('/author' , authorRoutes)
app.use('/publisher' , pubRoutes)


app.listen(PORT , () => {
    console.log(`Server running PORT : ${PORT}`)
})
