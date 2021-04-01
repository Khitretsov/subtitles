import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const Join = () => {
    const [name, setName] = useState('')
    const [room, setRoom] = useState('')

    return <>
        <div>
            Join
        </div>

        <div>
            <input {...{
                placeholder: 'Name',
                value: name,
                onChange: e => {
                    setName(e.target.value)
                }
            }}/>
            <input {...{
                placeholder: 'Room',
                value: room,
                onChange: e => {
                    setRoom(e.target.value)
                }
            }}/>
        </div>

        <div>
            <Link {...{
                to: `/chat?name=${name}&room=${room}`,
                onClick: e => {
                    (!name || ! room) && e.preventDefault()
                }
            }}
            >
                <button {...{
                    disabled: (!name || ! room),
                }}>
                    Enter
                </button>
            </Link>
        </div>
        
    </>
}

export default Join