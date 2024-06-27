const express = require('express')
const { Server } = require('socket.io')
const http = require('http');
const cors = require('cors')
const app = express()
const admin = require("firebase-admin");
const serviceAccount = require("./api/chatapp-25360-firebase-adminsdk-27m7f-90b36307e1.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://chatapp-25360-default-rtdb.firebaseio.com"
});

const db = admin.database()

app.use(cors())
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ['GET', 'POST']
    }
});

// app.get('/', (req, res) => {
//   res.sendFile(__dirname + '/index.html')
// })


async function addUser(roomId, uname){
    let ref = await db.ref("rooms").child(roomId).child("unames")
    let newUnames = {
        uname: uname,
        time: new Date().toString()
    }
    ref.once('value').then((snapshot) => {
            ref.child(snapshot.val().length).set(newUnames).then(a => console.log("inserted")).catch(a => console.log("unable"))
    })
}


io.on('connection', (socket) => {
        
    socket.on('joinRoom', async ({roomId, uname})=>{
        socket.join(roomId)
        console.log('joined room: ', roomId, uname)
        const room = db.ref('rooms').child(roomId)
        await room.once('value', (snapshot) => {
            if(snapshot.exists())
                addUser(roomId, uname)
            else{
                room.set({
                    unames: [{uname: uname, time: new Date().toString()}],
                    datetime: new Date().toString()
                });
            }
        })
        socket.emit('roomId', {roomId, uname})
        
    })    

    socket.on('send_message', async ({message, roomId}) => {
        const messagesRef = await db.ref('rooms').child(roomId).child('messages')
        await messagesRef.once('value').then(async (snapshot) => {
            let messages = []
            if(snapshot.exists())
                messages = snapshot.val()
            
            messages.push(message)
            
            await messagesRef.set(messages)
            console.log('message added')
            return message
        }).then((message) => {
            console.log(message)
            socket.in(roomId).emit('recieved_messages', message);
        })
    })
})


server.listen(3001, () => {
    console.log('SERVER RUNNING ON 3001')
})

