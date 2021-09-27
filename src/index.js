const path = require('path')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')

const {generateMessage,generateLocationMessage} = require('./utils/messages')
const {addUser,removeUser,getUsersInRoom,getUser} = require('./utils/users')

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

  
    socket.on('join',({ username, room},callback) =>//or we can use options instead of username and room without destructuring
    {
        console.log(socket.id);
        const {error,user} = addUser({id:socket.id, username,room})//use ...options

        if(error){
            return callback(error)
        }

        
        socket.join(user.room)

        socket.emit('message',generateMessage('Admin','Welcome!!'))//only for single user
        socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined!!`))
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })
        callback()
        
    })
    
    socket.on('sendMessage',(newmessage,callback)=>
    {
        const filter = new Filter()

        const user = getUser(socket.id)
        if(filter.isProfane(newmessage))
        {
            return callback('Profanity is not allowed')
        }
        io.to(user.room).emit('message',generateMessage(user.username,newmessage))//evry single users
        callback()
    })

    socket.on('sendLocation',(position,callback)=>{
        const user = getUser(socket.id)

        io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,`https://google.com/maps?q=${position.latitude},${position.longitude}`))
        callback('Delivered!!')
    })

    socket.on('disconnect',()=>
    {
        const user = removeUser(socket.id)

        if(user){
            io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left`))
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUsersInRoom(user.room)
            })
        }

    })
})


server.listen(port,()=>{
    console.log(`server is up on ${port}`);
})