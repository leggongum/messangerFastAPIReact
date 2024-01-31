import React from "react"
import PostService from "../../API/PostService";

const MessageMenu = ({messageUpdate, setMessageUpdate, deleteMessageFromChatContent, setUpdateMode, setInputMessage, LogIn}) => {

  const cancelSelectMessage = () => {
    messageUpdate.classList.remove('selected-update');
    setMessageUpdate(false);
  }

  const updateMessage = () => {
    setUpdateMode(messageUpdate.title);
    const newInput = messageUpdate.querySelector('.message-text').innerHTML;
    setInputMessage(newInput);
    cancelSelectMessage();
  }

  const deleteMessage = async () => {
    const response = await PostService.deleteMessage(messageUpdate.title);
    if (response.status === 200){
      deleteMessageFromChatContent();
    } else {if(response.status===401){LogIn(false)}
      alert(response.data);
    }
    cancelSelectMessage();
  }

  return (
    <div className="messageMenu">
        <div className="cancel" onClick={cancelSelectMessage}> x </div>
        <div className="updateMessage" onClick={updateMessage}>Update</div>
        <div className="deleteMessage" onClick={deleteMessage}>Delete</div>
    </div>
  )
};

export default MessageMenu;
