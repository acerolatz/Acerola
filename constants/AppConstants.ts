import { hp, wp } from "@/helpers/util";
import { Colors } from "./Colors";


export const AppConstants = {
    PAGES: {
        HOME: {
            MENU_WIDTH: wp(65),
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
    DEBUB: {
        ENABLED: true
    },
    MANHWA_COVER: {
        WIDTH: 300,
        HEIGHT: 440
    },
    DATABASE: {
        UPDATE_INTERVAL: {
            SERVER: 60 * 60 * 3, // 3 HOURS,
            CLIENT: 60 * 3, // 3 MINUTES,
            COLLECTIONS: 60 * 60 * 48, // 48 HOURS
        },
        SIZE: {
            CACHE: 1024 * 1024 * 1024, // 1024 MiB
        }
    },
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
    ICON: {
        SIZE: wp(5)
    },
    BUTTON: {
        SIZE: hp(6.4)
    },
    BOTTOMSHEET_HANDLE_RADIUS: wp(4),
    COMMON: {
        IMAGE_TRANSITION: 200,
        IS_TABLET: Math.min(wp(100), hp(100)) >= 600,
        APP_NAME: "Acerola",
        APP_VERSION: 'v1.0.0',
        BORDER_RADIUS: wp(1),
        MARGIN: wp(1.2),
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
        BUT_TYPE_LIST: [
            "Bug",            
            "Sugestion",
            "Broken",
            "ImagesOutOfOrder",
            "MissingImages",
            "Other"
        ],
        SCREEN_WIDTH: wp(100),
        SCREEN_HEIGHT: hp(100),
        SCREEN_PADDING_HORIZONTAL: wp(4),
        SCREEN_PADDING_VERTICAL: hp(4),
        RANDOM_MANHWAS: {
            MAX_WIDTH: wp(87),
            MAX_HEIGHT: hp(85)
        },
        GAP: hp(1.2),
        ITEM_PADDING_HORIZONTAL: hp(1),
        ITEM_PADDING_VERTICAL: hp(1.4)
    },
    TOAST: {
        HEIGHT: 66,
        WIDTH: wp(92),
        BOTTOM_OFFSET: 60,
        VISIBILITY_TIME: 2500,
        POSITION: "bottom"
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
    },
    DONATION: {
        BOTTOMSHEET: {
            TITLE: 'Enjoying the app?',
            MESSAGE: "Consider making a donation to help keep the servers running."
        },
        DONATE_BANNER: {
            WIDTH: 1024, 
            HEIGHT: 943
        }
    }
}
