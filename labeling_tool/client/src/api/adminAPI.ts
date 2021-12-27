import { GenderType } from "../utils/enumerates";
import API from "./api";

class AdminAPI {
	getAllPrjs = () => {
    const url = `/project/list_all/`
    return API.get(url);
  }
  getAllUsers = () => {
		const url = "/user"
		return API.get(url);
	}
  deleteUser = (id: number) => {
		const url = `/user/${id}/`
		return API.delete(url);
	}
  deletePrj = (id: number) => {
		const url = `/project/${id}/`
		return API.delete(url);
	}
  updatePrj = (
    id: string,
    prjName: string,
    prjDesc: string,
    prjK: string,
    prjB1: string,
    prjSeqHL: string,
    prjMinTabRowHL: string,
    prjMaxTabRowHL: string,
  ) => {
		const url = `/project/${id}/`
    return API.put(url, {
      name: prjName,
      description: prjDesc,
      k: prjK,
      b1: prjB1,
      num_sequence_highlight: prjSeqHL,
      min_table_row_highlight: prjMinTabRowHL,
      max_table_row_highlight: prjMaxTabRowHL,
    })
  }
}

const adminAPI = new AdminAPI();
export default adminAPI;