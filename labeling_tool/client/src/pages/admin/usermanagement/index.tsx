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
import userAPI from "../../../api/userAPI";
import * as generalActions from "../../../redux/general/actions";
import { connect } from "react-redux";
import adminAPI from "../../../api/adminAPI";
import DeleteIcon from '@mui/icons-material/Delete';
import { SnackBarType } from "../../../utils/enumerates";
import * as snackBarActions from "../../../redux/snackbar/actions";

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

interface IUserManagementState {
  userList: any[];
  imgLoaded: boolean;
  showDeleteModal: boolean;
  deletingUserId?: number;
  deletingUserName?: string;
}

interface IUserManagementPropsFromDispatch {
  showTopLoading?: () => void;
  showSnackBar?: (pMsg: string, pDuration: number, pType: SnackBarType) => void;
  hideTopLoading?: () => void;
}

const mapDispatcherToProps = (dispatch: any): IUserManagementPropsFromDispatch => {
  return {
    showTopLoading: () => dispatch(generalActions.showTopLoading()),
    hideTopLoading: () => dispatch(generalActions.hideTopLoading()),
    showSnackBar: (pMsg: string, pDuration: number, pType: SnackBarType) => dispatch(snackBarActions.showSnackBar(pMsg, pDuration, pType)),
  }
}

type IUserManagementProps = IUserManagementPropsFromDispatch;

class UserManagement extends React.Component<IUserManagementProps, IUserManagementState> {
  public constructor(props: any) {
    super(props);
    this.state = {
      userList: [],
      imgLoaded: false,
      showDeleteModal: false
    }
  }

  public componentDidMount() {
    this.getData();
  }

  private getData = () => {
    this.props.showTopLoading!();
    adminAPI.getAllUsers().then(res => {
      if (
        !!res &&
        !!res.data &&
        !!res.status &&
        res.status === 200 &&
        res.data.count > 0 &&
        !!res.data.results
      ) {
        this.setState({ userList: res.data.results, showDeleteModal: false })
      }
    }).finally(() => this.props.hideTopLoading!());
  }
  public render() {
    return (
      this.state.userList.length > 0 ? <div className={`usermanagement-container`}>
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
            onClick={() => history.push("/admin/projectmanagement")}
          >
            Quản lý dự án
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
            Danh sách người dùng
          </Typography>
          <TableContainer component={Paper}>
            <Table aria-label="customized table">
              <TableHead>
                <StyledTableRow>
                  <StyledTableCell>Email</StyledTableCell>
                  <StyledTableCell align="center">ID</StyledTableCell>
                  <StyledTableCell align="center">Họ và tên</StyledTableCell>
                  <StyledTableCell align="center">Số điện thoại</StyledTableCell>
                  <StyledTableCell align="center">Giới tính</StyledTableCell>
                  <StyledTableCell align="center">Cấp bậc</StyledTableCell>
                  <StyledTableCell align="center">Hành động</StyledTableCell>
                </StyledTableRow>
              </TableHead>
              <TableBody>
                {this.state.userList.map((row) => (
                  <StyledTableRow
                    key={row.name}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <StyledTableCell component="th" scope="row">
                        {row.email}
                    </StyledTableCell>
                    <StyledTableCell align="center">{row.id}</StyledTableCell>
                    <StyledTableCell align="center">{row.full_name}</StyledTableCell>
                    <StyledTableCell align="center">{row.phone}</StyledTableCell>
                    <StyledTableCell align="center">{row.gender === 0 ? "Nam" : row.gender === 1 ? "Nữ" : "Khác"}</StyledTableCell>
                    <StyledTableCell align="center">{row.is_superuser ? "Admin" : "Người dùng"}</StyledTableCell>
                    <StyledTableCell align="center"><IconButton
                      disabled={row.is_superuser}
                      edge="end"
                      aria-label="delete"
                      onClick={() => {
                        this.setState({
                          deletingUserId: row.id,
                          deletingUserName: row.full_name,
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

      </div > : <div className={`usermanagement-empty-container`}>
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
            onClick={() => history.push("/createuser")}
          >
            Tạo dự án mới
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
          Xóa người dùng
        </Typography>
        <Typography sx={{ mb: 3 }}>
          Bạn có chắc chắn muốn xóa tài khoản {this.state.deletingUserName ? this.state.deletingUserName : " nguời dùng này"}
        </Typography>
        <Stack spacing={2} direction={"row-reverse"}>

          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              this.props.showTopLoading!();
              adminAPI.deleteUser(this.state.deletingUserId!).then(
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

export default connect(null, mapDispatcherToProps)(UserManagement);
