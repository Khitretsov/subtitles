import React, { useState, useEffect, useRef } from 'react'
import queryString from 'query-string'
import io from 'socket.io-client'

import * as styles from './styles'

import Dictaphone from '../Dictophone'

const Chat = ({ location, history }) => {
    const { name, room  } = queryString.parse(location.search)

    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('')
    const [isDictaphoneDisabled, setDictaphoneDisableting] = useState(false)

    const [subtitlesForShowing, setSubtitlesForShowing] = useState(null)
    
    const socket = useRef(null)

    useEffect(() => {
        socket.current = io('localhost:5000')
        socket.current.emit('join', { name, room }, (error) => {
            console.log('___ error ___', error)
            history.push('/')
        })

        socket.current.on('message', message => {
            setMessages(oldMessages => [...oldMessages, message])
        })


        socket.current.on('someone_starts_speak', () => {
            setDictaphoneDisableting(true)
        })

        socket.current.on('someone_ends_speak', () => {
            setDictaphoneDisableting(false)
        })

        socket.current.on('subtitles', subtitles => {
            console.log('subtitles', subtitles.name)
            setSubtitlesForShowing(subtitles)
     
        })

        return () => {
            socket.current.disconnect()
        }
    }, [location.search])

    const sendMessage = () => {
        if ( !newMessage ) return null
        console.log('newMessage', newMessage)

        socket.current.emit('sendMessage', { text: newMessage}, () => {
            setMessages([...messages, {user: name, text: newMessage}])
            console.log('messages', messages)
            setNewMessage('')
        })
    }

    const sendSubtitles = (subtitles, finalTranscript) => {
        socket.current.emit('sendSubtitles', { subtitles, finalTranscript })
    }

    return <>
        <div> Chat </div>
        <div>
            <button {...{
                onClick: () => {
                    socket.current.disconnect()
                    history.push('/')
                },
            }}> Выйти </button>
        </div>
        <div>
            Написать сообщение:
            <input {...{
                value: newMessage,
                onChange: (e) => {
                    setNewMessage(e.target.value)
                },
                onKeyPress: (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault()
                        sendMessage()
                    }
                }
            }}/>
        </div>
        <div style={styles.subtitles_block}>
            Субтитры от других пользователей: { <>
                <div>
                {subtitlesForShowing && ( <>
                        <span> { `${subtitlesForShowing.name}: ` } </span>
                        <span> { subtitlesForShowing.subtitles.subtitles } </span>
                    </>
                )}
                </div>
            </> }
        </div>
        <Dictaphone {...{
            sendSubtitles,
            isDictaphoneDisabled,
            setDictaphoneDisableting,
            socket,
        }} />
        <div>
            <div>Сообщения:</div>
            {
                messages.map(({user, text}) => (
                    <div
                        key={setTimeout(()=>{}, 0)}
                    >
                        { user }{': '}{ text }
                    </div>
                ))
            }
        </div>
    </>
}

export default Chat