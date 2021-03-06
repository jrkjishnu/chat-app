const socket = io()

// socket.on('countUpdated',(count)=>
// {
//     console.log('Count updated '+count);
// })

// document.querySelector('#increment').addEventListener('click',()=>
// {
//     socket.emit('increment')
// })
//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplates = document.querySelector('#sidebar-template').innerHTML

//options
const { username, room } = Qs.parse(location.search,{ignoreQueryPrefix:true})

const autoscroll = ()=>{
    //New Message Element
    const $newMessage = $messages.lastElementChild

    //Height of the last message
    const newMessageStyle = getComputedStyle($newMessage)//margin bottom value
    const newMessageMargin = parseInt(newMessageStyle.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //Visible Height
    const visibleHeight = $messages.offsetHeight

    //Height of messages container
    const containerHeight = $messages.scrollHeight

    //How far i have scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        console.log(containerHeight - newMessageHeight);
        $messages.scrollTop = $messages.scrollHeight
    }
}


socket.on('message',(message)=>
{
    console.log(message);
    const html = Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationMessage',(url)=>{
    console.log(url);
    const html = Mustache.render(locationTemplate,{
        username:url.username,
        url:url.url,
        createdAt:moment(url.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})


socket.on('roomData',({room,users})=>{
    const html = Mustache.render(sidebarTemplates,{
        room,
        users
    })

    document.querySelector('#sidebar').innerHTML = html
})


$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()

    $messageFormButton.setAttribute('disabled','disabled')
    //disable
    const message = e.target.elements.message.value
    socket.emit('sendMessage',message,(error)=>
    {
        //enable
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if(error){
            return console.log(error);
        }

        console.log('message delivered');
    })
})

$sendLocationButton.addEventListener('click',()=>{

    $sendLocationButton.setAttribute('disabled','disabled')
    if(!navigator.geolocation)
    {
        return alert('Geolocation is not supported by your browser!!!')
    }

    navigator.geolocation.getCurrentPosition((position)=>{
        $sendLocationButton.removeAttribute('disabled')

        socket.emit('sendLocation',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        },(message)=>{
            console.log('Location Shared!!',message);
        })
    })
})
socket.emit('join',{username,room},(error)=>{
    if(error)
    {
        alert(error)
        location.href='/'
    }
})