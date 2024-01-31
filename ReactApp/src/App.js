import { useEffect, useState} from 'react';

import './App.css';
import './styles/App.css'
import EditWindow from './components/EditWindow/EditWindow';
import ChannelMenu from './components/ChannelMenu/ChannelMenu';
import ChatContent from './components/ChatContent/ChatContent';
import ChatMenu from './components/ChatMenu/ChatMenu';
import LoginSignup from './components/LoginSignup';
import PostService from './API/PostService';
import { EditWindowContext } from './context/editWindow'; 
import { ChannelContext } from './context/channel';
import { ChatContext } from './context/chat';
import { UserContext } from './context/user';

function App() {
    const [isLoggedIn, LogIn] = useState(false);
    const [needToBeVerified, setNeedToBeVerified] = useState(false);
    const [userChannels, setUserChannels] = useState([]);

    const [isWindowActive, setWindowActive] = useState(false);
    const [WindowContent, setWindowContent] = useState(undefined);
    const [currChannel, setCurrent] = useState({chosen: false});
    const [currChat, setCurrChat] = useState('');
    const [User, setUser] = useState({});
    
    async function getContent(){
      const response = await PostService.getChannelsUser();
      if(response.status === 200 && response.data.channels !== userChannels){
        setUserChannels(response.data.channels);
        if(!isLoggedIn){LogIn(true);}
        setUser(response.data.user);
        console.log('get content: ', response.data);
      } else { 
        if (response.status === 401){
        setUserChannels([]);
        LogIn(false);
        } else
        if (response.status === 403){
          setNeedToBeVerified(true);
        }
      }
    }

    const onLogin = (isLogIn) => {
      if (isLogIn){
      getContent();
      console.log('LogIn!');
      }
    }

    useEffect(() => {
      getContent();
      console.log('useEffect!!', isLoggedIn, userChannels);
    }, [])

    if (!userChannels){
      return (
        <>still loading...</>
      )
    }

    console.log('rendering: ', userChannels)
    return(
      <UserContext.Provider value={{
        User,
        setUser
      }}>
        <ChannelContext.Provider value={{
          currChannel,
          setCurrent
        }}>
          <ChatContext.Provider value={{
            currChat,
            setCurrChat
          }}>
            <EditWindowContext.Provider value={{
              WindowContent, setWindowContent,
              isWindowActive, setWindowActive,
            }}>
              {isLoggedIn 
              ? <div className="App"> 
                <ChannelMenu chnls={userChannels} LogIn={LogIn}/> 
                {currChannel? <ChatMenu  channels={userChannels} setUserChannels={setUserChannels} LogIn={LogIn}/>: <>Channel is not selected</>} 
                {currChat? <ChatContent LogIn={LogIn}/>: <div className='chat-not-selected'>Chat is not selected</div>}
              </div>
              : <div className="App"> <LoginSignup onLogin={onLogin} needToBeVerified={needToBeVerified} setNeedToBeVerified={setNeedToBeVerified}/> </div>
              }
              {isWindowActive
              ? <EditWindow/>
              : <></>
              }
            </EditWindowContext.Provider>
          </ChatContext.Provider>
        </ChannelContext.Provider>
      </UserContext.Provider>
    )
}

export default App;
