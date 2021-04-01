import React, { useEffect, useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

import * as styles from './styles'

const Dictaphone = ({ sendSubtitles, socket }) => {

    const [saveText, setSaveText] = useState([])

    const {
        transcript,
        interimTranscript,
        finalTranscript,
        resetTranscript,
        listening,
    } = useSpeechRecognition()

    // } = useSpeechRecognition({ commands })

    useEffect(
        () => {
            console.log('finalTranscript', interimTranscript)
            if (finalTranscript !== '') {

                sendSubtitles(finalTranscript, true)
                setSaveText([...saveText, finalTranscript])
                resetTranscript()
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
        SpeechRecognition.startListening({
            continuous: true,
            language: 'ru',
        });
    };

    // const [message, setMessage] = useState('');

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
                        onClick: listenContinuously,
                    }}>     Listen    </button>

                    <button {...{
                        type: 'button',
                        onClick: SpeechRecognition.stopListening,
                    }}>    Stop    </button>
                </div>
            </div>
            {/* <div>
                <span>{ message }</span>
            </div> */}
            <div>
                <span>{transcript}</span>
            </div>
        </div>
    );
};

export default Dictaphone;