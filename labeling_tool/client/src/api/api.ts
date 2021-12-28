import axios from "axios";
import queryString from "querystring";
import history from "../history";

const API = axios.create({
    baseURL: "http://localhost:8000/api",
    headers: {
        'content-type': 'application/json',
    },
    paramsSerializer: params => queryString.stringify(params),
})

API.interceptors.request.use(
    async config => {
        if (
            config !== undefined &&
            !!config.headers &&
            !!localStorage.getItem("accessToken") &&
            !!localStorage.getItem("loggedIn") &&
            localStorage.getItem("accessToken") !== "" &&
            localStorage.getItem("loggedIn") === "1"
        ) {
            config.headers.Authorization = `Bearer ${localStorage.getItem("accessToken")}`
        }
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
        if(err.response.status === 401) {
            localStorage.setItem("loggedIn", "0");
            history.push("/");
        }
        return Promise.reject(!!err.response?.data ? err.response.data : err.response);
    }
);

export default API