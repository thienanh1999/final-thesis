import { Accordion, Button, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, TextField, Typography, AccordionSummary, AccordionDetails, Box, Slider, Stack } from "@mui/material";
import React from "react";
import { connect } from "react-redux";
import { SearchType, SnackBarType } from "./../../../utils/enumerates";
import * as generalActions from "./../../../redux/general/actions";
import * as snackBarActions from "./../../../redux/snackbar/actions";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import "./../index.scss";
import searchAPI from "../../../api/searchAPI";
interface ISearchTabPropsFromDispatch {
    showTopLoading?: () => void;
    hideTopLoading?: () => void;
    showSnackBar?: (pMsg: string, pDuration: number, pType: SnackBarType) => void;
}

interface ISearchTabOwnProps {
    esId?: string;
}

type ISearchTabProps = ISearchTabOwnProps & ISearchTabPropsFromDispatch;

interface ISearchTabState {
    searchContent: string;
    currentSearchType: SearchType;
    searchedArticles: any[];
    noOfSearchRes: number;
    minScore: number | string | Array<number | string>;
    showResCnt: boolean;
}

const mapDispatcherToProps = (dispatch: any): ISearchTabPropsFromDispatch => {
    return {
        showSnackBar: (pMsg: string, pDuration: number, pType: SnackBarType) => dispatch(snackBarActions.showSnackBar(pMsg, pDuration, pType)),
        showTopLoading: () => dispatch(generalActions.showTopLoading()),
        hideTopLoading: () => dispatch(generalActions.hideTopLoading()),
    }
}


class SearchTab extends React.Component<ISearchTabProps, ISearchTabState> {
    public constructor(props: any) {
        super(props);
        this.state = {
            searchContent: "",
            currentSearchType: SearchType.SearchAllFields,
            searchedArticles: [],
            noOfSearchRes: 0,
            minScore: 25,
            showResCnt: false,
        }
    }

    public render() {
        const {
            searchContent,
            currentSearchType,
            searchedArticles,
            noOfSearchRes,
            minScore,
            showResCnt,
        } = this.state;
        const {
            showTopLoading,
            hideTopLoading,
            esId
        } = this.props;
        const pMinScore = typeof this.state.minScore === 'number' ?
            this.state.minScore : 0;
        return <Stack spacing={2}>
            <TextField
                fullWidth
                className={`tf-search`}
                id={`tf-search`}
                label="Nội dung tìm kiếm"
                value={searchContent}
                onChange={(ev) => {
                    this.setState({
                        searchContent: ev.target.value,
                    })
                }}
            />
            <FormControl sx={{ mt: 1, display: "block" }} component="fieldset">
                <FormLabel component="legend">Phạm vi tìm kiếm</FormLabel>
                <RadioGroup
                    row
                    aria-label="Phạm vi tìm kiếm"
                    name="rbg-search-range"
                    value={currentSearchType}
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
            </FormControl>
            <div>
                <FormLabel component="legend">Độ liên quan tối thiểu</FormLabel>
                <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
                    <Typography variant="subtitle2" > 0 </Typography>
                    <Slider
                        aria-label="Min score"
                        value={typeof minScore === 'number' ? minScore : 0}
                        onChange={(_, newVal) =>
                            this.setState({ minScore: newVal })}
                        valueLabelDisplay="on"
                        // valueLabelFormat=""
                        // step={1}
                        // marks
                        min={0}
                        max={50}
                    />
                    <Typography variant="subtitle2" > 50 </Typography>
                </Stack>
            </div>
            <Button
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
                            pMinScore,
                            0
                        ).then(res => {
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
            </Button>
            {!!showResCnt && <Typography
                // sx={{ textAlign: "center" }}
                variant="h6"
            >
                {`${noOfSearchRes} Kết quả`}
            </Typography>}
            {searchedArticles.map((article: any, idx: number) => {
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
                                <p>
                                    <Typography variant="caption" >
                                        {sentence}
                                    </Typography>
                                </p>)}
                        </AccordionDetails>
                    </Accordion>
                } else return <></>;
            })}
        </Stack>
    }

    private getArticleContent = (idx: number): string[] => {
        const { searchedArticles } = this.state;
        const returnVal: string[] = [];
        searchedArticles[idx]._source.order.forEach((fieldName: string) => {
            if (fieldName.includes("sen"))
                returnVal.push(searchedArticles[idx]._source[fieldName]);
        });
        return returnVal;
    }

    private onSearchRangeRadioGroupChanged = (ev: any) => {
        this.setState({ currentSearchType: ev.target.value });
    }
}
export default connect(null, mapDispatcherToProps)(SearchTab);