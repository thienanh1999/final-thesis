import { Grid, Accordion, Button, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, TextField, Typography, AccordionSummary, AccordionDetails, Box, Slider, Stack, Paper, Tab, List, ListItem, IconButton, ListItemAvatar, Avatar, ListItemText, Divider, InputLabel, Select, MenuItem } from "@mui/material";
import React from "react";
import "./index.scss"
import * as generalActions from "../../redux/general/actions";
import * as snackBarActions from "../../redux/snackbar/actions";
import { connect } from "react-redux";
import { LabelType, SearchType, SnackBarType } from "./../../utils/enumerates";
import { RouteComponentProps } from "react-router";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import searchAPI from "../../api/searchAPI";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import DeleteIcon from '@mui/icons-material/Delete';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import projectAPI from "../../api/projectAPI";
import history from "../../history";


interface IAnnotateClaimsUrlParams {
    prjid?: string;
    esid?: string;
}
interface IAnnotateClaimsPropsFromDispatch {
    showTopLoading?: () => void;
    hideTopLoading?: () => void;
    showSnackBar?: (pMsg: string, pDuration: number, pType: SnackBarType) => void;
}
type IAnnotateClaimsProps = RouteComponentProps<IAnnotateClaimsUrlParams> & IAnnotateClaimsPropsFromDispatch;
const mapDispatcherToProps =
    (dispatch: any): IAnnotateClaimsPropsFromDispatch => {
        return {
            showSnackBar: (pMsg: string, pDuration: number, pType: SnackBarType) => dispatch(snackBarActions.showSnackBar(pMsg, pDuration, pType)),
            showTopLoading: () => dispatch(generalActions.showTopLoading()),
            hideTopLoading: () => dispatch(generalActions.hideTopLoading()),
        }
    }
interface IAnnotateClaimsPropsFromDispatch {
    showTopLoading?: () => void;
    hideTopLoading?: () => void;
    showSnackBar?: (pMsg: string, pDuration: number, pType: SnackBarType) => void;
}

interface IAnnotateClaimsState {
    searchContent: string;
    currentSearchType: SearchType;
    searchedArticles: any[];
    noOfSearchRes: number;
    minScore: number | string | Array<number | string>;
    currentTab: string;
    showResCnt: boolean;
    evidenceSets: EvidenceSet[];
    label: LabelType;
    claimId: number;
    claimContent: string;
    evidenceIds: string[];
}

enum EvidenceType {
    Sentence,
    TableCell
}

interface EvidenceItem {
    content: string;
    pos: string;
    type: EvidenceType
}

interface EvidenceSet {
    articleId: string;
    title: string;
    time: string;
    evidences: EvidenceItem[];
}

class AnnotateClaims extends React.Component<IAnnotateClaimsProps, IAnnotateClaimsState> {
    public constructor(props: IAnnotateClaimsProps) {
        super(props);
        this.state = {
            searchContent: "",
            claimContent: "",
            claimId: 0,
            currentSearchType: SearchType.SearchAllFields,
            searchedArticles: [],
            noOfSearchRes: 0,
            currentTab: "0",
            minScore: 25,
            showResCnt: false,
            evidenceSets: [],
            evidenceIds: [],
            label: LabelType.NotEnoughInfo,
        }
    }

    private getNewClaim = () => {
        const prjId = this.props.match.params.prjid;
        const { showTopLoading, showSnackBar, hideTopLoading } = this.props;
        showTopLoading!();
        projectAPI.getClaim(prjId!).then(res => {
            if (res && res.status === 200 && !!res.data.claim_id) {
                this.setState({
                    claimId: res.data.claim_id,
                    claimContent: !!res.data.claim ? res.data.claim : "",
                });
            } else {
                history.push("/");
                showSnackBar!(
                    "Tất cả mệnh đề đều đã được xử lý! Bạn vui lòng tạo thêm mệnh đề để gán nhãn nha!",
                    10000,
                    SnackBarType.Info
                );
            }
        }).catch(_ => {
            history.push("/");
            showSnackBar!(
                "Tất cả mệnh đề đều đã được xử lý! Bạn vui lòng tạo thêm mệnh đề để gán nhãn nha!",
                10000,
                SnackBarType.Info
            );
        }).finally(() => {
            hideTopLoading!();
        })
    }
    public componentDidMount() {
        this.getNewClaim();
    }
    public render() {
        return <Stack direction={{ xs: 'column', sm: 'column', md: 'row', lg: 'row' }} sx={{ p: 2 }}>
            <Grid item xs={6} sx={{ minWidth: "400px" }}>
                <Paper sx={{ p: 2, mr: 2 }} >
                    <Stack spacing={2}>
                        {this.renderCurrentClaim()}
                        {this.renderEvidences()}
                        {this.renderSubmitForm()}
                    </Stack>
                </Paper>
            </Grid>
            <Grid item xs={6} sx={{ minWidth: "400px", maxHeight: "100%" }}>
                <Paper sx={{
                    p: 2,
                    maxHeight: "85vh",
                    overflowY: "scroll"
                }} >
                    <Stack spacing={2}>
                        {this.renderSearchSectionTitle()}
                        {this.renderSearchBox()}
                        {this.renderSearchTypeChoices()}
                        {this.renderMinimumScoreSettings()}
                        {this.renderSearchButton()}
                        {this.renderResultCount()}
                        {this.renderSearchResults()}
                    </Stack>
                </Paper>
            </Grid>
        </Stack>
    }

    private renderSearchBox = () => {
        return <TextField
            fullWidth
            className={`tf-search`}
            id={`tf-search`}
            label="Nội dung tìm kiếm"
            value={this.state.searchContent}
            onChange={(ev) => {
                this.setState({
                    searchContent: ev.target.value,
                })
            }}
        />;
    }

    private renderSearchTypeChoices = () => {
        return <FormControl sx={{ mt: 1, display: "block" }} component="fieldset">
            <FormLabel component="legend">Phạm vi tìm kiếm</FormLabel>
            <RadioGroup
                row
                aria-label="Phạm vi tìm kiếm"
                name="rbg-search-range"
                value={this.state.currentSearchType}
                onChange={this.onSearchRangeRadioGroupChanged}
            >
                <FormControlLabel
                    value={SearchType.SearchAllFields}
                    control={<Radio />}
                    label="Tất cả các trường"
                />
                <FormControlLabel
                    value={SearchType.SearchByTitle}
                    control={<Radio />}
                    label="Tiêu đề"
                />
            </RadioGroup>
        </FormControl>;
    }

    private renderMinimumScoreSettings = () => {
        const { minScore } = this.state;
        return <div>
            <FormLabel component="legend">Độ liên quan tối thiểu</FormLabel>
            <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
                <Typography variant="subtitle2" > 0 </Typography>
                <Slider
                    aria-label="Min score"
                    value={typeof minScore === 'number' ? minScore : 0}
                    onChange={(_, newVal) =>
                        this.setState({ minScore: newVal })}
                    valueLabelDisplay="on"
                    min={0}
                    max={50}
                />
                <Typography variant="subtitle2" > 50 </Typography>
            </Stack>
        </div>;
    }

    private renderSearchButton = () => {
        const esId = this.props.match.params.esid;
        const {
            searchContent,
            currentSearchType,
        } = this.state;
        const minScore = typeof this.state.minScore === 'number' ?
            this.state.minScore : 0;
        const {
            showTopLoading,
            hideTopLoading,
        } = this.props;
        return <Button
            sx={{ mt: 1, width: 150, p: 1 }}
            className={`bt-search`}
            variant="contained"
            onClick={() => {
                if (!!searchContent) {
                    showTopLoading!();
                    searchAPI.advanceSearch(
                        esId!,
                        searchContent,
                        currentSearchType,
                        minScore,
                        0
                    ).then(res => {
                        console.log(res)
                        if (
                            res &&
                            res.data &&
                            res.data.hits &&
                            res.data.hits.hits &&
                            Array.isArray(res.data.hits.hits)
                        )
                            this.setState({
                                searchedArticles: res.data.hits.hits,
                                noOfSearchRes: res.data.hits.total.value,
                                showResCnt: true,
                            });
                    }).finally(() => hideTopLoading!());
                }
            }}
        >
            Tìm kiếm
        </Button>;
    }

    private renderSearchSectionTitle = () => {
        return <Typography
            variant="h6"
        >
            Công cụ tìm kiếm
        </Typography>
    }
    private renderResultCount = () => {
        const { showResCnt, noOfSearchRes } = this.state;
        return !!showResCnt && <span> {`${noOfSearchRes} Kết quả`} </span>
    }

    private renderSearchResults = () => {
        const { searchedArticles, minScore, evidenceSets, evidenceIds } = this.state;
        return searchedArticles.map((article: any, idx: number) => {
            if (
                article &&
                article._source &&
                article._source.title &&
                article._source.time &&
                article._source.order &&
                searchedArticles[idx]._score > minScore
            ) {
                return <Accordion sx={{ mt: 1 }}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        id={`article-no-${idx}`}
                    >
                        <Box sx={{ flexDirection: 'column' }}>
                            <Typography variant="subtitle2" >
                                {article._source.title}
                            </Typography>
                            <Typography variant="caption" >
                                {article._source.time}
                            </Typography>
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                        {this.getArticleContent(idx).map((sentence) =>
                            <p
                                className={`tg-sentence`}
                                style={{ padding: "5px" }}
                                onClick={() => {
                                    if (evidenceIds.includes(sentence.articleId)) {
                                        const i = evidenceIds.indexOf(sentence.articleId);
                                        const newSets = evidenceSets.map((set, j) => {
                                            if (i !== j) return set;
                                            else return {
                                                ...set,
                                                evidences: [
                                                    ...set.evidences,
                                                    {
                                                        content: sentence.content,
                                                        pos: sentence.pos,
                                                        type: EvidenceType.Sentence
                                                    }
                                                ]
                                            };
                                        });
                                        this.setState({
                                            evidenceSets: newSets,
                                            currentTab: (newSets.length - 1).toString(),
                                        });
                                    } else {
                                        this.setState({
                                            evidenceSets: [
                                                ...evidenceSets,
                                                {
                                                    articleId: sentence.articleId,
                                                    title: sentence.title,
                                                    time: sentence.time,
                                                    evidences: [{
                                                        content: sentence.content,
                                                        pos: sentence.pos,
                                                        type: EvidenceType.Sentence
                                                    }]
                                                }
                                            ],
                                            evidenceIds: [
                                                ...evidenceIds,
                                                sentence.articleId
                                            ],
                                            currentTab: evidenceIds.length.toString(),
                                        });
                                    }
                                }}
                            >
                                <Typography variant="caption"  >
                                    {sentence.content}
                                </Typography>
                            </p>)}
                    </AccordionDetails>
                </Accordion>
            } else return <></>;
        })
    }

    private renderCurrentClaim = () => {
        return <React.Fragment>
            <Typography
                variant="h6"
            >
                Mệnh đề hiện tại
            </Typography>
            <Paper elevation={1} sx={{ p: 1 }}>
                <Typography
                    variant="body2"
                >
                    {this.state.claimContent}
                </Typography>
            </Paper>
        </React.Fragment>
    }

    private renderSubmitForm = () => {
        return <Stack sx={{ mt: 2 }} direction={{ xs: 'column', sm: 'column', md: 'column', lg: "column", xl: "row" }} spacing={2} >
            <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Nhãn</InputLabel>
                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={this.state.label}
                    label="Nhãn"
                    onChange={(e) => this.setState({ label: e.target.value as LabelType })}
                >
                    <MenuItem value={LabelType.Support}>Support</MenuItem>
                    <MenuItem value={LabelType.Refute}>Refute</MenuItem>
                    <MenuItem value={LabelType.NotEnoughInfo}>Not enough info</MenuItem>
                </Select>
            </FormControl>
            <Button
                variant="contained"
                color="success"
                sx={{ minWidth: 200 }}
                onClick={() => {
                    this.getNewClaim();
                    this.props.showSnackBar!(
                        "Gán nhãn thành công!",
                        10000,
                        SnackBarType.Success
                    );
                }}
            >
                Gán nhãn
            </Button>
            <Button
                onClick={() => {
                    this.getNewClaim();
                    this.props.showSnackBar!(
                        "Đã tải mệnh đề khác!",
                        10000,
                        SnackBarType.Info
                    );
                }}
                variant="contained"
                sx={{ minWidth: 200 }}
            >
                Bỏ qua
            </Button>
        </Stack>
    }

    private renderEvidences = () => {
        const { currentTab, evidenceSets, evidenceIds } = this.state;
        return <React.Fragment>
            <Typography
                variant="h6"
            >
                Chứng cứ
            </Typography>
            {!(evidenceSets.length > 0) ? "Chưa có dữ liệu" : <TabContext value={currentTab} >
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <TabList onChange={(_, newVal) => this.setState({ currentTab: newVal })} aria-label="lab API tabs example">
                        {evidenceIds.map((_, idx) => {
                            return <Tab label={`Tập ${idx + 1}`} value={(idx).toString()} />;
                        })}
                    </TabList>
                </Box>
                {evidenceSets.map((evidenceSet, idx) => {
                    return <TabPanel sx={{ pt: 0, pb: 0, pr: 1, pl: 1 }} value={(idx).toString()}>
                        {!(evidenceSets.length > idx) ? <p >Chưa có dữ liệu</p> : <React.Fragment>
                            <Typography variant="subtitle2" >
                                {evidenceSet.title}
                            </Typography>
                            <Typography variant="caption" >
                                {evidenceSet.time}
                            </Typography>
                            <Box>
                                <Typography variant="caption"  >
                                    ID bài báo: {evidenceSet.articleId}
                                </Typography>
                            </Box>
                            {evidenceSet.evidences.map((evidence, ii) => {
                                return <React.Fragment>
                                    <List dense>
                                        <ListItem
                                            secondaryAction={
                                                <IconButton
                                                    edge="end"
                                                    aria-label="delete"
                                                    onClick={() => {
                                                        if (evidenceSet.evidences.length === 1) {
                                                            this.setState({
                                                                evidenceSets: evidenceSets.filter((_, iii) => (iii !== idx)),
                                                                evidenceIds: evidenceIds.filter((_, iii) => (iii !== idx)),
                                                            })
                                                        } else {
                                                            this.setState({
                                                                evidenceSets: evidenceSets.map((se, iii) => {
                                                                    if (iii !== idx) return se;
                                                                    else return {
                                                                        ...se,
                                                                        evidences: se.evidences.filter((_, jj) => jj !== ii)
                                                                    }
                                                                })
                                                            })
                                                        }
                                                    }}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            }
                                        >
                                            <ListItemAvatar>
                                                <Avatar>
                                                    <TextSnippetIcon />
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={evidence.pos}
                                                secondary={evidence.content}
                                            />
                                        </ListItem>
                                    </List>
                                    <Divider />
                                </React.Fragment>
                            })}
                        </React.Fragment>}
                    </TabPanel>
                })}
            </TabContext>}
        </React.Fragment>
    }

    private getArticleContent = (idx: number): any[] => {
        const { searchedArticles } = this.state;
        const returnVal: any[] = [];
        searchedArticles[idx]._source.order.forEach((fieldName: string) => {
            if (fieldName.includes("sen"))
                returnVal.push({
                    content: searchedArticles[idx]._source[fieldName],
                    pos: fieldName,
                    articleId: searchedArticles[idx]._id,
                    title: searchedArticles[idx]._source.title,
                    time: searchedArticles[idx]._source.time,
                });
        });
        return returnVal;
    }

    private onSearchRangeRadioGroupChanged = (ev: any) => {
        this.setState({ currentSearchType: ev.target.value });
    }
}

export default connect(null, mapDispatcherToProps)(AnnotateClaims);