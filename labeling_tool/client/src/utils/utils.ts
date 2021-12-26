import { AlertColor } from "@mui/material";
import { SnackBarType } from "./enumerates";

const emailRegExp = new RegExp(/^(([^<>()\]\\.,;:\s@"]+(\.[^<>()\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);

export default class Utils {
    public static convertSnackBarType = (pType?: SnackBarType): AlertColor => {
        switch (pType) {
            case SnackBarType.Error:
                return "error";
            case SnackBarType.Warning:
                return "warning";
            case SnackBarType.Info:
                return "info";
            case SnackBarType.Success:
                return "success";
            default:
                return "info";
        }
    }

    public static passedEmailValidation = (pEmail: string): boolean => emailRegExp.test(pEmail);
}