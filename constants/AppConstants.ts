import { createDocumentPath } from "@/helpers/storage";
import { hp, wp } from "@/helpers/util";
import RNFS from 'react-native-fs';


export const AppConstants = {
  // =========================================================
  // APP INFO
  // =========================================================
  APP: {
    NAME: "Acerola",
    VERSION: "v1.1.1",
    DEBUG: { ENABLED: true },
    MANHWAS_DIR: `${RNFS.DocumentDirectoryPath}/manhwas`
  },

  // =========================================================
  // PATHS & URLS
  // =========================================================
  PATHS: {
    PORNHWAS_DOCUMENT: createDocumentPath('pornhwas'),
  },
  URLS: {
    PORNHWA_REDDIT: "https://www.reddit.com/r/pornhwa/",
  },

  // =========================================================
  // UI CONFIG
  // =========================================================
  UI: {
    ANIMATION_TIME: 200,
    MENU: {
      WIDTH: wp(65),
    },
    SCREEN: {
      WIDTH: wp(100),
      HEIGHT: hp(100),
      PADDING_HORIZONTAL: wp(4),
      PADDING_VERTICAL: hp(4),
    },
    ICON: { SIZE: wp(5) },
    BUTTON: { SIZE: hp(6.4) },
    BORDER_RADIUS: wp(1),
    BOTTOMSHEET_HANDLE_RADIUS: wp(4),
    MARGIN: wp(1.2),
    GAP: hp(1.2),

    ITEM_PADDING: {
      HORIZONTAL: hp(1),
      VERTICAL: hp(1.4),
    },

    TOAST: {
      HEIGHT: 66,
      WIDTH: wp(92),
      BOTTOM_OFFSET: 60,
      VISIBILITY_TIME: 2500,
      POSITION: "bottom",
    },

    DONATION: {
      BOTTOMSHEET: {
        TITLE: 'Enjoying the app?',
        MESSAGE: "Consider making a donation to help keep the servers running.",
      },
      DONATE_BANNER: { WIDTH: 1024, HEIGHT: 943 },
    },

    HIT_SLOP: {
      NORMAL: { left: 10, right: 10, top: 10, bottom: 10 },
      LARGE: { left: 20, right: 20, top: 20, bottom: 20 },
    },
  },

  // =========================================================
  // MEDIA & LAYOUT
  // =========================================================
  MEDIA: {
    MANHWA_COVER: {      
      WIDTH: wp(46) - hp(1.2) / 2,
      HEIGHT: hp(35),
    },
    RANDOM_MANHWAS: {
      MAX_WIDTH: wp(87),
      MAX_HEIGHT: hp(88),
    },
    GENRES: {
      ORIGINAL_WIDTH: 700,
      ORIGINAL_HEIGHT: 460,
      WIDTH: wp(42),
      HEIGHT: wp(42) * (460 / 700),
    },
  },

  // =========================================================
  // VALIDATION & LIMITS
  // =========================================================
  VALIDATION: {
    BUG_REPORT: {
      DEVICE_MIN_LENGHT: 3,
      DEVICE_MAX_LENGHT: 256,
      TITLE_MIN_LENGTH: 3,
      TITLE_MAX_LENGTH: 256,
      DESCR_MAX_LENGTH: 1024,
      BUG_TYPE_MAX_LENGTH: 64,
      MAX_IMAGES: 5,
    },
    MANHWA_REQUEST: {
      TITLE_MIN_LENGTH: 3,
      TITLE_MAX_LENGTH: 1024,
      DESCR_MAX_LENGTH: 512,
    },
    SETTINGS: {
      MIN_CACHE_SIZE: 64,    // MiB
      MAX_CACHE_SIZE: 256000 // MiB
    },
    NOTE: {
      TITLE_MIN_LENGTH: 3,
      TITLE_MAX_LENGTH: 256,
      CONTENT_MIN_LENGTH: 3
    },
    PAGE_LIMIT: 24,
  },

  // =========================================================
  // DATABASE
  // =========================================================
  DATABASE: {
    UPDATE_INTERVAL: {
      SERVER: 60 * 60 * 3 * 1000, // 3 HOURS
    },
    SIZE: {
      CACHE: 1024 * 1024 * 1024, // 1024 MiB
    },
  },

  // =========================================================
  // ENUMS & LISTS
  // =========================================================
  LISTS: {
    READING_STATUS: [
      'Completed',
      'Reading',
      'On Hold',
      'Dropped',
      'Plan to Read',
      'Re-Reading',
      'None',
    ],
    BUG_TYPE: [
      "Bug",            
      "Sugestion",
      "Broken",
      "ImagesOutOfOrder",
      "MissingImages",
      "Other",
    ],
  },

  // =========================================================
  // MISC
  // =========================================================
  CHAPTER: {
    GOAL_START: 32,
    GOAL_INCREMENT: 72,
  },
}