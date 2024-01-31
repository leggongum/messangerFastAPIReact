import React, { useState } from "react"

import PostService from "../API/PostService";
import '../styles/LoginSignup.css'


const LoginSignup = ({onLogin, needToBeVerified, setNeedToBeVerified}) => {
  const [username, changeUsername] = useState('')
  const [email, changeEmail] = useState('')
  const [pass, changePass] = useState('')
  const [token, changeToken] = useState('')

  const onLog = async (e) => {
    e.preventDefault();
    if (email && pass){
      const response = await PostService.login(email, pass)

      if(response.status === 204){
        onLogin(true);
      } else { 
        if (response.status === 403){
        setNeedToBeVerified(true);
        }
      }
    }
  }

  const onSignUp = async (e) => {
    e.preventDefault();
    if (email && pass){
      const response = await PostService.signup(username, email, pass);

      console.log(response.data);

      if (response.status === 201){
        setNeedToBeVerified(true);
      }
    }
  }

  const onVerify = async (e) => {
    e.preventDefault();
    if (token){
      const response = await PostService.verificationRequest(token);

      if (response.status===200){
        onLogin(true);
        setNeedToBeVerified(false);
      } else {
        alert(response.status, response.data.detail);
      }
    }
  }

  const sendToken = async (e) => {
    e.preventDefault();

    if(email){
      const response = await PostService.sendToken(email);

      if (response.status===202){
        console.log('Token sent to email');
      } else {
        alert(response.status, response.data.detail);
      }
    }
  }

  if (needToBeVerified){
    return (
      <div className="log-container">
        <div className="main">
        <input type="checkbox" id="chk" aria-hidden="true"></input>

          <div className="signup">
            <form>
              <label className="labelLog" htmlFor="chk" aria-hidden="true">Send token</label>
              <input className="inputLog" type="email" name="email" placeholder="Email"
                      onChange={event => changeEmail(event.target.value)} value={email}/>
              <button className="btnLog" onClick={sendToken}>Send token to email</button>
              </form>
          </div>

          <div className="login">
            <form>
              <label className="labelLog" htmlFor="chk" aria-hidden="true">Verification</label>
              <input className="inputLog" type="text" name="txt" placeholder="Verification token"
                        onChange={e => changeToken(e.target.value)} value={token}/>
              <button className="btnLog" onClick={onVerify}>Verify</button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="log-container">
      <div className="main">  	
        <input type="checkbox" id="chk" aria-hidden="true"></input>

        <div className="signup">
          <form>
            <label className="labelLog" htmlFor="chk" aria-hidden="true">Sign up</label>
            <input className="inputLog" type="text" name="txt" placeholder="User name"
                    onChange={event => changeUsername(event.target.value)} value={username}/>
            <input className="inputLog" type="email" name="email" placeholder="Email"
                    onChange={event => changeEmail(event.target.value)} value={email}/>
            <input className="inputLog" type="password" name="pswd" placeholder="Password"
                    onChange={event => changePass(event.target.value)} value={pass}/>
            <button className="btnLog" onClick={onSignUp}>Sign up</button>
          </form>
        </div>

        <div className="login">
          <form>
            <label className="labelLog" htmlFor="chk" aria-hidden="true">Login</label>
            <input className="inputLog" type="email" name="email" placeholder="Email"
                    onChange={event => changeEmail(event.target.value)} value={email}/>
            <input className="inputLog" type="password" name="pswd" placeholder="Password"
                    onChange={event => changePass(event.target.value)} value={pass}/>
            <button className="btnLog" onClick={onLog}>Login</button>
          </form>
        </div>
    </div>
  </div>
  )
};


export default LoginSignup;
