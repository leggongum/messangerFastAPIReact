import React, { useContext, useEffect, useState, useRef} from "react"
import useWebSocket, { ReadyState } from 'react-use-websocket';

import Message from "./Message";
import MessageMenu from "./MessageMenu";
import "../../styles/ChatContent.css"
import { ChatContext } from "../../context/chat";
import PostService from "../../API/PostService";
import ChatEditWindow from "./ChatEditWindow";
import { useFetching } from "../utils/useFetching";


const ChatContent = ({LogIn}) => {
  const {currChat} = useContext(ChatContext);
  const [chatInfo, setChatInfo] = useState({title: '', description: '', created: '', id: ''});
  const [isChatEditWindowActive, setChatEditWindowActive] = useState(false);

  const [messages, setMessage] = useState([]);
  const [isExistElderMessages, setIsExistElderMessages] = useState(true);
  const firstMessage = useRef(null);
  const observer = useRef();
  const messageList = useRef();

  const [messageUpdate, setMessageUpdate] = useState(0);
  const [updateMode, setUpdateMode] = useState(false);
  const intervalRef = useRef(null);

  const scroll = useRef(null);

  const [inputMessage, setInputMessage] = useState('');
  const {lastJsonMessage, sendMessage, readyState, getWebSocket} = useWebSocket(`${process.env.REACT_APP_WS_BACKEND}/ws/${currChat}`, {
    onOpen: () => {
      console.log('WebSocket connection established.');
      getWebSocket().binaryType = "arraybuffer";
    },
    onClose: () => {
      console.log('WS closed')
    },
  })

  const [getChat, isChatLoading, chatError] = useFetching(async () => {
    const response = await PostService.getChat(currChat);
    if (response.status === 200){
      console.log(response.data)
      setChatInfo({title: response.data.title, 
        description: response.data.description, 
        created: response.data.created, 
        id: response.data.id,
      })
      let msgs = response.data.messages;
      msgs.reverse();
      setMessage(msgs);
    } else {
      if(response.status===401){
        LogIn(false);
      }
    }
  })

  const [getMessages, isMessagesLoading, messagesError] = useFetching(async () => {
    if (messages.length === 0){
      console.log('chat loading')
      return;
    }

    const response = await PostService.getMessages(currChat, messages.length);
    if (response.status === 200){
      console.log(response.data)
      let msgs = response.data;
      if(msgs.length === 0){
        setIsExistElderMessages(false);
      } else {
      msgs.reverse();
      setMessage(prev => msgs.concat(prev));
      }
    } else {
      if(response.status===401){
        LogIn(false);
      }
    }
  })

  const handleClickSendMessage = (e) => {
    e.preventDefault();
    const encodedMessage = new TextEncoder('utf8').encode(inputMessage);
    sendMessage(encodedMessage.buffer);
    setInputMessage('');
  }

  function insertMessage(msg){
    if(msg.id==updateMode){
      msg.text = inputMessage;
    }
    return msg;
  }

  const handleClickUpdateMessage = async (e) => {
    e.preventDefault();
    const response = await PostService.updateMessage(updateMode, inputMessage)
    if (response.status === 200){
      setMessage(messages.map(message => insertMessage(message)));
    } else {if(response.status===401){LogIn(false)};alert(response.status, response.data)}
    setUpdateMode(false);
    setInputMessage('');
  }

  const deleteMessage = () => {
    setMessage(prev => prev.filter(msg => msg.id != messageUpdate.title));
  }

  const stopCounter = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startCounter = (e) => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      if(messageUpdate) messageUpdate.classList.remove('selected-update');
      setMessageUpdate(e.target);
      e.target.classList.add('selected-update');
      //stopCounter();
    }, 1000);
  };

  useEffect(() => {
    setIsExistElderMessages(true);
    getChat();
    return () => stopCounter();
  }, [currChat])

  useEffect(() => {
    scroll.current.scrollIntoView();
  }, [isChatLoading])

  useEffect(() => {
    if(isChatLoading || isMessagesLoading) return;
    if(observer.current) observer.current.disconnect();
    let callback = function (entries, observer) {
      if (entries[0].isIntersecting && isExistElderMessages) {
        getMessages();
        messageList.current.scrollBy(0, 1)
      }
    };
    observer.current = new IntersectionObserver(callback);
    observer.current.observe(firstMessage.current)
  }, [isChatLoading, isMessagesLoading])

  useEffect(() => {
    if (lastJsonMessage !== null) {
      setMessage((prev) => prev.concat(lastJsonMessage));
    }
  }, [lastJsonMessage, setMessage]);


  return (
    <div className="selected-chat">
      {messageUpdate
      ? <MessageMenu messageUpdate={messageUpdate} setMessageUpdate={setMessageUpdate} deleteMessageFromChatContent={deleteMessage} setUpdateMode={setUpdateMode} setInputMessage={setInputMessage}/>
      :<div className="selected-chat-name" title={`${chatInfo.id}\n${chatInfo.description}\n${chatInfo.created}`} onClick={() => setChatEditWindowActive(true)}>{chatInfo.title}</div>
      }
      <div className="message-list" ref={messageList}>
        <div ref={firstMessage} style={{background: 'red'}}></div>
        {messages.map((message) =>
          <Message message={message} key={message.id} startCounter={startCounter} stopCounter={stopCounter}/>
        )}
        <div ref={scroll}></div>
      </div>
      <form className="input-container">
        {updateMode?<div className="sendBtn" onClick={()=>{setUpdateMode(false);setInputMessage('')}}>x</div>:<></>}
        <input id="send_input" type="text" className="inputMessage" placeholder="Type your message..." name="message_text" value={inputMessage} 
        onChange={e => setInputMessage(e.target.value)}></input>
        {updateMode
          ?<button className="sendBtn" onClick={handleClickUpdateMessage} disabled={readyState !== ReadyState.OPEN}>Update</button>
          :<button className="sendBtn" onClick={handleClickSendMessage} disabled={readyState !== ReadyState.OPEN}>Send</button>
        }
      </form>
      {isChatEditWindowActive
      ?<ChatEditWindow setChatEditWindowActive={setChatEditWindowActive} setChatInfo={setChatInfo} LogIn={LogIn}/>
      :<></>}
    </div>
  )
};

export default ChatContent;
