import express from 'express'
import * as socketio from 'socket.io'
import bodyParser from 'body-parser'
// import mongoose from 'mongoose'
import cors from 'cors'

import http from 'http'

import router from './router.js'
import * as manageUsers from './users.js'

const PORT = process.env.PORT || 5000

const app = express()

app.use(bodyParser.json({ limit: '30mb', extended: true}))
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true}))
app.use(cors)

// const URL_CONNECTION = 'mongodb+srv://admin:<password>@cluster0.lgeix.mongodb.net/<dbname>?retryWrites=true&w=majority'

const server = http.createServer(app)
const io = new socketio.Server(server, {
    cors: {
      origin: 'http://localhost:3000',
      methods: ["GET", "POST"]
    }
  })

io.on('connection', socket => {
    console.log('we have a new connection')

    
    socket.on('join', ({name, room}, callback) => {
        const user = manageUsers.addUser(socket.id, name, room)

        if (user.error) return callback({ error: user.error })
        
        socket.join(room)
        socket.to(room).emit('message', {user: 'system', text: `Пользователь ${name} присоединился`})
        socket.emit('message', {user: 'system', text: `Теперь вы в беседе ${room}`})
    })

    socket.on('sendMessage', ({ text }, callback) => {
        const user = manageUsers.getUser(socket.id)
        if (!user) return callback({ error: 'user is not autorized'})

        socket.to(user.room).emit('message', { user: user.name, text})
        callback()
    })

    socket.on('sendSubtitles', (data, callback) => {
        const user = manageUsers.getUser(socket.id)
        if (!user) return callback({ error: 'user is not autorized'})
        
        socket.to(user.room).emit('subtitles', {subtitles: data, name: user.name})
    })

    socket.on('i_start_speak', () => {
        const user = manageUsers.getUser(socket.id)
        if (!user) return callback({ error: 'user is not autorized'})
        
        socket.to(user.room).emit('someone_starts_speak')
    })

    socket.on('i_end_speak', () => {
        const user = manageUsers.getUser(socket.id)
        if (!user) return callback({ error: 'user is not autorized'})
        
        socket.to(user.room).emit('someone_ends_speak')
    })
    
    socket.on('disconnect', () => {
        const user = manageUsers.removeUser(socket.id)
        
        if(user) {
            console.log(user.name, user.room)
            io.to(user.room).emit('message', {user: 'system', text: `Пользователь ${user.name} покинул беседу`})
        }
    })
})

app.use(router)

server.listen(PORT, () => {
    console.log(`сервер запущен на ${PORT} порте`)
})