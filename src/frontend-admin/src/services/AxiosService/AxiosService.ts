import axios, {AxiosInstance} from 'axios'
import {ILoginContext} from '../../components/App/App'

export interface IUserInfo {
    name: string
    accessToken: string
    refreshToken: string
    isAdmin: boolean
}

export const URL = process.env.REACT_APP_API_URL

export class AxiosService {
    private user: ILoginContext = {
        refreshToken: '',
        accessToken: '',
        validTo: '',
        givenName: '',
        isAdmin: false,
    }
    private instance: AxiosInstance

    public constructor(user: ILoginContext) {
        this.user = {...user}

        this.instance = axios.create({
            baseURL: URL,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                crossdomain: true,
            },
        })
    }

    //wrapper for get requests return the promise
    public get: any = (url: string) => {
        return this.instance
            .get(url, {
                headers: {
                    Authorization: `Bearer ${this.user.accessToken}`,
                },
            })
            .then(response => {
                this.checkTokenExpired(url, 'get')
                return response.data
            })
            .catch(err => {
                console.error(err)
                this.checkTokenExpired(url, 'get')
            })
    }

    //wrapper method for post requests return the promise
    public post = (url: string, data: any) => {
        return this.instance
            .post(url, data, {
                headers: {
                    Authorization: `Bearer ${this.user.accessToken}`,
                },
            })
            .then(response => {
                this.checkTokenExpired(url, 'post', data)
                return response
            })
            .catch(err => {
                console.error(err)
                this.checkTokenExpired(url, 'post', data)
            })
    }

    //wrapper method for put requests return the promise
    public put = (url: string, data: any, headers?: any) => {
        return this.instance
            .put(url, data, {
                headers: {
                    Authorization: `Bearer ${this.user.accessToken}`,
                    ...headers,
                },
            })
            .then(response => {
                this.checkTokenExpired(url, 'put', data)
                return response
            })
            .catch(err => {
                console.error(err)
                this.checkTokenExpired(url, 'put', data)
            })
    }

    //check if token needs refreshing
    public checkTokenExpired = (url: string, type: string, data?: any) => {
        const now = Date.parse(new Date().toISOString())
        const expires = Date.parse(this.user.validTo)
        if (expires - now <= 0) {
            this.refreshToken(url, type, data)
        }
    }

    //get new access token w/ refresh token
    public refreshToken = (url: string, type: string, data?: any) => {
        return this.instance
            .get('/login/accessToken', {
                headers: {
                    Authorization: `Bearer ${this.user.refreshToken}`,
                },
            })
            .then(response => {
                if (response.status === 200) {
                    this.user = {
                        ...this.user,
                        accessToken: response.data[0].accesstoken,
                        validTo: response.data[0].validTo,
                    }
                    localStorage.setItem('user', JSON.stringify(this.user))
                    switch (type) {
                        case 'get':
                            return this.get(url)
                        case 'post':
                            return this.post(url, data)
                        case 'put':
                            return this.put(url, data)
                    }
                } else if (response.status === 401) {
                    //Unauthorized
                    //redirect back to login page
                    console.log('unauthorized')
                    this.user = {
                        refreshToken: '',
                        accessToken: '',
                        validTo: '',
                        givenName: '',
                        isAdmin: false,
                    }
                    localStorage.removeItem('user')
                    window.location.reload()
                }
            })
    }
}
