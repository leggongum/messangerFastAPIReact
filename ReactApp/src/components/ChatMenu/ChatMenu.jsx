import React, {useEffect, useContext, useState} from "react"
import Chat from "./Chat";
import '../../styles/ChatMenu.css'
import PostService from "../../API/PostService";
import ChannelEditWindow from "./ChannelEditWindow";
import { ChannelContext } from "../../context/channel";
import { ChatContext } from "../../context/chat";
import { EditWindowContext } from "../../context/editWindow";

const ChatMenu = ({channels, setUserChannels, LogIn}) => {
  const {currChannel, setCurrent} = useContext(ChannelContext)
  const {currChat, setCurrChat} = useContext(ChatContext)
  const {setWindowContent, setWindowActive} = useContext(EditWindowContext)
  const [isChannelEditWindowActive, setChannelEditWindowActive] = useState(false)

  async function getChats(channel_id){
    let response = await PostService.getChatsInChannel(channel_id)
    if(response.status === 200){
      setCurrent({chosen: currChannel.chosen, detail: response.data});
      console.log('get Chats', response.data);
    } else {if(response.status===401){LogIn(false)}}
  }

  const addChatRequest = async (title, description) => {
    const response = await PostService.addChatToChannel(title, description, currChannel.chosen);
    if (response.status === 200){
      let newUpdatedChannel = currChannel;
      newUpdatedChannel.detail.chats.push(response.data);
      setWindowActive(false);
    } else{if(response.status===401){LogIn(false)}
      alert(response.data.detail)}
  }


  const addChat = () => {
    setWindowContent({title: 'Add chat to channel', 
                      body: 'You need to write chat title and chat description to create chat', 
                      input: 'Chat title', 
                      input2: 'Chat description', 
                      action: (title, description) => addChatRequest(title, description), 
                      btn: 'Submit'});
    setWindowActive(true);
  }

  useEffect(() =>{
    if (currChannel.chosen) getChats(currChannel.chosen);
  }, [currChannel.chosen])

  if (currChannel.detail === undefined) {
    return (
      <div className="chat-menu"></div>
    )
  }

  return (
    <div className="chat-menu">
      <div className="chat" onClick={() => setChannelEditWindowActive(true)}>Edit channel</div>
      <div className="chat-list">
        {currChannel.detail.chats.map((chat) =>
          <Chat chat={chat} key={chat.id} setCurrChat={setCurrChat} currChat={currChat}/>
        )}
      </div>
      <div className="chat" onClick={addChat}>Add chat</div>
      {isChannelEditWindowActive
      ? <ChannelEditWindow setChannelEditWindowActive={setChannelEditWindowActive} setUserChannels={setUserChannels} channels={channels} LogIn={LogIn}/>
      :<></>}
    </div>
  )
};

export default ChatMenu;
