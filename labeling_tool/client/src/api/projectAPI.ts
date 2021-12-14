import { Claim3Type } from "../utils/enumerates";
import API from "./api";
import { LabelType } from "../utils/enumerates";
class ProjectAPI {
    getAllProjects = () => {
        const url = '/project/';
        return API.get(url);
    };
    getPrjDetail = (id: string) => {
        const url = `/project/${id}`;
        return API.get(url);
    };
    getClaim = (prjId: string) => {
        const url = `/claim_verification/get_claim/`;
        const reqBody: any = { project_id: prjId };
        return API.post(url, reqBody);
    };
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
        const url = "/project/";
        return API.post(
            url,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                }
            }
        );
    };
    getHighLights = (prjId: string) => {
        const url = "/claim_generation/highlight/";
        const reqBody: any = { project_id: prjId };
        return API.post(url, reqBody);
    };
    submitClaims = (
        prjId: number,
        docId: number,
        c1: string,
        c2: string,
        c3: string,
        c3Type: Claim3Type
    ) => {
        const url = "/claim_generation/";
        const reqBody: any = {
            project_id: prjId,
            document_id: docId,
            claim_1: c1,
            claim_2: c2,
            claim_3: c3,
            sub_type: c3Type,
        };
        return API.post(url, reqBody);
    };
    annotateClaim = (
        prjId: number,
        claimId: number,
        label: LabelType,
        evidence: number[][][],
    ) => {
        const url = "/claim_verification/";
        const reqBody: any = {
            project_id: prjId,
            claim_id: claimId,
            label: label === LabelType.NotEnoughInfo ?
                "NEI" : label === LabelType.Refute ?
                    "REFUTED" : "SUPPORTED",
            evidence: evidence,
            annotator_operation: [
                [
                    {
                        operation: "start",
                        value: ["start"],
                        time: 0.0
                    }
                ]
            ]
        };
        return API.post(url, reqBody);
    }
    skipClaim = (prjId: number, claimId: number) => {
        const url = `/claim_verification/${claimId}/skip/`;
        return API.post(url, { project_id: prjId });
    }
    addMembers = (prjId: number, memberIds: number[]) => {
        const url = "/project_member/";
        return API.post(url, { project_id: prjId, user_ids: memberIds });

    }
    removeMembers = (prjId: number, memberIds: number[]) => {
        const url = "/project_member/";
        return API.delete(url, { data: { project_id: prjId, user_ids: memberIds } });
    }
}

const projectAPI = new ProjectAPI();
export default projectAPI;