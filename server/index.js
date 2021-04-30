import express from 'express'
import session from 'express-session'
import * as socketio from 'socket.io'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import MongoDBSession from 'connect-mongodb-session'
import cors from 'cors'

import http from 'http'

import router from './router.js'
import socket_logic from './socket_logic.js'

const PORT = process.env.PORT || 5000

const app = express()

app.use(bodyParser.json({ limit: '30mb', extended: true}))
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true}))

const URL_CONNECTION = 'mongodb+srv://administrator:administrator123@cluster0.lgeix.mongodb.net/test_base?retryWrites=true&w=majority'

mongoose.connect(URL_CONNECTION, {
    useNewUrlParser: true,
}).then(() => {
    console.log('Соединение с базой установленно')
}).catch((err) => {
    console.error(err)
})


const server = http.createServer(app)
export const io = new socketio.Server(server, {
    cors: {
      origin: '*',
    //   origin: 'http://localhost:3000',
    //   methods: ["GET", "POST"]
    }
  })

const SessionStoreFabrica = MongoDBSession(session)
const sessionStore = new SessionStoreFabrica({
    uri: URL_CONNECTION,
    collection: 'sessions',
})

sessionStore.on('error', err => {
    console.log(err)
})

// Сделано без сессий
const sessionMidlleware = session({
    secret: '123',
    store: sessionStore,
    resave: true,
    saveUninitialized: true,

})

io.use((socket, next) => {
    sessionMidlleware(socket.request, socket.request.res || {}, next)
})

io.on('connection', socket => socket_logic(socket))

app.use(sessionMidlleware)

app.use(router)
app.use(cors)

server.listen(PORT, () => {
    console.log(`сервер запущен на ${PORT} порте`)
})