import { Box, Button, Tab, TextField, Typography } from "@mui/material";
import React from "react";
import "./CreateClaims.scss"
import history from "../../history";
import * as generalActions from "../../redux/general/actions";
import * as snackBarActions from "../../redux/snackbar/actions";
import { connect } from "react-redux";
import userAPI from "../../api/userAPI";
import { SnackBarType } from "../../utils/enumerates";
import axios from "axios";
import { RouteComponentProps } from "react-router";
import { textAlign } from "@mui/system";
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';

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
    currentArticle: any;
    currentTab: string;
    searchContent: string;
    searchResult: string;
}
class CreateClaims extends React.Component<ICreateClaimsProps, ICreateClaimsState> {
    constructor(props: ICreateClaimsProps) {
        super(props);
        this.state = {
            currentArticle: {},
            currentTab: "2",
            searchContent: "",
            searchResult: "",
        }
    }
    componentDidMount() {
        axios.get("http://fimovm:9200/articles_covid19/_doc/mRuwFH0BV4JynfRTmzlX")
            .then(res => {
                console.log(res)
            })
    }
    render() {
        const { searchContent, currentArticle, currentTab, searchResult } = this.state;
        const { showTopLoading, hideTopLoading, showSnackBar } = this.props;
        return (
            <Box
                className={`create-claims-container`}
                sx={{
                    width: '100%',
                    typography: 'body1',
                    pr: 10,
                    pl: 10
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
                <TabContext
                    value={this.state.currentTab}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <TabList onChange={(_, newVal) => this.setState({ currentTab: newVal })} aria-label="lab API tabs example">
                            <Tab label="Viết mệnh đề" value="1" />
                            <Tab label="Tìm kiếm bài báo" value="2" />
                        </TabList>
                    </Box>
                    <TabPanel value="1">Viết mênh đề</TabPanel>
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
                            className={`bt-login`}
                            variant="contained"
                            onClick={() => {
                                showTopLoading!();
                                axios
                                    .get("http://fimovm:9200/articles_covid19/_search", {
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
        )
    }
}
export default connect(null, mapDispatcherToProps)(CreateClaims);