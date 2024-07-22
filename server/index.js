const express = require('express')
const { Server } = require('socket.io')
const http = require('http');
const cors = require('cors')
const app = express()
const admin = require("firebase-admin");
require('dotenv').config()

const serviceAccount = {
    type:process.env.TYPE,
    project_id:process.env.PROJECT_ID,
    private_key_id:process.env.PRIVATE_KEY_ID,
    private_key:process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email:process.env.CLIENT_EMAIL,
    client_id:process.env.CLIENT_ID,
    auth_uri:process.env.AUTH_URI,
    token_uri:process.env.TOKEN_URI,
    auth_provider_x509_cert_url:process.env.AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url:process.env.CLIENT_X509_CERT_URL
}
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://chatapp-25360-default-rtdb.firebaseio.com"
});

const db = admin.database()

app.use(cors())
const server = http.createServer(app);
console.log(process.env.FRONT_END_URI)
const io = new Server(server, {
    cors: {
        origin: process.env.FRONT_END_URI,
        methods: ['GET', 'POST']
    }
});

app.get('/', (req, res) => {
  res.json("Hello")
})


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


server.listen(process.env.PORT, () => {
    console.log('SERVER RUNNING ON ' + process.env.PORT)
})

