import API from "./api";

class UserAPI {
    login = (pEmail: string, pPassword: string) => {
        const url = '/auth/login';
        return API.post(url, { email: pEmail, password: pPassword });
    }
    getAllUsers = () => {
        const url = "/user"
        return API.get(url);
    }
}

const userAPI = new UserAPI();
export default userAPI;