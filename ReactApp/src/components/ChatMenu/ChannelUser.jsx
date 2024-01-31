import React from "react"

const ChannelUser = ({user, deleteFromChannel}) => {
    return (
        <div className="input-container">
            <label>{user.id}</label>
            <label>{user.username}</label>
            <div className="Btn" onClick={() => deleteFromChannel(user)}>Delete</div>
        </div>
    )
};

export default ChannelUser;
