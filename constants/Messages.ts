

/**
 * Predefined toast notification messages for the app.
 *
 * Supports multiple types of messages (`info`, `success`, `error`) 
 * with optional secondary text and display options.
 * Currently only English (`EN`) is provided. Can be extended for i18n.
 *
 * @remarks
 * - `text1`: Primary message (required)
 * - `text2`: Secondary message (optional)
 * - `type`: Toast type (`info`, `success`, `error`, etc.)
 * - `visibilityTime`: Duration in milliseconds the toast is visible (optional)
 * - `position`: Optional toast position (`top`, `bottom`)
 *
 * @example
 * import { ToastMessages } from "@/constants/ToastMessages";
 * 
 * showToast(ToastMessages.EN.NO_INTERNET);
 *
 * @example
 * const { text1, type, visibilityTime } = ToastMessages.EN.COPIED_TO_CLIPBOARD;
 * showToast({ text1, type, visibilityTime });
 */
export const ToastMessages = {
    EN: {
        NO_INTERNET: {
            text1: 'Hey', 
            text2: "You have no internet!", 
            type: "info",
            visibilityTime: 3500
        },
        UNABLE_TO_LOAD_IMAGES_INTERNET: {
            text1: "Unable to load images", 
            text2: "Please check your internet connection", 
            type: "error",
            visibilityTime: 3500
        },
        UNABLE_TO_LOAD_IMAGES: {
            text1: "Unable to load images", 
            type: "error",
            visibilityTime: 3500
        },        
        SYNC_LOCAL_DATABASE: {
            text1: "Synchronizing local database...", 
            type: "info"
        },
        SYNC_LOCAL_DATABASE_COMPLETED: {
            text1: "Sync completed", 
            type: "info"
        },
        SYNC_LOCAL_DATABASE_COMPLETED1: {
            text1: "Already synced", 
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
        INVALID_MANHWA: {
            text1: "Error", 
            text2: "Invalid manhwa", 
            type: "error"
        },        
        COMMENT_DELETED: {
            text1: "Deleted!", 
            type: "success"
        },
        NO_MANGAS: {
            text1: "No manhwas",
            text2: "Try to update the database", 
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
        BUG_REPORT_THANKS: {
            text1: "Thank you for helping improve the app!",
            type: 'success'
        },
        MANHWA_REQUEST_THANKS: {
            text1: "Thanks for your request!",
            text2: "We’ll consider adding it.",
            type: 'success'
        },
        DOCUMENT_EXISTS: {
            text1: 'Error',
            text2: "Document already exists!",
            type: "error",
            position: 'top'
        },
        INVALID_PASSWORD: {
            text1: "Error", 
            text2: "Invalid password", 
            type: "error1"
        },
        INVALID_TASK: {
            text1: "Invalid Task", 
            type: 'error'
        },
        COULD_NOT_CREATE_TODO: {
            text1: "Error", 
            text2: "Could not create todo", 
            type: "error"
        }
    }
}
