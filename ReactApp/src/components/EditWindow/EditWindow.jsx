import React, { useContext, useState } from "react"

import "../../styles/EditWindow.css"
import { EditWindowContext } from "../../context/editWindow";

const EditWindow = () => {
    const {WindowContent, setWindowActive} = useContext(EditWindowContext);
    const [inputValue, setInputValue] = useState('')
    const [inputValue2, setInputValue2] = useState('')

    const onClick = e => {
        e.preventDefault();
        WindowContent.action(inputValue, inputValue2);
        setInputValue('');
        setInputValue2('');
    }

    const cancel = () => {
        setWindowActive(false);
    }

    return (
        <div className="modal">
            <div className="modal-window">
                <div className="cancel" onClick={cancel}>x</div>
                <div className="title-window">
                    {WindowContent.title}
                </div>
                <hr></hr>
                <div className="body-window">
                    {WindowContent.body}
                    <div className="input-container">
                        <div className="input-label">{WindowContent.input}</div>
                        <input className="input-window" 
                            placeholder={WindowContent.input} 
                            value={inputValue}
                            onChange={e => setInputValue(e.target.value)}></input>
                    </div>
                    {WindowContent.input2
                    ?<div className="input-container">
                        <div className="input-label">{WindowContent.input2}</div>
                        <input className="input-window" 
                            placeholder={WindowContent.input2} 
                            value={inputValue2}
                            onChange={e => setInputValue2(e.target.value)}></input>
                    </div>
                    :<></>}
                </div>
                <hr></hr>
                <button className="Btn" onClick={onClick}>
                    {WindowContent.btn}
                </button>
            </div>
            <div className="overlay" onClick={cancel}></div>
        </div>
    )
};

export default EditWindow;
