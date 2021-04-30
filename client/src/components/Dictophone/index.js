import React, { useEffect, useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

import * as styles from './styles'

const Dictaphone = ({
    sendSubtitles,
    isDictaphoneDisabled,
    setDictaphoneDisableting,
    socket,
    collectText,
    setCurrentUserSpeach
}) => {

    const [saveText, setSaveText] = useState([])
    const [language, setLanguage] = useState('ru')

    const [isRestartStreamNeeded, setStreamRestarting] = useState(false)

    const {
        transcript,
        // interimTranscript,
        finalTranscript,
        resetTranscript,
        listening,
    } = useSpeechRecognition()

    useEffect(
        () => {
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
            language: language,
        });
    };

    if (isRestartStreamNeeded) {
        listenContinuously()
    }

    if (finalTranscript) {
        collectText(finalTranscript)
    }

    useEffect(() => {
        setCurrentUserSpeach(transcript)
    })


    return (
        <div style={styles.dictophone}>
            <div>
                <span>
                listening:
                {' '}
                {listening ? 'on' : 'off'}
                </span>
                <div>
                    <select disabled={isDictaphoneDisabled} value={language} onChange={e => {
                        setLanguage(e.target.value)
                    }}>
                        <option value="ru">ru</option>
                        <option value="en-US">en-US</option>
                    </select>

                    <button {...{
                        type: 'button',
                        onClick: () => {
                            setDictaphoneDisableting(!isDictaphoneDisabled)
                            setStreamRestarting(true)
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
                            setStreamRestarting(false)
                        },
                        disabled: !(listening && isDictaphoneDisabled),
                    }}>    Stop    </button>
                </div>
            </div>
            {/* <div>
                Ваша речь: <span>{transcript}</span>
            </div> */}
        </div>
    );
};

export default Dictaphone;