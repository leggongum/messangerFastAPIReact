import React from "react"
import ChannelUser from "./ChannelUser";
import PostService from "../../API/PostService";

const ChannelUsersWindow = ({currChannel, setCurrent, setChannelUsersWindowActive, LogIn}) => {

    const deleteFromChannel = async (user) => {
        const response = await PostService.deleteFromChannel(user.id, currChannel.chosen);

        if (response.status===200){
            setChannelUsersWindowActive(false);
            setCurrent({chosen: currChannel.chosen, 
                detail: {users: currChannel.detail.users.filter(u => u.id !== user.id), chats: currChannel.detail.chats}});
        } else {if(response.status===401){LogIn(false)}
            alert(response.data.detail)}
    }

    const cancel = () => {
        setChannelUsersWindowActive(false);
    }

    return (
        <div className="modal">
            <div className="modal-window">
                <div className="cancel" onClick={cancel}>x</div>
                <hr></hr>
                <div className="user-list">
                    {currChannel.detail.users.map(user => 
                        <ChannelUser key={user.id} user={user} deleteFromChannel={deleteFromChannel}/>
                    )}
                </div>
                <hr></hr>
            </div>
            <div className="overlay" onClick={cancel}></div>
        </div>
    )
};

export default ChannelUsersWindow;
