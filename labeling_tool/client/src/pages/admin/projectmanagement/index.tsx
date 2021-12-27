import { Button, Typography, CircularProgress, IconButton, Stack, Box, Modal } from "@mui/material";
import React from "react";
import "./index.scss";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import Link from '@mui/material/Link';
import history from "../../../history";
import projectAPI from "../../../api/projectAPI";
import * as generalActions from "../../../redux/general/actions";
import { connect } from "react-redux";
import adminAPI from "../../../api/adminAPI";
import DeleteIcon from '@mui/icons-material/Delete';
import * as snackBarActions from "../../../redux/snackbar/actions";
import { SnackBarType } from "../../../utils/enumerates";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: "#1976d2",
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

interface IProjectManagementState {
  projectList: any[];
  imgLoaded: boolean;
  showDeleteModal: boolean;
  deletingUserId?: number;
  deletingUserName?: string;
}

interface IProjectManagementPropsFromDispatch {
  showTopLoading?: () => void;
  showSnackBar?: (pMsg: string, pDuration: number, pType: SnackBarType) => void;
  hideTopLoading?: () => void;
}

const mapDispatcherToProps = (dispatch: any): IProjectManagementPropsFromDispatch => {
  return {
    showTopLoading: () => dispatch(generalActions.showTopLoading()),
    showSnackBar: (pMsg: string, pDuration: number, pType: SnackBarType) => dispatch(snackBarActions.showSnackBar(pMsg, pDuration, pType)),
    hideTopLoading: () => dispatch(generalActions.hideTopLoading()),
  }
}

type IProjectManagementProps = IProjectManagementPropsFromDispatch;

class ProjectManagement extends React.Component<IProjectManagementProps, IProjectManagementState> {
  public constructor(props: any) {
    super(props);
    this.state = {
      projectList: [],
      imgLoaded: false,
      showDeleteModal: false,
    }
  }

  public componentDidMount() {
    this.getData();

  }
  private getData = () => {
    this.props.showTopLoading!();
    adminAPI.getAllPrjs().then(res => {
      if (
        !!res &&
        !!res.data &&
        !!res.status &&
        res.status === 200 &&
        res.data.count > 0 &&
        !!res.data.results
      ) {
        this.setState({ projectList: res.data.results, showDeleteModal: false })
      }
    }).finally(() => this.props.hideTopLoading!());
  }
  public render() {
    return (
      this.state.projectList.length > 0 ? <div className={`projectmanagement-container`}>
        <Paper
          elevation={1} sx={{
            width: "80%",
            height: "80%",
            m: "20px auto",
            pr: 5, pl: 5, pt: 3, pb: 3,
            textAlign: "start",
            flexDirection: "column",
            display: "flex",
          }}
        >
          <Button
            sx={{
              width: "max-content",
              mb: 2,
            }}
            variant="contained"
            className={`btn-create-new-prj`}
            onClick={() => history.push("/admin/usermanagement")}
          >
            Quản lý danh sách người dùng
          </Button>
          <Typography
            variant="h6"
            component="div"
            sx={{
              mb: 2,
              fontStyle: "bold",
              textAlign: "center",
              color: "#605F5F"
            }}
          >
            Danh sách dự án
          </Typography>
          <TableContainer component={Paper}>
            <Table aria-label="customized table">
              <TableHead>
                <StyledTableRow>
                  <StyledTableCell>Tên dự án</StyledTableCell>
                  <StyledTableCell align="center">ID</StyledTableCell>
                  <StyledTableCell align="center">Quản lý dự án</StyledTableCell>
                  <StyledTableCell align="center" sx={{ maxWidth: "300px" }}>Mô tả</StyledTableCell>
                  <StyledTableCell align="center">Elasticsearch Index</StyledTableCell>
                  <StyledTableCell align="center">Hành động</StyledTableCell>
                </StyledTableRow>
              </TableHead>
              <TableBody>
                {this.state.projectList.map((row) => (
                  <StyledTableRow
                    key={row.name}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <StyledTableCell component="th" scope="row">
                      <Link
                        href={`/admin/project/${row.id}`}
                        sx={{ cursor: "pointer" }}
                      >
                        {row.name}
                      </Link>
                    </StyledTableCell>
                    <StyledTableCell align="center">{row.id}</StyledTableCell>
                    <StyledTableCell align="center">{row.owner?.full_name}</StyledTableCell>
                    <StyledTableCell sx={{ maxWidth: "300px", overflowX: "hidden", textOverflow: "ellipsis" }} align="center">{row.description}</StyledTableCell>
                    <StyledTableCell align="center">{row.es_id}</StyledTableCell>
                    <StyledTableCell align="center"><IconButton
                      disabled={row.is_superuser}
                      edge="end"
                      aria-label="delete"
                      onClick={() => {
                        this.setState({
                          deletingUserId: row.id,
                          deletingUserName: row.name,
                          showDeleteModal: true,
                        })
                      }}
                    >
                      <DeleteIcon />
                    </IconButton></StyledTableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
        {this.renderDeleteModal()}

      </div > : <div className={`projectmanagement-empty-container`}>
        <Paper elevation={0} sx={{
          width: "700px",
          m: "100px auto",
          p: 5
        }}>
          {!this.state.imgLoaded && <CircularProgress />}
          <img
            style={this.state.imgLoaded ? {} : { display: 'none' }}
            onLoad={() => this.setState({ imgLoaded: true })}
            src="empty.png"
            alt="Không tìm thấy dự án nào!"
          />
          {this.state.imgLoaded && <Typography
            variant="h6"
            component="div"
            sx={{
              mt: "20px",
              fontStyle: "bold",
              textAlign: "center",
              color: "#605F5F"
            }}
          >
            Hiện tại bạn hệ thống chưa có dự án nào, <br></br>
            Vui lòng quay lại sau
          </Typography>}
          {this.state.imgLoaded && <Button
            sx={{ mt: 4 }}
            variant="contained"
            className={`btn-create-new-prj`}
            onClick={() => history.push("/admin/usermanagement")}
          >
            Quản lý danh sách người dùng
          </Button>}
        </Paper>

      </div>
    )
  }
  private renderDeleteModal = () => {
    const modalStyle: any = {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      bgcolor: 'background.paper',
      borderRadius: 2,
      boxShadow: 24,
      p: 3,
      textAlign: "start",
    };

    return <Modal
      open={this.state.showDeleteModal}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={modalStyle}>
        <Typography
          variant="h5"
          component="p"
          sx={{
            fontStyle: "bold",
            fontWeight: 500,
            mb: 2,
          }}
        >
          Xóa dự án
        </Typography>
        <Typography sx={{ mb: 3 }}>
          Bạn có chắc chắn muốn xóa dự án {this.state.deletingUserName ? this.state.deletingUserName : " dự án này"}
        </Typography>
        <Stack spacing={2} direction={"row-reverse"}>

          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              this.props.showTopLoading!();
              adminAPI.deletePrj(this.state.deletingUserId!).then(
                _ => {
                  this.getData();
                  this.props.showSnackBar!(
                    "Xóa tài khoản thành công!",
                    10000,
                    SnackBarType.Success
                  )
                }
              ).catch(_ => {
                this.props.showSnackBar!(
                  "Xóa tài khoản thất bại!",
                  10000,
                  SnackBarType.Error
                )
              }).finally(() => { this.props.hideTopLoading!(); })

            }}
          >
            Xóa
          </Button>
          <Button
            sx={{ background: "#BC6181" }}
            variant="contained"
            onClick={() => this.setState({ showDeleteModal: false })}
          >
            Hủy bỏ
          </Button>
        </Stack>

      </Box>
    </Modal>
  }
}

export default connect(null, mapDispatcherToProps)(ProjectManagement);
