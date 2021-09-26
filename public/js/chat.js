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

socket.on('message',(message)=>
{
    console.log(message);
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