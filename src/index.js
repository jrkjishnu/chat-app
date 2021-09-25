const path = require('path')
const express = require('express')
const socketio = require('socket.io')

const http = require('http')
const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath))

let count =1;
io.on('connection',(socket)=>{
    console.log('new web connection');

    // socket.emit('countUpdated',count)
    // socket.on('increment',()=>
    // {
    //     count++
    //     //socket.emit('countUpdated',count)
    //     io.emit('countUpdated',count)
    // })

    socket.emit('message','Welcome!!')//only for single user
    socket.broadcast.emit('message','A new user joined')
    socket.on('message',(newmessage)=>
    {
        io.emit('message',newmessage)//evry single users
    })

    socket.on('sendLocation',(position)=>{
        io.emit('message',`https://google.com/maps?q=${position.latitude},${position.longitude}`)
    })

    socket.on('disconnect',()=>
    {
        io.emit('message','User Disconnected')
    })
})


server.listen(port,()=>{
    console.log(`server is up on ${port}`);
})