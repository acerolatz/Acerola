import { Colors } from "./Colors";


export const AppConstants = {
    PAGES: {
        HOME: {
            MENU_WIDTH: 250,
            MENU_ANIMATION_TIME: 300
        },
        CHAPTER: {
            HEADER_HEIGHT: 160,
            FOOTER_HEIGHT: 500
        }
    },
    FORM: {
        BUG_REPORT: {
            DEVICE_MIN_LENGHT: 3,
            DEVICE_MAX_LENGHT: 256,
            TITLE_MIN_LENGTH: 3,
            TITLE_MAX_LENGTH: 256,
            DESCR_MAX_LENGTH: 1024,
            BUG_TYPE_MAX_LENGTH: 64,
            MAX_IMAGES: 5
        },
        MANHWA_REQUEST: {
            TITLE_MIN_LENGTH: 3,
            TITLE_MAX_LENGTH: 1024,
            DESCR_MAX_LENGTH: 512
        },        
        SETTINGS: {
            MIN_CACHE_SIZE: 64, // MiB
            MAX_CACHE_SIZE: 256000 // MiB
        }
    },
    COMMON: {
        APP_NAME: "Acerola",
        DEBUG_MODE: false,
        BORDER_RADIUS: 4,
        MARGIN: 6,
        MANHWA_COVER_DIMENSION: {
            WIDTH: 300,
            HEIGHT: 440
        },
        APP_VERSION: 'v1.0.0',
        SERVER_UPDATE_RATE: 60 * 60 * 3, // 3 HOURS
        CLIENT_UPDATE_RATE: 60 * 3, // 3 MINUTES
        COLLECTIONS_UPDATE_RATE: 60 * 60 * 48, // 48 HOURS
        DEFAULT_CACHE_SIZE: 1024 * 1024 * 1024, // 1024 MiB
        READING_STATUS: [
            'Completed',
            'Reading',
            'On Hold',
            'Dropped',
            'Plan to Read',
            'Re-Reading',
            'None'
        ],
        HIT_SLOP: {
            NORMAL: { 
                left: 10,
                right: 10,
                top: 10,
                bottom: 10
            },
            LARGE: {
                left: 20,
                right: 20,
                top: 20,
                bottom: 20
            }
        },
        CHAPTER_START_MILESTONE: 32,
        CHAPTER_MILESTONE_INCREMENT: 92,
        BUTTON: {
            SIZE: 22
        },
        BUT_TYPE_LIST: [
            "Bug",            
            "Sugestion",
            "Broken",
            "ImagesOutOfOrder",
            "MissingImages",
            "Other"
        ]
    },
    URLS: {
        REDDIT: "https://www.reddit.com/r/pornhwa/"        
    },
    TEXT: {
        SIZE: {
            LIGTH: 14,
            REGULAR: 18,
            SEMIBOLD: 24,
            BOLD: 26
        },        
        FONT: {
            LIGHT: "LeagueSpartan_200ExtraLight",
            REGULAR: "LeagueSpartan_400Regular",
            SEMIBOLD: "LeagueSpartan_600SemiBold"
        },
        COLOR: {
            LIGHT: Colors.white,
            DARK: Colors.backgroundColor,
            ERROR: Colors.neonRed
        }
    }
}
