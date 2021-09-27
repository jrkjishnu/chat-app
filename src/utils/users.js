const users = []

//add users, remove users, getusers, get users in room

const addUser = ({ id, username, room })=>{
    //Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate the data
    if(!username || !room){
        return {
            error:'Username and room are rquired!'
        }
    }

    //check for existing user
    const existingUser = users.find((user) =>{
        return user.room === room && user.username === username
    })

    //Validate username
    if(existingUser){
        return {
            error:'Username is in use!'
        }
    }

    //Store user

    const user = { id, username, room}
    users.push(user)
    return {user}
}


const removeUser = (id)=>{
    const index = users.findIndex((user)=>{
        return user.id === id
    })

    if(index !== -1)
    {
        return users.splice(index,1)[0]
    }
}

const getUser = (id)=>
{
    return users.find((user)=>user.id === id) 
}

const getUsersInRoom = (room)=>
{
    const user = users.filter((user)=>user.room === room)
    return user;
}


module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}