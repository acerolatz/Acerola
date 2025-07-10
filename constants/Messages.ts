import { AppConstants } from "./AppConstants"


export const ToastMessages = {
    EN: {
        FAIL_AUTH: {
            text1: "We couldn’t authenticate your account", 
            text2: "Re-enter your username and password", 
            type: "error", 
            visibilityTime: 3500
        },
        FAIL_COMPUTE_VOTE: {
            text1: "Sorry, could not computate your vote", 
            type: "error"
        },
        FAIL_UPLOAD_COMMENT: {
            text1: "Could not upload comment!", 
            type: "error", 
            position: 'top'
        },
        NOT_LOGGED_IN: {
            text1: "You are not logged in", 
            type: "error"
        },
        NO_INTERNET: {
            text1: 'Hey', 
            text2: "You have no internet!", 
            type: "info"
        },
        SYNC_LOCAL_DATABASE: {
            text1: "Synchronizing local database...", 
            type: "info"
        },
        SYNC_LOCAL_DATABASE_COMPLETED: {
            text1: "Sync completed", 
            type: "info"
        },
        UNABLE_TO_OPEN_BROWSER: {
            text1: "Unable to open the browser", 
            type: "error"
        },
        COPIED_TO_CLIPBOARD: {
            text1: "Copied to clipboard!", 
            type: "success"
        },
        INVALID_MANGA: {
            text1: "Error", 
            text2: "invalid manga", 
            type: "error"
        },
        INVALID_PROFILE: {
            text1: "Invalid Profile", 
            type: "error"
        },
        INVALID_COMMENT_LENGTH: {
            text1: `Max ${AppConstants.COMMENT_MAX_LENGTH} and min ${AppConstants.COMMENT_MIN_LENGTH} characters`,
            type: "info", 
            position: 'top'
        },
        NO_MORE_COMMMENTS: {
            text1: "No more comments to load.", 
            type: "info"
        },
        COMMENT_DELETED: {
            text1: "Deleted!", 
            type: "success"
        },
        NO_MANGAS: {
            text1: "No mangas!", 
            text2: "Try update the database", 
            type: "info"
        },
        OPERATION_CANCELLED: {
            text1: 'Cancelled', 
            text2: 'Operation was cancelled', 
            type: 'info'
        },
        GENERIC_ERROR: {
            text1: "Error", 
            type: "error"
        },
        GENERIC_SUCCESS: {
            text1: "Success!", 
            type: "success"
        },
        GENERIC_SERVER_ERROR: {
            text1: "Server error", 
            type: 'error'
        },
        THANKS: {
            text1: "Thanks!", 
            type: "success"
        },
        WEAK_PASSWORD: {
            text1: "Weak Password!",
            text2: "Must contain at least 1 uppercase, 1 lowercase, 1 digit and 1 symbol", 
            type: "error"
        }
    }
}


export const Messages = {
    
}