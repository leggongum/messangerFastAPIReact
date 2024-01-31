import axios from 'axios'

const URL = process.env.REACT_APP_HTTP_BACKEND

export default class PostService {

    static async login(email, pass){
        const url = URL + 'auth/jwt/login'

        const response = await axios.post(url, 
            new URLSearchParams({
                'username': email,
                'password': pass,
            }),{
            headers: {'Access-Control-Allow-Credentials' : true,
                    'Access-Control-Allow-Origin':'http://127.0.0.1:3000',
                    'Access-Control-Allow-Methods':'POST',},
            withCredentials: true,
            validateStatus: () => true,
        })
        return response
    }

    static async signup(username, email, pass){
        const url = URL + 'auth/register'

        const response = await axios.post(url, 
            {
                'username': username,
                'email': email,
                'password': pass,
                "is_active": true,
                "is_superuser": false,
                "is_verified": false,
                "created": 0
            },{
            headers: {'Access-Control-Allow-Credentials' : true,
                    'Access-Control-Allow-Origin':'http://react:3000',
                    'Access-Control-Allow-Methods':'POST',},
            withCredentials: true,
            validateStatus: () => true,
        })
        return response
    }

    static async sendToken(email){
        const url = URL + 'auth/request-verify-token'

        const response = await axios.post(url, 
            {
                'email': email,
            },{
            headers: {'Access-Control-Allow-Credentials' : true,
                    'Access-Control-Allow-Origin':'http://react:3000',
                    'Access-Control-Allow-Methods':'POST',},
            withCredentials: true,
            validateStatus: () => true,
        })
        return response
    }

    static async verificationRequest(token){
        const url = URL + 'auth/verify'

        const response = await axios.post(url, 
            {
                'token': token,
            },{
            headers: {'Access-Control-Allow-Credentials' : true,
                    'Access-Control-Allow-Origin':'http://react:3000',
                    'Access-Control-Allow-Methods':'POST',},
            withCredentials: true,
            validateStatus: () => true,
        })
        return response
    }

    static async editUser(userAttr, value){
        const url = URL + 'users/me/';

        const response = await axios.patch(url, {
                [userAttr]: value,
            }, {
            headers: {'Access-Control-Allow-Credentials' : true,
                    'Access-Control-Allow-Origin':'http://react:3000',
                    'Access-Control-Allow-Methods':'PATCH',},
            withCredentials: true,
            validateStatus: () => true,
        })
        return response
    }

    static async deleteUser(user_id){
        const url = URL + 'users/me'

        const response = await axios.delete(url, {
            data: {
                'id': user_id
            },
            headers: {'Access-Control-Allow-Credentials' : true,
                    'Access-Control-Allow-Origin':'http://react:3000',
                    'Access-Control-Allow-Methods':'DELETE',},
            withCredentials: true,
            validateStatus: () => true,
        })
        return response
    }

    static async getChannelsUser(){
        const url = URL + 'get_start_page'
        const response = await axios({
            url: url,
            mode: 'cors',
            method: 'GET',
            //credentials: 'include',
            withCredentials: true,
            headers: {'Access-Control-Allow-Credentials' : true,
                        'Access-Control-Allow-Origin':'http://react:3000',
                        'Access-Control-Allow-Methods':'GET',
                        'Access-Control-Allow-Headers':'application/json',},
            validateStatus: () => true,
            dataType:'jsonp',
        })
        return response
    }
    static async getChatsInChannel(channel_id){
        const url = URL + 'channels/channel?channel_id=' + channel_id
        const response = await axios({
            url: url,
            mode: 'cors',
            method: 'GET',
            //credentials: 'include',
            withCredentials: true,
            headers: {'Access-Control-Allow-Credentials' : true,
                        'Access-Control-Allow-Origin':'http://react:3000',
                        'Access-Control-Allow-Methods':'GET',
                        'Access-Control-Allow-Headers':'application/json',},
            dataType:'jsonp',
            validateStatus: () => true,
        })
        return response

    }

    static async getChat(chat_id){
        const url = URL + 'channels/chat?chat_id=' + chat_id
        const response = await axios({
            url: url,
            mode: 'cors',
            method: 'GET',
            withCredentials: true,
            headers: {'Access-Control-Allow-Credentials' : true,
                        'Access-Control-Allow-Origin':'http://react:3000',
                        'Access-Control-Allow-Methods':'GET',
                        'Access-Control-Allow-Headers':'application/json',},
            dataType:'jsonp',
            validateStatus: () => true,
        })
        return response
    }

    static async getMessages(chat_id, offset){
        const url = URL + 'channels/messages?chat_id=' + chat_id + '&limit=10&offset=' + offset
        const response = await axios({
            url: url,
            mode: 'cors',
            method: 'GET',
            withCredentials: true,
            headers: {'Access-Control-Allow-Credentials' : true,
                        'Access-Control-Allow-Origin':'http://react:3000',
                        'Access-Control-Allow-Methods':'GET',
                        'Access-Control-Allow-Headers':'application/json',},
            dataType:'jsonp',
            validateStatus: () => true,
        })
        return response
    }

    static async deleteMessage(message_id){
        const url = URL + 'channels/message'

        const response = await axios.delete(url, {
            data: {'id': message_id},
            headers: {'Access-Control-Allow-Credentials' : true,
                    'Access-Control-Allow-Origin':'http://react:3000',
                    'Access-Control-Allow-Methods':'DELETE',},
            withCredentials: true,
            validateStatus: () => true,
        })
        return response
    }

    static async updateMessage(message_id, text){
        const url = URL + 'channels/message'

        const response = await axios.put(url, {
                'id': message_id,
                'text': text,
            },{
            headers: {'Access-Control-Allow-Credentials' : true,
                    'Access-Control-Allow-Origin':'http://react:3000',
                    'Access-Control-Allow-Methods':'PUT',},
            withCredentials: true,
            validateStatus: () => true,
        })
        return response
    }

    static async addUserToChannel(user_id, channel_id){
        const url = URL + 'channels/add_user'

        const response = await axios.post(url, {
                'user_id': user_id,
                'channel_id': channel_id,
            },{
            headers: {'Access-Control-Allow-Credentials' : true,
                    'Access-Control-Allow-Origin':'http://react:3000',
                    'Access-Control-Allow-Methods':'POST',},
            withCredentials: true,
            validateStatus: () => true,
        })
        return response
    }

    static async deleteFromChannel(user_id, channel_id){
        const url = URL + 'channels/delete_user'

        const response = await axios.post(url, {
                'user_id': user_id,
                'channel_id': channel_id,
            },{
            headers: {'Access-Control-Allow-Credentials' : true,
                    'Access-Control-Allow-Origin':'http://react:3000',
                    'Access-Control-Allow-Methods':'POST',},
            withCredentials: true,
            validateStatus: () => true,
        })
        return response
    }

    static async addChatToChannel(title, description, channel_id){
        const url = URL + 'channels/create_chat'

        const response = await axios.post(url, {
                'title': title,
                'description': description,
                'channel_id': channel_id,
            },{
            headers: {'Access-Control-Allow-Credentials' : true,
                    'Access-Control-Allow-Origin':'http://react:3000',
                    'Access-Control-Allow-Methods':'POST',},
            withCredentials: true,
            validateStatus: () => true,
        })
        return response
    }

    static async deleteChat(chat_id){
        const url = URL + 'channels/chat'

        const response = await axios.delete(url, {
            data: {
                'id': chat_id
            },
            headers: {'Access-Control-Allow-Credentials' : true,
                    'Access-Control-Allow-Origin':'http://react:3000',
                    'Access-Control-Allow-Methods':'DELETE',},
            withCredentials: true,
            validateStatus: () => true,
        })
        return response
    }

    static async updateChat(chat_id, title, description){
        const url = URL + 'channels/chat'

        const response = await axios.put(url, {
                'id': chat_id,
                'title': title,
                'description': description,
            },{
            headers: {'Access-Control-Allow-Credentials' : true,
                    'Access-Control-Allow-Origin':'http://react:3000',
                    'Access-Control-Allow-Methods':'PUT',},
            withCredentials: true,
            validateStatus: () => true,
        })
        return response
    }

    static async createChannel(title, description){
        const url = URL + 'channels/create'

        const response = await axios.post(url, {
                'title': title,
                'description': description,
            },{
            headers: {'Access-Control-Allow-Credentials' : true,
                    'Access-Control-Allow-Origin':'http://react:3000',
                    'Access-Control-Allow-Methods':'POST',},
            withCredentials: true,
            validateStatus: () => true,
        })
        return response
    }

    static async updateChannel(channel_id, title, description){
        const url = URL + 'channels/'

        const response = await axios.put(url, {
                'id': channel_id,
                'title': title,
                'description': description,
            },{
            headers: {'Access-Control-Allow-Credentials' : true,
                    'Access-Control-Allow-Origin':'http://react:3000',
                    'Access-Control-Allow-Methods':'PUT',},
            withCredentials: true,
            validateStatus: () => true,
        })
        return response
    }

    static async deleteChannel(channel_id){
        const url = URL + 'channels/'

        const response = await axios.delete(url, {
            data: {
                'id': channel_id,
            },
            headers: {'Access-Control-Allow-Credentials' : true,
                    'Access-Control-Allow-Origin':'http://react:3000',
                    'Access-Control-Allow-Methods':'DELETE',},
            withCredentials: true,
            validateStatus: () => true,
        })
        return response
    }
}