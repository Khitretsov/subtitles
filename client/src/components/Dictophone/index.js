import React, { useEffect, useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

import * as styles from './styles'

const Dictaphone = ({
    sendSubtitles,
    isDictaphoneDisabled,
    setDictaphoneDisableting,
    socket,
}) => {

    const [saveText, setSaveText] = useState([])

    const {
        transcript,
        interimTranscript,
        finalTranscript,
        resetTranscript,
        listening,
    } = useSpeechRecognition()

    useEffect(
        () => {
            console.log('finalTranscript', interimTranscript)
            if (finalTranscript !== '') {

                sendSubtitles(finalTranscript, true)
                setSaveText([...saveText, finalTranscript])
                resetTranscript()
            }
            return () => {
                SpeechRecognition.stopListening()
            }
        },
        [ finalTranscript ]
        // [interimTranscript, finalTranscript]
    );

    useEffect(() => {
        console.log('socket')
        if (!socket.current) return
        if (transcript !== finalTranscript) {
            sendSubtitles(transcript, false)
        }

    })

    if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
        console.log('Your browser does not support speech recognition software! Try Chrome desktop, maybe?');
    }

    const listenContinuously = () => {
        socket.current.emit('i_start_speak')
        SpeechRecognition.startListening({
            continuous: true,
            language: 'ru',
        });
    };


    return (
        <div style={styles.dictophone}>
            <div>
                <span>
                listening:
                {' '}
                {listening ? 'on' : 'off'}
                </span>
                <div>
                    <button {...{
                        type: 'button',
                        onClick: resetTranscript
                    }}>     Reset   </button>

                    <button {...{
                        type: 'button',
                        onClick: () => {
                            setDictaphoneDisableting(!isDictaphoneDisabled)
                            listenContinuously()
                        },
                        disabled: isDictaphoneDisabled,
                    }}>     Listen    </button>

                    <button {...{
                        type: 'button',
                        onClick: () => {
                            setDictaphoneDisableting(!isDictaphoneDisabled)
                            socket.current.emit('i_end_speak')
                            SpeechRecognition.stopListening()
                        },
                    }}>    Stop    </button>
                </div>
            </div>
            <div>
                Ваша речь: <span>{transcript}</span>
            </div>
        </div>
    );
};

export default Dictaphone;