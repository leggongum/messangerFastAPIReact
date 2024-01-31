import React, { useContext, useState } from "react"
import { UserContext } from "../../context/user";
import PostService from "../../API/PostService";

const UserEditWindow = ({setUserEditWindowActive, LogIn}) => {
    const {User, setUser} = useContext(UserContext)

    const [username, setUsername] = useState(User.username)
    const [email, setEmail] = useState(User.email)
    const [password, setPassword] = useState('')

    const updateUser = async (userAttr, value) => {
        const response = await PostService.editUser(userAttr, value);
        if(response.status===200){
            console.log(userAttr, 'was updated');
            setUser(prev => {prev[userAttr]=value; return prev})
        } else {
            if(response.status===401){
                LogIn(false);
            } else alert(response.status, response.data.detail);
        }
    }

    const deleteUser = async () => {
        const response = await PostService.deleteUser(User.id);

        if (response.status===204){
            LogIn(false);
        } else {
            if(response.status===401){
                LogIn(false);
            } else alert(response.status, response.data.detail);
        }
    }

    const cancel = () => {
        setUserEditWindowActive(false);
    }

    return (
        <div className="modal">
            <div className="modal-window">
                <div className="cancel" onClick={cancel}>x</div>
                <hr></hr>
                <div className="input-container">
                    <input onChange={e => setUsername(e.target.value)} value={username}/>
                    <div className="Btn" onClick={() => updateUser("username", username)}>Change username</div>
                </div>
                <hr></hr>
                <div className="input-container">
                    <input onChange={e => setEmail(e.target.value)} value={email}/>
                    <div className="Btn" onClick={() => updateUser("email", email)}>Change email</div>
                </div>
                <hr></hr>
                <div className="input-container">
                    <input onChange={e => setPassword(e.target.value)} value={password}/>
                    <div className="Btn" onClick={() => updateUser("password", password)}>Change password</div>
                </div>
                <hr></hr>
                <div className="input-container">
                    <label>Delete account</label>
                    <div className="Btn" onClick={deleteUser}>Delete account</div>
                </div>
                <hr></hr>
            </div>
            <div className="overlay" onClick={cancel}></div>
        </div>
    )
};

export default UserEditWindow;
