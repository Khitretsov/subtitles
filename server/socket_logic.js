import * as dbModels from './db.js'


const socket_logic = socket => {
    // console.log('______   Новое соединение   ______', socket.request.session) // Сокеты будут работать без сессий, а просто делая записи в базу
    
    socket.on('join', ({name, room}, callback) => {
        dbModels.Users.findOne({name, room})
        .then(user => {
            console.log('___   findOne   ___', user)
            if (!user) {
                dbModels.Users.create({name, room, socket_id: socket.id})
                    .then(() => {
                        socket.join(room)
                        socket.to(room).emit('message', {user: 'system', text: `Пользователь ${name} присоединился`})
                        socket.emit('message', {user: 'system', text: `Теперь вы в беседе ${room}`})
                        console.log('новый пользователь создан')
                    })
            } else {
                callback({ error: 'Такое имя в данной комнате уже занято' })
            }
        })
        .catch(err => {
            console.log('___   findOne-error   ___', err)
        })
    })

    socket.on('sendMessage', ({ text }, callback) => {
        dbModels.Users.findOne({socket_id: socket.id})
        .then(user => {
            if (!user) {
                callback({ error: 'user is not autorized'})
            } else {
                socket.to(user.room).emit('message', { user: user.name, text})
                callback()              
            }
        })
    })

    socket.on('sendSubtitles', (data, callback) => {
        dbModels.Users.findOne({socket_id: socket.id})
        .then(user => {
            if (!user) {
                callback({ error: 'user is not autorized'})
            } else {
                socket.to(user.room).emit('subtitles', {subtitles: data, name: user.name})            
            }
        })
    })

    socket.on('i_start_speak', () => {
        dbModels.Users.findOne({socket_id: socket.id})
        .then(user => {
            if (!user) {
                callback({ error: 'user is not autorized'})
            } else {
                socket.to(user.room).emit('someone_starts_speak')
            }
        })
    })

    socket.on('i_end_speak', () => {
        dbModels.Users.findOne({socket_id: socket.id})
        .then(user => {
            if (!user) {
                callback({ error: 'user is not autorized'})
            } else {
                socket.to(user.room).emit('someone_ends_speak')
            }
        })
    })
    
    socket.on('disconnect', () => {
        dbModels.Users.findOne({socket_id: socket.id})
        .then(user => {
            if (user) {
                dbModels.Users.remove({socket_id: socket.id})
                    .then((user) => {
                        console.log('Удаление пользователя', user)
                    })
                socket.to(user.room).emit('message', {user: 'system', text: `Пользователь ${user.name} покинул беседу`})
            }
        })
    })
}

export default socket_logic