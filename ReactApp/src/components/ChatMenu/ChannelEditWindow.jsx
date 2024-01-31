import React, { useContext, useState } from "react"
import { EditWindowContext } from "../../context/editWindow";
import PostService from "../../API/PostService";
import { ChannelContext } from "../../context/channel";
import ChannelUsersWindow from "./ChannelUsersWindow";

const ChannelEditWindow = ({setChannelEditWindowActive, setUserChannels, LogIn}) => {
    const {setWindowActive, setWindowContent} = useContext(EditWindowContext);
    const {currChannel, setCurrent} = useContext(ChannelContext);

    const [isChannelUsersWindowActive, setChannelUsersWindowActive] = useState(false);

    const cancel = () => {
        setChannelEditWindowActive(false);
    }

    const addUserRequest = async (user_id) => {
        const response = await PostService.addUserToChannel(user_id, currChannel.chosen);
        if (response.status === 200){
          setWindowActive(false);
          let updatedUsers = currChannel.detail.users;
          updatedUsers.push(response.data);
          setCurrent({chosen: currChannel.chosen, 
                    detail: {users: currChannel.detail.users, chats: currChannel.detail.chats}});
        } else {if(response.status===401){LogIn(false)}
            alert(response.data.detail)}
    }
    
    const addUser = () => {
        //setChannelEditWindowActive(false);
        setWindowContent({title: 'Add user to channel', 
                        body: 'You need to set the user ID to add him to the channel', 
                        input: 'User id', 
                        input2: false, 
                        action: (user_id) => addUserRequest(user_id), 
                        btn: 'Submit'});
        setWindowActive(true);
    }


    const deleteUser = () => {
        setChannelUsersWindowActive(true);
    }


    const deleteChannelRequest = async (channel_id) => {
        if(currChannel.chosen==channel_id){
            const response = await PostService.deleteChannel(channel_id);
            if(response.status===200){
                setUserChannels(channels => channels.filter(channel => channel.id != currChannel.chosen));
                setCurrent({chosen: false});
                setChannelEditWindowActive(false);
            } else {if(response.status===401){LogIn(false)}
                alert(response.data.detail);}
        } else {
            alert('Writen channel id is not equal current channel id');
        }
        setWindowActive(false);
    }

    const deleteChannel = () => {
        setWindowContent({title: 'Warning!', 
                        body: 'If channel was delete, you lose all chats and messages in it. If you sure write channel id and submit.', 
                        input: 'Channel id', 
                        input2: false, 
                        action: (channel_id) => deleteChannelRequest(channel_id), 
                        btn: 'Submit'});
        setWindowActive(true);
    }


    function insertChannelInfo(chnl, title, description){
        if(chnl.id==currChannel.chosen){
            chnl.title = title;
            chnl.description = description;
        }
        return chnl;
      }

    const updateChannelRequest = async (title, description) => {
        const response = await PostService.updateChannel(currChannel.chosen, title, description);
        if (response.status===200){
            setUserChannels(channels => channels.map(chnl => insertChannelInfo(chnl, title, description)));
            setCurrent(prev => {prev.detail.title = title; prev.detail.description=description; return prev});
        } else {if(response.status===401){LogIn(false)}
            alert(response.data);
        }
        setWindowActive(false);
    }

    const editChannel = () => {
        setWindowContent({title: 'Change channel title and channel description', 
                      body: 'Rewrite channel title and channel description and push submit to update channel.', 
                      input: 'Channel title', 
                      input2: 'Channel description', 
                      action: (title, description) => updateChannelRequest(title, description), 
                      btn: 'Submit'});
        setWindowActive(true);
    }


    return (
        <div className="modal">
            <div className="modal-window">
                <div className="cancel" onClick={cancel}>x</div>
                <hr></hr>
                <div className="input-container">
                    <label>Edit this channel</label>
                    <div className="Btn" onClick={editChannel}>Edit channel</div>
                </div>
                <hr></hr>
                <div className="input-container">
                    <label>Delete this channel</label>
                    <div className="Btn" onClick={deleteChannel}>Delete channel</div>
                </div>
                <hr></hr>
                <div className="input-container">
                    <label>Add user</label>
                    <div className="Btn" onClick={addUser}>Add user</div>
                </div>
                <hr></hr>
                <div className="input-container">
                    <label>Delete user from channel</label>
                    <div className="Btn" onClick={deleteUser}>Delete user</div>
                </div>
                <hr></hr>
            </div>
            <div className="overlay" onClick={cancel}></div>
            {isChannelUsersWindowActive
            ? <ChannelUsersWindow currChannel={currChannel} setCurrent={setCurrent} setChannelUsersWindowActive={setChannelUsersWindowActive} LogIn={LogIn}/>
            : <></>}
        </div>
    )
};

export default ChannelEditWindow;
