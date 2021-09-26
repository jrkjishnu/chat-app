const path = require('path')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')

const {generateMessage,generateLocationMessage} = require('./utils/messages')

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

  
    socket.on('join',({ username, room}) =>
    {
        socket.join(room)

        socket.emit('message',generateMessage('Welcome!!'))//only for single user
        socket.broadcast.to(room).emit('message',generateMessage(`${username} has joined!!`))
        
    })
    
    socket.on('sendMessage',(newmessage,callback)=>
    {
        const filter = new Filter()

        if(filter.isProfane(newmessage))
        {
            return callback('Profanity is not allowed')
        }
        io.to('sdv').emit('message',generateMessage(newmessage))//evry single users
        callback()
    })

    socket.on('sendLocation',(position,callback)=>{
        io.emit('locationMessage',generateLocationMessage(`https://google.com/maps?q=${position.latitude},${position.longitude}`))
        callback('Delivered!!')
    })

    socket.on('disconnect',()=>
    {
        io.emit('message',generateMessage('User Disconnected'))
    })
})


server.listen(port,()=>{
    console.log(`server is up on ${port}`);
})