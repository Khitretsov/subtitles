// Файл не нужен


const users = []

export const addUser = (id, name, room) => {
    name = name.trim().toLowerCase()
    room = room.trim().toLowerCase()

    if (name === 'system') return { error: 'Name user is not appropriate'}

    const isUserExist = users.find(user => user.name === name && user.room === room)

    if (isUserExist) {
        return { error: 'username is taken' }
    }

    const user = { id, name, room }

    users.push(user)
    return user
}

export const removeUser = id => { // Переделать
    const index = users.find(user =>  id === user.id)
    
    if ( index !== -1 ) {
        return users.splice(index, 1)[0]
    }
}

export const getUser = id => users.find(user => user.id === id)

export const getUsersInRoom = room => users.filter(user => user.room === room)
