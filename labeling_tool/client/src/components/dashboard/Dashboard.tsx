import { Button } from "@mui/material";
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

export default class Dashboard extends React.Component {
    render() {
        const rows = [
            {
                name: "Dự án 1",
                owner: "Thiên Anh",
                total: 3807,
                done: 1425
            },
            {
                name: "Dự án 1",
                owner: "Thiên Anh",
                total: 3807,
                done: 1425
            },
            {
                name: "Dự án 1",
                owner: "Thiên Anh",
                total: 3807,
                done: 1425
            },
        ]
        return (
            <div className={`dashboard-container`}>
                <Button
                    variant="contained"
                    className={`btn-create-new-prj`}
                    onClick={()=> history.push("/createproject")}
                >
                    Tạo dự án mới
                </Button>
                <TableContainer sx={{ mr: "5vw", ml: "5vw", maxWidth: "90vw" }} component={Paper}>
                    <Table sx={{ minWidth: 700 }} aria-label="customized table">
                        <TableHead>
                            <StyledTableRow>
                                <StyledTableCell>Tên dự án</StyledTableCell>
                                <StyledTableCell align="center">Quản lý dự án</StyledTableCell>
                                <StyledTableCell align="center">Mệnh đề</StyledTableCell>
                                <StyledTableCell align="center">Tiến trình</StyledTableCell>
                            </StyledTableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map((row) => (
                                <StyledTableRow
                                    key={row.name}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <StyledTableCell component="th" scope="row">
                                        <Link
                                            href="/project"
                                            sx={{ cursor: "pointer" }}
                                        >
                                            {row.name}
                                        </Link>
                                    </StyledTableCell>
                                    <StyledTableCell align="center">{row.owner}</StyledTableCell>
                                    <StyledTableCell align="center">{row.total}</StyledTableCell>
                                    <StyledTableCell align="center">{row.done}/{row.total}</StyledTableCell>
                                </StyledTableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
        )
    }
}