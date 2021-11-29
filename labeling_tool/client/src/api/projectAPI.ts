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
        pMinTabRowHL: string,
        pMaxTabRowHL: string,
        pEsId: string,
        pFile: any,
    ) => {
        let formData = new FormData();
        formData.append("file", pFile);
        formData.append("name", pName);
        formData.append("description", pDesc);
        formData.append("k", pK);
        formData.append("b1", pB1);
        formData.append("num_sequence_highlight", pNoSeqHL);
        formData.append("min_table_row_highlight", pMinTabRowHL);
        formData.append("max_table_row_highlight", pMaxTabRowHL);
        formData.append("es_id", pEsId);
        const url = "/project/"
        return API.post(
            url,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                }
            }
        )
    }
}

const projectAPI = new ProjectAPI();
export default projectAPI;