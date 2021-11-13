import API from "./api";

class ProjectAPI {
    getAllProjects = () => {
        const url = '/project/';
        return API.get(url)
    }
    getPrjDetail = (id: string) => {
        const url = `/project/${id}`;
        return API.get(url)
    }
}

const projectAPI = new ProjectAPI();
export default projectAPI;