import React, { useState, useEffect, useRef } from 'react'
import queryString from 'query-string'
import io from 'socket.io-client'
import fileDownload from 'js-file-download'

import * as styles from './styles'

import Dictaphone from '../Dictophone'

const Chat = ({ location, history }) => {
    const { name, room  } = queryString.parse(location.search)

    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('')
    const [isDictaphoneDisabled, setDictaphoneDisableting] = useState(false)

    const [subtitlesForShowing, setSubtitlesForShowing] = useState(null)

    const [currentUserSpeach, setCurrentUserSpeach] = useState(null)

    // Сохраненение и выгрузку надо перенести на бекенд
    const savedText = useRef([])

    const collectText = (() => {
        const buffer = name
        return (text, name = buffer) => {
            savedText.current.push({
                name,
                date: `${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`,
                text,
            })
        }
    })()
    
    const socket = useRef(null)
    const rootScrollElem = useRef(null)
    const scrollElem = useRef(null)

    useEffect(() => {
        const blockHeight = + getComputedStyle(scrollElem.current).height.slice(0, -2)
        if (blockHeight > 150) {
            rootScrollElem.current.scrollTo(0, blockHeight - 150)
        }
    })

    useEffect(() => {
        socket.current = io('localhost:5000')
        // socket.current = io('https://subtitles-app123.herokuapp.com/')
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
            if (subtitles.subtitles.finalTranscript) {
                collectText(subtitles.subtitles, subtitles.name)
                setSubtitlesForShowing(null)
            } else {
                setSubtitlesForShowing(subtitles)
            }
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
        <Dictaphone {...{
            sendSubtitles,
            isDictaphoneDisabled,
            setDictaphoneDisableting,
            socket,
            collectText,
            setCurrentUserSpeach
        }} />
        <div style={styles.subtitles_block} ref={rootScrollElem}>
            <div ref={scrollElem}>

                {
                    savedText.current.map(item => {
                        return <div key={item.date}>
                            {`${item.name}: ${(typeof item.text === 'string') ? item.text : item.text.subtitles}`}
                        </div>
                    })
                }

                {
                    <div style={styles.current_subtitles}>
                        <div> { currentUserSpeach } </div>
                        {subtitlesForShowing && ( <>
                                <span> { `${subtitlesForShowing.name}: ` } </span>
                                <span> { subtitlesForShowing.subtitles.subtitles } </span>
                            </>
                        )}
                    </div>
                }

            </div>
        </div>
        <div>
            <button 
                disabled={isDictaphoneDisabled}
                onClick={() => {
                    const data = new Blob([JSON.stringify(savedText.current)], {type : 'application/json'})
                    fileDownload(data, 'subtitles.json')
                }}
            > Скачать субтитры </button>
        </div>
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