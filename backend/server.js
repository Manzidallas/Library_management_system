const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
require('dotenv').config()
const cors = require('cors')
const session = require('express-session')
const User = require('./models/users')
const app = express()
const port = process.env.PORT || 5000
app.use(express.json())
app.use(cors({origin: "*"}))

mongoose.connect(process.env.MONGO_URI)
.then(()=>{
    console.log("Connected to MongoDB")
})
.catch((err)=>{
    console.log(err)
})

app.post('/register', async (req, res)=>{

    const {username, email, password} = req.body;

    try {
        const user = await User.findOne({email})
        if(user){
            return res.status(400).json({message: "User with this email already exists"})
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = new User({username, email, password: hashedPassword})
        await newUser.save()
        res.status(201).json({message: "User registered successfully"})

    } catch (error) {
        res.status(500).json({message: "Internal server error"})    
    }
})

app.post('/login', async (req, res)=>{
    const {email, password} = req.body
    try {
        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({message: "User with this email does not exist"})
        }
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if(!isPasswordValid){
            return res.status(400).json({message: "Invalid password"})
        }
        res.status(200).json({message: "Login successful"})
    } catch (error) {
        res.status(500).json({message: "Internal server error"})
    }
})

app.listen(port, ()=>{
    console.log(`Server is running on port : ${port}`)
})