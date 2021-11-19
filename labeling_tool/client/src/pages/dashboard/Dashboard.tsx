import { Button, Typography } from "@mui/material";
import React from "react";
import "./Dashboard.scss";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import Link from '@mui/material/Link';
import history from "../../history";
import projectAPI from "../../api/projectAPI";

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

interface IDashboardState {
    projectList: any[];
}

export default class Dashboard extends React.Component<{}, IDashboardState> {
    public constructor(props: any) {
        super(props);
        this.state = {
            projectList: []
        }
    }
    public componentDidMount() {
        projectAPI.getAllProjects().then(res => {
            console.log(res);
            if (
                !!res &&
                !!res.data &&
                !!res.status &&
                res.status === 200 &&
                res.data.count > 0 &&
                !!res.data.projects
            ) {
                this.setState({ projectList: res.data.projects })
            }
        })
    }
    public render() {
        return (
            <div className={`dashboard-container`}>
                <Button
                    variant="contained"
                    className={`btn-create-new-prj`}
                    onClick={() => history.push("/createproject")}
                >
                    Tạo dự án mới
                </Button>
                {
                    this.state.projectList.length > 0 &&
                    <TableContainer sx={{ mr: "5vw", ml: "5vw", maxWidth: "90vw" }} component={Paper}>
                        <Table sx={{ minWidth: 700 }} aria-label="customized table">
                            <TableHead>
                                <StyledTableRow>
                                    <StyledTableCell>Tên dự án</StyledTableCell>
                                    <StyledTableCell align="center">Quản lý dự án</StyledTableCell>
                                    <StyledTableCell align="center">Mô tả</StyledTableCell>
                                    {/* <StyledTableCell align="center">Mệnh đề</StyledTableCell>
                                    <StyledTableCell align="center">Tiến trình</StyledTableCell> */}
                                    <StyledTableCell align="center">Elasticsearch Index</StyledTableCell> 
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
                                                href={`/project/${row.id}`}
                                                sx={{ cursor: "pointer" }}
                                            >
                                                {row.name}
                                            </Link>
                                        </StyledTableCell>
                                        <StyledTableCell align="center">{row.owner?.full_name}</StyledTableCell>
                                        <StyledTableCell align="center">{row.description}</StyledTableCell>
                                        {/* <StyledTableCell align="center">{row.total}</StyledTableCell>
                                        <StyledTableCell align="center">{row.done}/{row.total}</StyledTableCell> */}
                                        <StyledTableCell align="center">{row.es_id}</StyledTableCell> 
                                    </StyledTableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                }
                {
                    this.state.projectList.length === 0 &&
                    <Typography
                        variant="h3"
                        component="div"
                        sx={{
                            mt: "20px",
                            fontStyle: "bold",
                            textAlign: "center",
                            width: "100vw",
                        }}
                    >
                        Hiện tại bạn đang không tham gia bất kỳ dự án nào, vui lòng liên hệ các Quản lý dự án để được thêm vào hoặc tạo một dự án mới!
                    </Typography>
                }
            </div >
        )
    }
}