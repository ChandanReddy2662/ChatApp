import { useState, useRef } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import io from 'socket.io-client';
import Chat from './Chat';
const socket = io(process.env.REACT_APP_API_KEY);
console.log(process.env.REACT_APP_API_KEY)

function onload(){
  let roomId = sessionStorage.getItem('roomId')
  let uname = sessionStorage.getItem('uname')
  console.log(roomId + " " + uname)
  socket.current.emit('joinroom', {roomId, uname})
}

function Join({ socket, onload }) {
  const [roomId, setRoomId] = useState('');
  const [uname, setUname] = useState('');
  const navigate = useNavigate();

  async function joinRoom() {
    // await fetch('https://api.render.com/deploy/srv-cq2pnp2ju9rs7391qsgg?key=oXduId5Q3A8')
    if(roomId !== '' && uname !== ''){
      sessionStorage.setItem("roomId", roomId)
      sessionStorage.setItem("uname", uname)
      socket.current.emit('joinRoom', {roomId, uname});
      navigate(`/chat/${roomId}`);
    }
  }

  return (
    <div className='joinroom h-screen w-full flex flex-col gap-6 justify-center items-center bg-slate-800 text-xl' onLoad={onload}>
      <form className='flex flex-col gap-6 justify-center items-center border p-6 rounded-xl'>
        <input type='text' value={uname} className='p-4 rounded-xl' onChange={e => setUname(e.target.value)} placeholder='username' required/>      
        <input type='text' value={roomId} className='p-4 rounded-xl' onChange={(e) => setRoomId(e.target.value)} placeholder='Enter  Room ID' required/>
        <button type='submit' onClick={joinRoom} className='bg-slate-600 w-full p-4 rounded-xl hover:bg-lime-300 transition duration-500'>JOIN OR CREATE ROOM</button>
      </form>
    </div>
  );
}

function App() {
  const socketRef = useRef(socket);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Join socket={socketRef} onLoad={onload}/>} />
        <Route path='/chat/:id' element={<Chat socket={socketRef}/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
