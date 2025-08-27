import { createDocumentPath } from "@/helpers/storage";
import { hp, wp } from "@/helpers/util";


export const AppConstants = {
    APP_NAME: "Acerola",
    APP_VERSION: "v1.1.1",
    DEBUB: { ENABLED: false },
    MENU_WIDTH: wp(65),
    MENU_ANIMATION_TIME: 300,
    PORNHWAS_DOCUMENT_PATH: createDocumentPath('pornhwas'),
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
    },
    
    DATABASE: {
        UPDATE_INTERVAL: {
            SERVER: 60 * 60 * 3 * 1000, // 3 HOURS
        },
        SIZE: {
            CACHE: 1024 * 1024 * 1024, // 1024 MiB
        }
    },
    HIT_SLOP: {
        NORMAL: { 
            left: 10, right: 10, top: 10, bottom: 10 
        },
        LARGE: { 
            left: 20, right: 20, top: 20, bottom: 20 
        }
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

    DEFAULT_WINDOW_SIZE: 5,
    DEFAULT_MAX_TO_RENDER_PER_BATCH: 5,
    DEFAULT_UPDATE_CELLS_BATCHING_PERIOD: 50,
    DEFAULT_ITEM_VISIBLE_PERCENTAGE_THRESHOLD: 50,
    DEFAULT_IMAGE_TRANSITION: 200,

    ITEM_PADDING_HORIZONTAL: hp(1),
    ITEM_PADDING_VERTICAL: hp(1.4),

    CHAPTER_GOAL_START: 32,
    CHAPTER_GOAL_INCREMENT: 72,
    RANDOM_MANHWAS: {
        MAX_WIDTH: wp(87),
        MAX_HEIGHT: hp(88)
    },

    GENRES: {
        ORIGINAL_WIDTH: 700,
        ORIGINAL_HEIGHT: 460,
        WIDTH: wp(42),
        HEIGHT: wp(42) * (460 / 700)
    },  

    READING_STATUS: [
        'Completed',
        'Reading',
        'On Hold',
        'Dropped',
        'Plan to Read',
        'Re-Reading',
        'None'
    ],
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
