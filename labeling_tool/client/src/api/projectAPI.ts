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
	skipHighlight = (prjId: string, articleId: string) => {
		const url = `/claim_generation/${articleId}/skip/`;
		const reqBody: any = { project_id: prjId };
		return API.put(url, reqBody);
	}
	exportData = (id: string) => {
		const url = `/project/download/`;
		return API.post(url, {
			project_id: id
		});
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
	uploadMoreData = (
		pPrjId: string,
		pFile: any,
	) => {
		let formData = new FormData();
		formData.append("file", pFile);
		formData.append("project_id", pPrjId);
		const url = "/project/upload_file/";
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
		let reqBody: any = {
			project_id: prjId,
			document_id: docId,
		};
		if (c1) reqBody.claim_1 = c1;
		if (c2) reqBody.claim_2 = c2;
		if (c3) { reqBody.claim_3 = c3; reqBody.sub_type = c3Type }
		return API.post(url, reqBody);
	};
	annotateClaim = (
		prjId: number,
		claimId: number,
		label: LabelType,
		evidence: number[][][],
		operations: OperationItem[][],
	) => {
		const url = "/claim_verification/";
		const reqBody: any = {
			project_id: prjId,
			claim_id: claimId,
			label: label === LabelType.NotEnoughInfo ?
				"NEI" : label === LabelType.Refute ?
					"REFUTED" : "SUPPORTED",
			evidence: evidence,
			annotator_operation: operations
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