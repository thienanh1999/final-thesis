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
    createPrj = (
        pName: string,
        pDesc: string,
        pK: string,
        pB1: string,
        pNoSeqHL: string,
        pTabRowHL: string,
        pEsId: string,
    ) => {
        const url = "/project/"
        return API.post(url, {
            name: pName,
            description: pDesc,
            k: pK,
            b1: pB1,
            num_sequence_highlight: pNoSeqHL,
            max_table_row_highlight: pTabRowHL,
            es_id: pEsId,
        })
    }
}

const projectAPI = new ProjectAPI();
export default projectAPI;