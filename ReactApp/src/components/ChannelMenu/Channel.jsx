import React from "react"

const Channel = (props) => {
  const channel_id = props.channel.id;

  function handleClick(e){
    if (props.currChannel.chosen !== e.target.id) {props.setCurrent({chosen: e.target.id}); props.setCurrChat(undefined)};
  }

  const className = () => props.currChannel.chosen && props.currChannel.chosen == channel_id

  return (
    <div id={channel_id}  className={className() ? 'selected_channel channel': 'channel'} customtitle={props.channel.title} onClick={handleClick}>
        {props.channel.title[0]}
    </div>
  )
};

export default Channel;