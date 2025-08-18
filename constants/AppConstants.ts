import { hp, wp } from "@/helpers/util";


const IS_TABLET_AUX = Math.min(wp(100), hp(100)) >= 600


export const AppConstants = {
    APP_NAME: "Acerola",
    APP_VERSION: "v1.1.0",
    DEBUB: { ENABLED: false },
    PAGES: {
        HOME: {
            MENU_WIDTH: wp(65),
            MENU_ANIMATION_TIME: 300
        },
        CHAPTER: {
            HEADER_HEIGHT: hp(20),
            FOOTER_HEIGHT: hp(45)
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
        NORMAL: { left: 10, right: 10, top: 10, bottom: 10 },
        LARGE: { left: 20, right: 20, top: 20, bottom: 20 }
    },
    MANHWA_COVER: {
        WIDTH: wp(46) - hp(1.2) / 2,
        HEIGHT: hp(35)
    },
    MARGIN: wp(1.2),
    GAP: hp(1.2),
    ICON: { SIZE: wp(5) },
    BUTTON: { SIZE: hp(6.4) },
    BORDER_RADIUS: wp(1),
    SCREEN: {
        WIDTH: wp(100),
        HEIGHT: hp(100),
        PADDING_HORIZONTAL: wp(4),
        PADDING_VERTICAL: hp(4)
    },
    BOTTOMSHEET_HANDLE_RADIUS: wp(4),    
    IMAGE_TRANSITION: 200,
    IS_TABLET: IS_TABLET_AUX,
    DEFAULT_DRAW_DISTANCE: Math.floor(IS_TABLET_AUX ? hp(150) : hp(200)),
    DEFAULT_ON_END_REACHED_THRESHOLD: IS_TABLET_AUX ? 1 : 1.5,
    READING_STATUS: [
        'Completed',
        'Reading',
        'On Hold',
        'Dropped',
        'Plan to Read',
        'Re-Reading',
        'None'
    ],  
    ITEM_PADDING_HORIZONTAL: hp(1),
    ITEM_PADDING_VERTICAL: hp(1.4),
    CHAPTER_GOAL_START: 32,
    CHAPTER_GOAL_INCREMENT: 92,
    RANDOM_MANHWAS: {
        MAX_WIDTH: wp(87),
        MAX_HEIGHT: hp(88)
    },
    BUG_TYPE_LIST: [
        "Bug",            
        "Sugestion",
        "Broken",
        "ImagesOutOfOrder",
        "MissingImages",
        "Other"
    ],    
    TOAST: {
        HEIGHT: 66,
        WIDTH: wp(92),
        BOTTOM_OFFSET: 60,
        VISIBILITY_TIME: 2500,
        POSITION: "bottom"
    },
    URLS: { PORNHWA_REDDIT: "https://www.reddit.com/r/pornhwa/" },
    DONATION: {
        BOTTOMSHEET: {
            TITLE: 'Enjoying the app?',
            MESSAGE: "Consider making a donation to help keep the servers running."
        },
        DONATE_BANNER: { WIDTH: 1024, HEIGHT: 943 }
    },
    PAGE_LIMIT: 24
}
