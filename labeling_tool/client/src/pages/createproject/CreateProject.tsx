import { Button, Paper, TextField, Typography } from "@mui/material";
import React from "react";
import "./CreateProject.scss"
import * as generalActions from "../../redux/general/actions";
import * as snackBarActions from "../../redux/snackbar/actions";
import { SnackBarType } from "../../utils/enumerates";
import { connect } from "react-redux";
import projectAPI from "../../api/projectAPI";
import history from "../../history";

const mapDispatcherToProps =
    (dispatch: any): ICreateProjectPropsFromDispatch => {
        return {
            showSnackBar: (pMsg: string, pDuration: number, pType: SnackBarType) => dispatch(snackBarActions.showSnackBar(pMsg, pDuration, pType)),
            showTopLoading: () => dispatch(generalActions.showTopLoading()),
            hideTopLoading: () => dispatch(generalActions.hideTopLoading()),
        }
    }

interface ICreateProjectPropsFromDispatch {
    showTopLoading?: () => void;
    hideTopLoading?: () => void;
    showSnackBar?: (pMsg: string, pDuration: number, pType: SnackBarType) => void;
}

type ICreateProjectProps = ICreateProjectPropsFromDispatch;
interface ICreateProjectState {
    prjName: string;
    prjDesc: string;
    prjK: string;
    prjB1: string;
    prjEsId: string;
    prjSeqHL: string;
    prjTabRowHL: string;
    prjEsIdErrMsg: string;
    prjNameErrMsg: string;
}

class CreateProject extends React.Component<ICreateProjectProps, ICreateProjectState> {
    constructor(props: ICreateProjectProps) {
        super(props);
        this.state = {
            prjName: "",
            prjDesc: "",
            prjK: "",
            prjB1: "",
            prjEsId: "",
            prjSeqHL: "",
            prjTabRowHL: "",
            prjNameErrMsg: "",
            prjEsIdErrMsg: "",
        }
    }
    render() {
        const {
            prjName,
            prjDesc,
            prjK,
            prjB1,
            prjEsId,
            prjSeqHL,
            prjTabRowHL,
            prjEsIdErrMsg,
            prjNameErrMsg,
        } = this.state;
        return (
            <div className={`createproject-container`}>
                <Typography
                    variant="h3"
                    component="div"
                    sx={{
                        m: "60px",
                        flexGrow: 1,
                        fontStyle: "bold"
                    }}
                >
                    Tạo dự án
                </Typography>
                <TextField
                    className={`tf-project-name tf`}
                    required
                    id={`tf-project-name`}
                    label="Tên dự án"
                    variant="outlined"
                    value={prjName}
                    onChange={(newVal) => this.setState({ prjName: newVal.target.value })}
                    error={!!prjNameErrMsg}
                    helperText={prjNameErrMsg}
                />
                <TextField
                    multiline
                    className={`tf-desc tf`}
                    id={`tf-desc`}
                    label="Mô tả chi tiết"
                    variant="outlined"
                    value={prjDesc}
                    onChange={(newVal) => this.setState({ prjDesc: newVal.target.value })}
                />
                <div className={`div-upload`}>
                    <Button
                        className={`bt-upload`}
                        variant="contained"
                    >
                        Tải lên dữ liệu
                    </Button>
                    <Paper className={`pp-status`}>Chưa có dữ liệu</Paper>
                </div>
                <TextField
                    type="number"
                    required
                    className={`tf-b1 tf`}
                    id={`tf-b1`}
                    label="Tham số b1"
                    variant="outlined"
                    value={prjB1}
                    onChange={(newVal) => this.setState({ prjB1: newVal.target.value })}
                />
                <TextField
                    required
                    className={`tf-k tf`}
                    type="number"
                    id={`tf-k`}
                    label="Tham số k"
                    variant="outlined"
                    value={prjK}
                    onChange={(newVal) => this.setState({ prjK: newVal.target.value })}
                />
                <TextField
                    required
                    className={`tf-es-id tf`}
                    id={`tf-es-id`}
                    label="Elasticsearch Index"
                    variant="outlined"
                    value={prjEsId}
                    error={!!prjEsIdErrMsg}
                    helperText={prjEsIdErrMsg}
                    onChange={(newVal) => this.setState({ prjEsId: newVal.target.value })}
                />
                <TextField
                    required
                    className={`tf-highlighted-sentence tf`}
                    id={`tf-highlighted-sentence`}
                    type="number"
                    label="Số lượng câu được đánh dấu"
                    variant="outlined"
                    onChange={(newVal) => this.setState({ prjSeqHL: newVal.target.value })}
                    value={prjSeqHL}
                />
                <TextField
                    required
                    className={`tf-highlighted-table tf`}
                    id={`tf-highlighted-table`}
                    type="number"
                    label="Số lượng hàng được đánh dấu"
                    value={prjTabRowHL}
                    variant="outlined"
                    onChange={(newVal) => this.setState({ prjTabRowHL: newVal.target.value })}
                />
                <Button
                    className={`bt-create`}
                    variant="contained"
                    onClick={() => {
                        //TODO: validation
                        this.props.showTopLoading!();
                        projectAPI.createPrj(
                            prjName,
                            prjDesc,
                            prjK,
                            prjB1,
                            prjSeqHL,
                            prjTabRowHL,
                            prjEsId
                        ).then((res: any) => {
                            if (res.status === 201) {
                                history.push("/");
                                this.props.showSnackBar!("Khởi tạo dự án thành công!", 10000, SnackBarType.Success);
                            } else {
                                this.props.showSnackBar!("Khởi tạo dự án thất bại! " + res.data.message, 10000, SnackBarType.Error);
                            }
                        }).catch((err: any) => {
                            if (!!err.errors && err.errors.es_id && Array.isArray(err.errors.es_id)) {
                                this.setState({ prjEsIdErrMsg: err.errors.es_id[0] });
                            }
                            if (!!err.errors && err.errors.name && Array.isArray(err.errors.es_id)) {
                                this.setState({ prjNameErrMsg: err.errors.name[0] });
                            }
                            this.props.showSnackBar!("Khởi tạo dự án thất bại! ", 10000, SnackBarType.Error);
                        }).finally(() => this.props.hideTopLoading!())
                    }}
                >
                    Tạo dự án
                </Button>

            </div>
        )
    }
}

export default connect(null, mapDispatcherToProps)(CreateProject);
