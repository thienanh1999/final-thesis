import axios from "axios";
import queryString from "querystring";

const API = axios.create({
    baseURL: process.env.REACT_APP_BASE_API_URL,
    headers: {
        'content-type': 'application/json',
    },
    paramsSerializer: params => queryString.stringify(params),
})

API.interceptors.request.use(
    async config => {
        return config;
    },
    err => {
        return Promise.reject(err.response.data);
    }
);

API.interceptors.response.use(
    res => {
        return res;
    },
    err => {
        return Promise.reject(err.response.data);
    }
);

export default API