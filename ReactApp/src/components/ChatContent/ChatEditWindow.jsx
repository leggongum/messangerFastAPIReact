import React, { useContext } from "react"
import { EditWindowContext } from "../../context/editWindow";
import { ChatContext } from "../../context/chat";
import PostService from "../../API/PostService";
import { ChannelContext } from "../../context/channel";


const ChatEditWindow = ({setChatEditWindowActive, setChatInfo, LogIn}) => {
    const {setWindowActive, setWindowContent} = useContext(EditWindowContext);
    const {currChannel, setCurrent} = useContext(ChannelContext)
    const {currChat, setCurrChat} = useContext(ChatContext);


    const cancel = () => {
        setChatEditWindowActive(false);
    }

    function changeChat(chat, title, description){
        console.log(title, description)
        if (chat.id==currChat){
            chat.title = title;
            chat.description = description;
            setChatInfo({title: title, description: description, id: chat.id, created: chat.created})
        }
        return chat;
    }

    const updateChatRequest = async (title, description) => {
        const response = await PostService.updateChat(currChat, title, description);
        if (response.status===200){
            setCurrent({chosen: currChannel.chosen,  
                detail: {chats: currChannel.detail.chats.map(chat => changeChat(chat, title, description)),
                        users: currChannel.detail.users}
            });
            console.log(currChannel);

        } else {if(response.status===401){LogIn(false)}
            alert(response.data);
        }
        setWindowActive(false);
    }

    const editThisChat = () => {
        setChatEditWindowActive(false);
        setWindowContent({title: 'Change chat title and chat description', 
                      body: 'Rewrite chat title and chat description and push submit to update chat.', 
                      input: 'Chat title', 
                      input2: 'Chat description', 
                      action: (title, description) => updateChatRequest(title, description), 
                      btn: 'Submit'});
        setWindowActive(true);
    }


    const deleteChatRequest = async (chat_id) => {
        if(currChat==chat_id){
            const response = await PostService.deleteChat(chat_id);
            if(response.status!==200){
                if(response.status===401){LogIn(false)}
                alert(response.data);
            }
            setCurrent({chosen: currChannel.chosen,  
                detail: {chats: currChannel.detail.chats.filter(chat => chat.id != currChat),
                        users: currChannel.detail.users}
            });
            setCurrChat(undefined);
        } else {
            alert('Writen chat id is not equal current chat id');
        }
        setWindowActive(false);
    }

    const deleteThisChat = () => {
        setChatEditWindowActive(false);
        setWindowContent({title: 'Warning!', 
                      body: 'If chat was delete, you lose all messages in it. If you sure write chat id and submit.', 
                      input: 'Chat id', 
                      input2: false, 
                      action: (chat_id) => deleteChatRequest(chat_id), 
                      btn: 'Submit'});
        setWindowActive(true);
    }


    return (
        <div className="modal">
            <div className="modal-window">
                <div className="cancel" onClick={cancel}>x</div>
                <hr></hr>
                <div className="input-container">
                    <label>Edit this chat</label>
                    <div className="Btn" onClick={editThisChat}>Edit this chat</div>
                </div>
                <hr></hr>
                <div className="input-container">
                    <label>Delete this chat</label>
                    <div className="Btn" onClick={deleteThisChat}>Delete this chat</div>
                </div>
                <hr></hr>
            </div>
            <div className="overlay" onClick={cancel}></div>
        </div>
    )
};

export default ChatEditWindow;
