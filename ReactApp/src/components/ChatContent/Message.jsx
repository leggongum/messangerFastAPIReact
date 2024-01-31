import React, { useContext } from "react"
import { UserContext } from "../../context/user";
import { ChannelContext } from "../../context/channel";

const Message = ({message, startCounter, stopCounter}) => {
  const {User} = useContext(UserContext)
  const {currChannel} = useContext(ChannelContext)

  function findUsername(user_id){
    for (let i in currChannel.detail.users){
      if (currChannel.detail.users[i].id == user_id){
        return currChannel.detail.users[i].username
      }
    }
  }
  
  if (currChannel.detail === undefined) {
    return <>Still loading...</>;
  }
  return (
    <div className="message-body" id={User.id == message.user_id ? 'from_me': 'from_other'} 
          title={message.id} 
          onMouseDown={(e) => startCounter(e)} 
          onMouseUp={stopCounter}
          onMouseLeave={stopCounter}>
        <div className="user">{findUsername(message.user_id)}</div>
        <div className="message-text">
            {message.text}
        </div>
        <div className="date">{new Date(message.date*1000).toString()}</div>
    </div>
  )
};

export default Message;
