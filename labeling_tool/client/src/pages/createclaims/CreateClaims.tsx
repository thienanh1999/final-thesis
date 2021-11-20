import { Box, Button, Paper, Tab, TextField, Typography } from "@mui/material";
import React from "react";
import "./CreateClaims.scss"
import * as generalActions from "../../redux/general/actions";
import * as snackBarActions from "../../redux/snackbar/actions";
import { connect } from "react-redux";
import { SnackBarType } from "../../utils/enumerates";
import axios from "axios";
import { RouteComponentProps } from "react-router";
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

interface ICreateClaimsUrlParams {
    prjId?: string;
}
interface ICreateClaimsPropsFromDispatch {
    showTopLoading?: () => void;
    hideTopLoading?: () => void;
    showSnackBar?: (pMsg: string, pDuration: number, pType: SnackBarType) => void;
}
type ICreateClaimsProps = RouteComponentProps<ICreateClaimsUrlParams> & ICreateClaimsPropsFromDispatch;
const mapDispatcherToProps =
    (dispatch: any): ICreateClaimsPropsFromDispatch => {
        return {
            showSnackBar: (pMsg: string, pDuration: number, pType: SnackBarType) => dispatch(snackBarActions.showSnackBar(pMsg, pDuration, pType)),
            showTopLoading: () => dispatch(generalActions.showTopLoading()),
            hideTopLoading: () => dispatch(generalActions.hideTopLoading()),
        }
    }
interface ICreateClaimsPropsFromDispatch {
    showTopLoading?: () => void;
    hideTopLoading?: () => void;
    showSnackBar?: (pMsg: string, pDuration: number, pType: SnackBarType) => void;
}

interface ICreateClaimsState {
    currentArticle?: any;
    currentTab: string;
    searchContent: string;
    currentSeqNo: number;
    isOdd: boolean;
    searchResult: string;
    highlighted: number[];
    type3DropdownValue: number | string;
}
class CreateClaims extends React.Component<ICreateClaimsProps, ICreateClaimsState> {
    constructor(props: ICreateClaimsProps) {
        super(props);
        this.state = {
            currentArticle: {},
            currentTab: "1",
            searchContent: "",
            searchResult: "",
            currentSeqNo: 5432,
            highlighted: [],
            isOdd: true,
            type3DropdownValue: 0,
        }
    }
    componentDidMount() {
        const reqBody = {
            query: {
                constant_score: {
                    filter: {
                        term: {
                            _seq_no: this.state.currentSeqNo
                        }
                    }
                }

            }
        };
        const headers = {
            "Content-Type": "application/json"
        }
        axios.post(
            "http://52.221.198.189:9200/articles_covid19/_search?filter_path=hits.hits._source",
            reqBody,
            { headers }
        ).then((res: any) => {
            console.log(res);
            if (
                res &&
                res.data &&
                res.data.hits &&
                res.data.hits.hits &&
                Array.isArray(res.data.hits.hits) &&
                res.data.hits.hits.length > 0
            ) {
                console.log(res);
                this.setState({ currentArticle: res.data.hits.hits[this.state.isOdd ? 0 : 1]._source });
                if (
                    res.data.hits.hits[this.state.isOdd ? 0 : 1]._source &&
                    res.data.hits.hits[this.state.isOdd ? 0 : 1]._source.order &&
                    Array.isArray(res.data.hits.hits[this.state.isOdd ? 0 : 1]._source.order) &&
                    res.data.hits.hits[this.state.isOdd ? 0 : 1]._source.order.length > 3
                ) {
                    let randomNum = 0;
                    const orders = res.data.hits.hits[this.state.isOdd ? 0 : 1]._source.order;
                    if (orders.length > 8)
                        if (res.data.hits.hits[this.state.isOdd ? 0 : 1]._source.order.includes("table_0")) {
                            randomNum = Math.floor(Math.random() * (orders.length - 6)) + 1;
                        } else {
                            randomNum = Math.floor(Math.random() * (orders.length - 4));
                        }
                    this.setState({
                        highlighted: [
                            randomNum,
                            randomNum + 1,
                            randomNum + 2,
                            randomNum + 3,
                        ]
                    })
                }
            }
        })
    }
    private getArticleContent = (): string[] => {
        const { currentArticle } = this.state;
        const returnVal: string[] = [];
        if (
            currentArticle &&
            currentArticle.order &&
            Array.isArray(currentArticle.order)
        ) {
            currentArticle.order.forEach((fieldName: string) => {
                if (fieldName.includes("sen"))
                    returnVal.push(currentArticle[fieldName]);
            });
        }
        console.log(currentArticle)
        return returnVal;
    }
    render() {
        const { searchContent, searchResult, currentTab, highlighted, type3DropdownValue, isOdd } = this.state;
        const { showTopLoading, hideTopLoading } = this.props;
        return (
            <Box
                className={`create-claims-container`}
                sx={{
                    width: '100vw',
                    typography: 'body1',
                    pr: "5vw",
                    pl: "5vw",
                }}
            >
                <Typography
                    variant="h3"
                    component="div"
                    sx={{
                        mt: "20px",
                        flexGrow: 1,
                        fontStyle: "bold",
                        textAlign: "center"
                    }}
                >
                    Tạo mệnh đề mới
                </Typography>
                <Box
                    sx={{
                        width: '90vw',
                    }}
                >
                    <TabContext
                        value={currentTab}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <TabList onChange={(_, newVal) => this.setState({ currentTab: newVal })} aria-label="lab API tabs example">
                                <Tab label="Viết mệnh đề" value="1" />
                                <Tab label="Tìm kiếm bài báo" value="2" />
                            </TabList>
                        </Box>
                        <TabPanel value="1">
                            <Button
                                className={`bt-previous`}
                                variant="contained"
                                sx={{ mr: 1 }}
                                onClick={() => {
                                    this.props.showTopLoading!();
                                    const reqBody = {
                                        query: {
                                            constant_score: {
                                                filter: {
                                                    term: {
                                                        _seq_no: this.state.currentSeqNo - 1
                                                    }
                                                }
                                            }

                                        }
                                    };
                                    const headers = {
                                        "Content-Type": "application/json"
                                    }
                                    axios.post(
                                        "http://52.221.198.189:9200/articles_covid19/_search?filter_path=hits.hits._source",
                                        reqBody,
                                        { headers }
                                    ).then((res: any) => {
                                        console.log(res);
                                        if (
                                            res &&
                                            res.data &&
                                            res.data.hits &&
                                            res.data.hits.hits &&
                                            Array.isArray(res.data.hits.hits) &&
                                            res.data.hits.hits.length > 0
                                        ) {
                                            console.log(res);
                                            this.setState({ currentArticle: res.data.hits.hits[this.state.isOdd ? 0 : 1]._source });
                                            if (
                                                res.data.hits.hits[this.state.isOdd ? 0 : 1]._source &&
                                                res.data.hits.hits[this.state.isOdd ? 0 : 1]._source.order &&
                                                Array.isArray(res.data.hits.hits[this.state.isOdd ? 0 : 1]._source.order) &&
                                                res.data.hits.hits[this.state.isOdd ? 0 : 1]._source.order.length > 3
                                            ) {
                                                let randomNum = 0;
                                                const orders = res.data.hits.hits[this.state.isOdd ? 0 : 1]._source.order;
                                                if (orders.length > 8)
                                                    if (res.data.hits.hits[this.state.isOdd ? 0 : 1]._source.order.includes("table_0")) {
                                                        randomNum = Math.floor(Math.random() * (orders.length - 6)) + 1;
                                                    } else {
                                                        randomNum = Math.floor(Math.random() * (orders.length - 4));
                                                    }
                                                this.setState({
                                                    highlighted: [
                                                        randomNum,
                                                        randomNum + 1,
                                                        randomNum + 2,
                                                        randomNum + 3,
                                                    ]
                                                })
                                            }
                                        }
                                    }).finally(() => this.props.hideTopLoading!());
                                    this.setState({ currentSeqNo: this.state.currentSeqNo - 1 });
                                }
                                }
                            >
                                Quay lại
                            </Button>
                            <Button
                                className={`bt-previous`}
                                variant="contained"
                                onClick={() => {
                                    this.props.showTopLoading!();
                                    const reqBody = {
                                        query: {
                                            constant_score: {
                                                filter: {
                                                    term: {
                                                        _seq_no: this.state.currentSeqNo + 1
                                                    }
                                                }
                                            }

                                        }
                                    };
                                    const headers = {
                                        "Content-Type": "application/json"
                                    }
                                    axios.post(
                                        "http://52.221.198.189:9200/articles_covid19/_search?filter_path=hits.hits._source",
                                        reqBody,
                                        { headers }
                                    ).then((res: any) => {
                                        console.log(res);
                                        if (
                                            res &&
                                            res.data &&
                                            res.data.hits &&
                                            res.data.hits.hits &&
                                            Array.isArray(res.data.hits.hits) &&
                                            res.data.hits.hits.length > 0
                                        ) {
                                            console.log(res);
                                            this.setState({ currentArticle: res.data.hits.hits[this.state.isOdd ? 0 : 1]._source });
                                            if (
                                                res.data.hits.hits[this.state.isOdd ? 0 : 1]._source &&
                                                res.data.hits.hits[this.state.isOdd ? 0 : 1]._source.order &&
                                                Array.isArray(res.data.hits.hits[this.state.isOdd ? 0 : 1]._source.order) &&
                                                res.data.hits.hits[this.state.isOdd ? 0 : 1]._source.order.length > 3
                                            ) {
                                                let randomNum = 0;
                                                const orders = res.data.hits.hits[this.state.isOdd ? 0 : 1]._source.order;
                                                if (orders.length > 8)
                                                    if (res.data.hits.hits[this.state.isOdd ? 0 : 1]._source.order.includes("table_0")) {
                                                        randomNum = Math.floor(Math.random() * (orders.length - 6)) + 1;
                                                    } else {
                                                        randomNum = Math.floor(Math.random() * (orders.length - 4));
                                                    }
                                                this.setState({
                                                    highlighted: [
                                                        randomNum,
                                                        randomNum + 1,
                                                        randomNum + 2,
                                                        randomNum + 3,
                                                    ]
                                                })
                                            }
                                        }
                                    }).finally(() => this.props.hideTopLoading!());
                                    this.setState({ currentSeqNo: this.state.currentSeqNo + 1 });
                                }
                                }
                            >
                                Tiếp tục
                            </Button>
                            <Paper
                                sx={{
                                    mt: 2,
                                    p: 1,
                                    boxShadow: "-2px 0px 2px 1px #888888",
                                    borderRight: "1px solid #888888",
                                    maxHeight: "40vh",
                                    overflowY: "scroll"
                                }}
                            >
                                {this.getArticleContent().map((sentence, idx) => {
                                    return <p className={highlighted.includes(idx) ? "highlighted" : ""}>
                                        {sentence}
                                    </p>
                                })}
                            </Paper>
                            <TextField
                                sx={{
                                    width: "87vw",
                                    mt: 2,
                                    mb: 1,
                                }}
                                className={`tf-search`}
                                id={`tf-search`}
                                label="Mệnh đề chỉ sử dụng trích đoạn"
                                value={searchContent}
                                // error={!!passwordErrMsg}
                                // helperText={passwordErrMsg}
                                onChange={(ev) => {
                                    this.setState({
                                        searchContent: ev.target.value,
                                    })
                                }}
                            />
                            <TextField
                                sx={{
                                    width: "87vw",
                                    mt: 2,
                                    mb: 1,
                                }}
                                className={`tf-search`}
                                id={`tf-search`}
                                label="Mệnh đề sử dụng thêm thông tin bên ngoài"
                                value={""}
                                // error={!!passwordErrMsg}
                                // helperText={passwordErrMsg}
                                onChange={(ev) => {
                                    this.setState({
                                        searchContent: ev.target.value,
                                    })
                                }}
                            />
                            <TextField
                                sx={{
                                    width: "60vw",
                                    mt: 2,
                                    mb: 2,
                                }}
                                className={`tf-search`}
                                id={`tf-search`}
                                label="Mệnh đề biến đổi"
                                value={""}
                                // error={!!passwordErrMsg}
                                // helperText={passwordErrMsg}
                                onChange={(ev) => {
                                    this.setState({
                                        searchContent: ev.target.value,
                                    })
                                }}
                            />
                            <FormControl sx={{
                                width: "26vw",
                                mt: 2,
                                mb: 1,
                                ml: "1vw"
                            }}>
                                <InputLabel id="demo-simple-select-label">Phương pháp biến đổi</InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={type3DropdownValue}
                                    label="Phương pháp biến đổi"
                                    onChange={(newVal) => this.setState({ type3DropdownValue: newVal.target.value })}
                                >
                                    <MenuItem value={0}>Chi tiết hóa</MenuItem>
                                    <MenuItem value={1}>Khái quát hóa</MenuItem>
                                    <MenuItem value={2}>Phủ định hóa</MenuItem>
                                    <MenuItem value={3}>Viết lại câu </MenuItem>
                                    <MenuItem value={4}>Thay thế đại từ</MenuItem>
                                </Select>
                            </FormControl>
                            <Button
                                className={`bt-submit`}
                                sx={{ mr: 1 }}
                                variant="contained"
                                onClick={() => {
                                    showTopLoading!();
                                }}
                            >
                                Nộp
                            </Button>
                            <Button
                                className={`bt-submit`}
                                variant="contained"
                                onClick={() => {
                                    showTopLoading!();
                                }}
                            >
                                Bỏ qua
                            </Button>
                        </TabPanel>
                        <TabPanel value="2">
                            <TextField
                                sx={{ width: "50vw" }}
                                className={`tf-search`}
                                id={`tf-search`}
                                label="Tìm trong tiêu đề"
                                value={searchContent}
                                // error={!!passwordErrMsg}
                                // helperText={passwordErrMsg}
                                onChange={(ev) => {
                                    this.setState({
                                        searchContent: ev.target.value,
                                    })
                                }}
                            />
                            <Button
                                className={`bt-search`}
                                variant="contained"
                                onClick={() => {
                                    showTopLoading!();
                                    axios
                                        .post("http://52.221.198.189:9200/articles_covid19/_search", {
                                            data: {
                                                query: {
                                                    query_string: {
                                                        query: searchContent
                                                    }
                                                }
                                            }
                                        })
                                        .then(res => {
                                            this.setState({ searchResult: JSON.stringify(res, null, 4) })
                                        })
                                        .finally(() => hideTopLoading!())
                                }}
                            >
                                Tìm kiếm
                            </Button>
                            <p style={{ whiteSpace: "pre" }}>
                                {searchResult}
                            </p>
                        </TabPanel>
                    </TabContext>
                </Box>
            </Box >
        )
    }
}
export default connect(null, mapDispatcherToProps)(CreateClaims);