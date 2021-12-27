import { Box, Button, Link, Paper, Stack, TextField, Typography } from "@mui/material";
import React from "react";
import "./index.scss"
import * as generalActions from "../../../redux/general/actions";
import * as snackBarActions from "../../../redux/snackbar/actions";
import { SnackBarType } from "../../../utils/enumerates";
import { connect } from "react-redux";
import projectAPI from "../../../api/projectAPI";
import history from "../../../history";
import { RouteComponentProps } from 'react-router';
import adminAPI from "../../../api/adminAPI";

const mapDispatcherToProps =
  (dispatch: any): IUpdateProjectPropsFromDispatch => {
    return {
      showSnackBar: (pMsg: string, pDuration: number, pType: SnackBarType) => dispatch(snackBarActions.showSnackBar(pMsg, pDuration, pType)),
      showTopLoading: () => dispatch(generalActions.showTopLoading()),
      hideTopLoading: () => dispatch(generalActions.hideTopLoading()),
    }
  }

interface IUpdateProjectPropsFromDispatch {
  showTopLoading?: () => void;
  hideTopLoading?: () => void;
  showSnackBar?: (pMsg: string, pDuration: number, pType: SnackBarType) => void;
}
interface IUpdateProjectUrlParams {
  prjid?: string;
}
type IUpdateProjectProps = RouteComponentProps<IUpdateProjectUrlParams> & IUpdateProjectPropsFromDispatch;
interface IUpdateProjectState {
  prjName: string;
  prjDesc: string;
  prjK: string;
  prjB1: string;
  prjSeqHL: string;
  prjMinTabRowHL: string;
  prjMaxTabRowHL: string;
  prjNameErrMsg: string;
}

class UpdateProject extends React.Component<IUpdateProjectProps, IUpdateProjectState> {
  constructor(props: IUpdateProjectProps) {
    super(props);
    this.state = {
      prjName: "",
      prjDesc: "",
      prjK: "",
      prjB1: "",
      prjSeqHL: "",
      prjMinTabRowHL: "",
      prjMaxTabRowHL: "",
      prjNameErrMsg: "",
    }
  }

  componentDidMount() {
    this.getData();

  }

  private getData = () => {
    this.props.showTopLoading!();
    projectAPI.getPrjDetail(this.props.match.params.prjid!).then(res => {
      this.setState({
        prjName: res.data.project_name,
        prjDesc: res.data.project_description,
        prjK: res.data.config.k,
        prjB1: res.data.config.b1,
        prjSeqHL: res.data.config.highlight.num_sequence_highlight,
        prjMinTabRowHL: res.data.config.highlight.min_table_row_highlight,
        prjMaxTabRowHL: res.data.config.highlight.max_table_row_highlight,
      })
    }).finally(() => this.props.hideTopLoading!());
  }
  render() {
    const {
      prjName,
      prjDesc,
      prjK,
      prjB1,
      prjSeqHL,
      prjMinTabRowHL,
      prjMaxTabRowHL,
      prjNameErrMsg,
    } = this.state;
    return (
      <div className={`createproject-container`}>
        <Paper elevation={1} sx={{
          width: "80%",
          height: "80%",
          m: "20px auto",
          pr: 5, pl: 5, pt: 3, pb: 3,
          textAlign: "start",
          flexDirection: "column",
          display: "flex",
        }}>
          <Typography
            variant="h5"
            component="div"
            sx={{
              mb: 2,
              flexGrow: 1,
              color: "#605F5F",
              fontStyle: "bold",
              fontWeight: 500
            }}
          >
            Cập nhật dự án
          </Typography>
          <TextField
            fullWidth
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
            fullWidth
            multiline
            rows={3}
            sx={{ mt: 2, mb: 2 }}
            className={`tf-desc tf`}
            id={`tf-desc`}
            label="Mô tả chi tiết"
            variant="outlined"
            value={prjDesc}
            onChange={(newVal) => this.setState({ prjDesc: newVal.target.value })}
          />
          <Stack direction={"row"}>

            <TextField
              sx={{ mb: 2, mr: 2, width: "145px" }}
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
              sx={{ mb: 2, mr: 2, width: "135px" }}
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
              sx={{ mb: 2, mr: 2, width: "265px" }}
              required
              className={`tf-highlighted-sentence tf`}
              id={`tf-highlighted-sentence`}
              type="number"
              label="Số lượng câu được đánh dấu"
              variant="outlined"
              onChange={(newVal) => this.setState({ prjSeqHL: newVal.target.value })}
              value={prjSeqHL}
            />
          </Stack>
          <Stack direction={"row"}>
            <TextField
              sx={{ mb: 2, mr: 2, width: "420px" }}
              required
              className={`tf-highlighted-table tf`}
              id={`tf-highlighted-table`}
              type="number"
              label="Số lượng hàng tối thiểu trong bảng được đánh dấu"
              value={prjMinTabRowHL}
              variant="outlined"
              onChange={(newVal) => this.setState({ prjMinTabRowHL: newVal.target.value })}
            />
            <TextField
              sx={{ mb: 2, mr: 2, width: "405px" }}
              required
              className={`tf-highlighted-table tf`}
              id={`tf-highlighted-table`}
              type="number"
              label="Số lượng hàng tối đa trong bảng được đánh dấu"
              value={prjMaxTabRowHL}
              variant="outlined"
              onChange={(newVal) => this.setState({ prjMaxTabRowHL: newVal.target.value })}
            />
          </Stack>
          <Box sx={{ flexGrow: 10, display: 'block' }} />
          <Stack direction={"row"}>
            <Button
              sx={{ mr: 2 }}
              color={"success"}
              className={`bt-create`}
              variant="contained"
              onClick={() => { history.push("/admin/projectmanagement"); }}
            >
              Quay lại
            </Button>
            <Button
              className={`bt-create`}
              variant="contained"
              onClick={() => {
                //TODO: validation
                this.props.showTopLoading!();
                adminAPI.updatePrj(
                  this.props.match.params.prjid!,
                  prjName,
                  prjDesc,
                  prjK,
                  prjB1,
                  prjSeqHL,
                  prjMinTabRowHL,
                  prjMaxTabRowHL,
                ).then((res: any) => {
                  console.log(res)
                  if (res.status === 201) {
                    this.props.showSnackBar!("Cập nhât dự án thành công!", 10000, SnackBarType.Success);
                  } else {
                    this.props.showSnackBar!("Cập nhât dự án thất bại! " + res.data.message, 10000, SnackBarType.Error);
                  }
                }).catch((err: any) => {
                  console.log(err)
                  if (!!err.errors && err.errors.name && Array.isArray(err.errors.es_id)) {
                    this.setState({ prjNameErrMsg: err.errors.name[0] });
                  }
                  this.props.showSnackBar!("Cập nhât dự án thất bại! ", 10000, SnackBarType.Error);
                }).finally(() => {
                  this.getData();

                  this.props.hideTopLoading!();
                })
              }}
            >
              Lưu thông tin
            </Button>
          </Stack>
        </Paper>
      </div>
    )
  }
}

export default connect(null, mapDispatcherToProps)(UpdateProject);
