import express from 'express'

// import * as dbModels from './db.js'

const router = express.Router()

router.get('/', (req, res) => {
    // dbModels.Users.create({
    //     name: 'ko-ko-ko-ko',
    //     room: '111'
    // })
    // .then(user => res.send(user))
    // .catch(err => res.send(err))

    console.log('___ Сессия ___', req.session)
    req.session.test = 'some text'

    res.send(req.session) // Запись сессии в базу происходит только при отправке ответа пользователю
})

export default router