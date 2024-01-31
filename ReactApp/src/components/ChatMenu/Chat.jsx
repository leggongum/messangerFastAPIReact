import React from "react"

const Chat = (props) => {

  function handleclick(e){
    props.setCurrChat(e.target.id)
  }

  return (
    <div>
        <div id={props.chat.id} className={props.currChat == props.chat.id ? 'selected_chat chat': 'chat'} title={props.chat.description} onClick={handleclick}>
            {props.chat.title}
        </div>
    </div>
  )
};

export default Chat;
