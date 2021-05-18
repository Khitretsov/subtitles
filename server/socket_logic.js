import * as dbModels from './db.js'


let buffSocket = null

let userEventsTitles = {
    // Переписать на работу с базой
    data: [],
    set change(newData) {
        this.data = newData
        this.data.forEach(item => {
            buffSocket.on(`sendSubtitles_${item.name}_${item.room}`, (data) => {
                console.log('Отправка сублитров с событием: ', `subtitles_${item.name}_${item.room}`)
                // buffSocket.to(item.room).emit(`subtitles_${item.name}_${item.room}`, {subtitles: data, name: item.name})            
                buffSocket.to(item.room).emit('kokoko', {subtitles: data, name: item.name})            
            })
        })
    }
}


const socket_logic = socket => {
    // console.log('______   Новое соединение   ______', socket.request.session) // Сокеты будут работать без сессий, а просто делая записи в базу
    buffSocket = socket

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
                        userEventsTitles.change = [...userEventsTitles.data, {name, room}]
                        socket.to(room).emit('userEventsTitles', userEventsTitles.data)
                        socket.emit('userEventsTitles', userEventsTitles.data)
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
 

    // socket.on('sendSubtitles', (data, callback) => {
    //     dbModels.Users.findOne({socket_id: socket.id})
    //     .then(user => {
    //         if (!user) {
    //             callback({ error: 'user is not autorized'})
    //         } else {
    //             socket.to(user.room).emit('subtitles', {subtitles: data, name: user.name})            
    //         }
    //     })
    // })
    
    socket.on('disconnect', () => {
        dbModels.Users.findOne({socket_id: socket.id})
        .then(user => {
            if (user) {
                dbModels.Users.remove({socket_id: socket.id})
                    .then((user) => {
                        // console.log('Удаление пользователя', user)
                    })
                userEventsTitles.change = userEventsTitles.data.filter(item => {
                    return !(!(item.name !== user.name) && !(item.room !== user.room))
                })
                socket.to(user.room).emit('message', {user: 'system', text: `Пользователь ${user.name} покинул беседу`})
            }
        })
    })
}

export default socket_logic