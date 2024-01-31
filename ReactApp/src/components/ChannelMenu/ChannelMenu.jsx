import React, {useContext, useEffect, useState} from "react"
import '../../styles/ChannelMenu.css'
import Channel from "./Channel";
import { ChannelContext } from "../../context/channel";
import PostService from "../../API/PostService";
import { EditWindowContext } from "../../context/editWindow";
import { ChatContext } from "../../context/chat";
import UserEditWindow from "./UserEditWindow";

const ChannelMenu = ({chnls, LogIn}) => {
  const [channels, setChannels] = useState(chnls);
  const [userEditWindowActive, setUserEditWindowActive] = useState(false);
  const {currChannel, setCurrent} = useContext(ChannelContext);
  const {setWindowActive, setWindowContent} = useContext(EditWindowContext);
  const {currChat, setCurrChat} = useContext(ChatContext);


  const createChannelRequest = async (title, description) => {
    const response = await PostService.createChannel(title, description)
    if (response.status === 200){
      setChannels(prev => {prev.push(response.data); return prev});
      setWindowActive(false);
    } else {
      if(response.status===401){LogIn(false)}
      alert(response.data.detail)}
  }

  const createChannel = () => {
    setWindowContent({title: 'Create new channel', 
                      body: 'You need to write channel title and channel description to create channel', 
                      input: 'Channel title', 
                      input2: 'Channel description', 
                      action: (title, description) => createChannelRequest(title, description), 
                      btn: 'Submit'});
    setWindowActive(true);
  }
  
  useEffect(() => {
    setChannels(chnls);
  }, [chnls]);

  return (
    <div className="channel-menu">
      <div className="channel" title="Edit account⚙" onClick={() => setUserEditWindowActive(true)}>👤</div>
      <div className="channel-list">
        {channels.map((channel) =>
          <Channel channel={channel} key={channel.id} setCurrent={setCurrent} currChannel={currChannel} setCurrChat={setCurrChat}/>
        )}
      </div>
      <div className="channel" customtitle="Add new channel" onClick={createChannel}>+</div>
      {userEditWindowActive? <UserEditWindow setUserEditWindowActive={setUserEditWindowActive} LogIn={LogIn}/>: <></>}
    </div>
  )
};


export default ChannelMenu;
