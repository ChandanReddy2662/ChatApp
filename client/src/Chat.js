import { useEffect, useState } from 'react';

function Message(message, roomId, user, datetime){
    this.message = message;
    this.roomId = roomId;
    this.user = user;
    this.datetime = datetime;
  }
  
  function Chat({socket}) {
  
    const [value, setValue] = useState('')
    const [messages, setMessages] = useState([])
    const [uname, setUname] = useState('')
    const [roomId,setRoomId] = useState('')
    const [users, setusers] = useState([])
  
    function sendMessage(e){
      e.preventDefault()
      const message = new Message(value, roomId, uname, new Date().toString())
      setMessages([...messages, message])
      socket.current.emit('send_message', {message, roomId})
      setValue('')
    }

    function onload(){
        let roomId = sessionStorage.getItem('roomId')
        let uname = sessionStorage.getItem('uname')
        console.log(roomId + " " + uname)
        socket.current.emit('joinroom', {roomId, uname})
    }

    useEffect(()=>{
      socket.current.on('roomId', ({roomId, uname}) => {
        setRoomId(roomId)
        setUname(uname)
      })
      socket.current.on('recieved_messages', (message) => {
        setMessages([...messages, message])
      })
      socket.current.on('users', (value) => setusers(value))
    }, [socket, setMessages, messages, setusers, users]) 
  
    return (  
      <div className="App font-serif w-full h-screen flex bg-slate-800 relative justify-center items-center flex-col text-3xl text-white " onLoad={onload}>
        <h1 className='fixed top-0 left-0 right-0 bg-slate-900 p-6'>Welcome {uname}</h1>
        <div className='h-4/5 w-2/5 p-4 overflow-auto'>
          <ul className='bg-local'>
            {messages.map((value, index) => <li key={index} className='m-3'>
                <div className='w-full'>
                  <div className={`flex relative  ${value.user === uname?'text-right bg-zinc-500':'text-left bg-zinc-600'}`}>
                    <p className={`mb-3 w-full text-lg p-2 rounded-sm`}>{value.message}</p>
                    <p className='text-sm absolute bottom-0 right-0 pr-2'>{new Date(value.datetime).toTimeString().split(' ')[0].slice(0, 5)}</p>
                  </div>
                  
                </div>
              </li>)}
          </ul>
        </div>
      
        <form className='fixed bottom-0 p-4 text-black'>
          <input type="text" placeholder="Enter Message" value={value} onChange={(e) => setValue(e.target.value)} required/>
          <button className='text-white' onClick={sendMessage}>Send</button>
        </form>
      </div>
    );
  }
  export default Chat;
  