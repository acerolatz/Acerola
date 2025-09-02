import { 
  Author,
  Chapter,
  DebugInfo,  
  DownloadByManhwa,  
  DownloadRecord,  
  DownloadRequest,  
  DownloadStatus,  
  Genre,    
  Manhwa, 
  ManhwaAuthor, 
  ManhwaGenre,    
  ManhwaRating,    
  ServerManhwa,    
  Todo,  
  UserData 
} from '@/helpers/types';
import {
  asyncPool,
  dbGetSupportedAbis, 
  formatBytes, 
  getCacheSizeBytes, 
  getDeviceName
} from '@/helpers/util';
import { AppConstants } from '@/constants/AppConstants';
import DeviceInfo from 'react-native-device-info';
import { spGetManhwas, spRegisterNewUser, spUpdateUserLastLogin } from './supabase';
import { AuthorSet } from '@/helpers/AuthorSet';
import { GenreSet } from '@/helpers/GenreSet';
import * as SQLite from 'expo-sqlite';
import uuid from 'react-native-uuid';
import { createChapterDir, deleteDocumentDir } from '@/helpers/storage';


export async function dbMigrate(db: SQLite.SQLiteDatabase) {
  console.log("[DATABASE MIGRATION START]")
  await db.execAsync(`
    
    -- ===============================
    --             PRAGMAs
    -- ===============================
      PRAGMA journal_mode = WAL;
      PRAGMA synchronous = NORMAL;
      PRAGMA foreign_keys = ON;
      PRAGMA temp_store = MEMORY;
      PRAGMA cache_size = -1024;
      PRAGMA mmap_size = 268435456;
      PRAGMA optimize;
    -- ===============================
    

    -- ===============================
    ---             DROP
    -- ===============================
    DROP TABLE IF EXISTS chapters;
    DROP TABLE IF EXISTS collections;
    DROP TABLE IF EXISTS update_history;
    DROP TABLE IF EXISTS logs;
    DROP TABLE IF EXISTS documents;
    -- ===============================


    -- ===============================
    --            TABLES
    -- ===============================

    CREATE TABLE IF NOT EXISTS app_info (
      name TEXT NOT NULL PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS app_numeric_info (
      name TEXT NOT NULL PRIMARY KEY,
      value INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS manhwas (
      manhwa_id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      descr TEXT NOT NULL,
      cover_image_url TEXT NOT NULL,
      status TEXT NOT NULL,
      color TEXT NOT NULL,
      views INTEGER NOT NULL DEFAULT 0,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS manhwa_ratings (
      manhwa_id INTEGER PRIMARY KEY,
      user_rating INTEGER NOT NULL DEFAULT 0,
      rating INTEGER NOT NULL DEFAULT 0,
      total_rating INTEGER NOT NULL DEFAULT 0      
    );

    CREATE TABLE IF NOT EXISTS alt_titles (
      manhwa_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      PRIMARY KEY (manhwa_id, title),
      FOREIGN KEY (manhwa_id) REFERENCES manhwas(manhwa_id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE TABLE IF NOT EXISTS genres (
      genre_id INTEGER PRIMARY KEY,
      genre TEXT NOT NULL        
    );
    
    CREATE TABLE IF NOT EXISTS manhwa_genres (
      genre_id INTEGER NOT NULL,
      manhwa_id INTEGER NOT NULL,
      CONSTRAINT manhwa_genres_pkey PRIMARY KEY (manhwa_id, genre_id),
      CONSTRAINT manhwa_genres_manhwa_id_fkey FOREIGN KEY (manhwa_id) REFERENCES manhwas (manhwa_id) ON UPDATE CASCADE ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS authors (
      author_id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS manhwa_authors (
      author_id INTEGER NOT NULL,
      manhwa_id INTEGER NOT NULL,
      role TEXT NOT NULL,
      CONSTRAINT manhwa_authors_pkey PRIMARY KEY (manhwa_id, author_id, role),
      CONSTRAINT manhwa_authors_manhwa_id_fkey FOREIGN KEY (manhwa_id) REFERENCES manhwas (manhwa_id) ON UPDATE CASCADE ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reading_status (
      manhwa_id INTEGER NOT NULL PRIMARY KEY,
      status TEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS reading_history (
      manhwa_id INTEGER NOT NULL,      
      chapter_id INTEGER NOT NULL,
      readed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (manhwa_id, chapter_id)          
    );    

    CREATE TABLE IF NOT EXISTS todos (
      todo_id INTEGER NOT NULL PRIMARY KEY,
      title TEXT NOT NULL,
      descr TEXT,
      completed INTEGER NOT NULL DEFAULT 0 CHECK (completed IN (0, 1)),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      finished_at TIMESTAMP DEFAULT NULL      
    );

    CREATE TABLE IF NOT EXISTS downloads (
      chapter_id INTEGER PRIMARY KEY,
      manhwa_id INTEGER NOT NULL,
      chapter_name TEXT NOT NULL,
      path TEXT NOT NULL,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'downloading', 'completed', 'failed', 'cancelled')),
      progress INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL      
    );

    -- ===============================


    -- ===============================
    --              DELETE
    -- ===============================
    DELETE FROM downloads WHERE status NOT IN ('completed', 'pending');
    -- ===============================

    -- ===============================
    --              INDEX
    -- ===============================
    CREATE INDEX IF NOT EXISTS idx_authors_name ON authors(name);
    CREATE INDEX IF NOT EXISTS idx_ma_author_id ON manhwa_authors(author_id);
    CREATE INDEX IF NOT EXISTS idx_ma_manhwa_id ON manhwa_authors(manhwa_id);
    
    CREATE INDEX IF NOT EXISTS idx_reading_status_manhwa_id_status ON reading_status(manhwa_id, status);
    CREATE INDEX IF NOT EXISTS idx_reading_history_readed_at ON reading_history(manhwa_id, readed_at DESC);

    CREATE INDEX IF NOT EXISTS idx_manhwa_genres_genre_id ON manhwa_genres(genre_id);
    
    CREATE INDEX IF NOT EXISTS idx_manhwas_views ON manhwas(views DESC);
    
    CREATE INDEX IF NOT EXISTS idx_alt_titles ON alt_titles(title, manhwa_id);
    CREATE INDEX IF NOT EXISTS idx_alt_titles_manhwa ON alt_titles(manhwa_id);
    CREATE INDEX IF NOT EXISTS idx_manhwas_updated_at ON manhwas(updated_at DESC);

    CREATE INDEX IF NOT EXISTS idx_downloads_status ON downloads(status);
    CREATE INDEX IF NOT EXISTS idx_downloads_created_at ON downloads(created_at);
    -- ================================
    

    -- ===============================
    --             INSERT
    -- ===============================
    BEGIN TRANSACTION;
      
      INSERT OR REPLACE INTO 
        app_info (name, value)
      VALUES 
        ('version', '${AppConstants.APP.VERSION}');
      
      INSERT INTO 
        app_info (name, value)
      VALUES
        ('device', ''),
        ('last_sync_time', ''),
        ('password', '')
      ON CONFLICT 
        (name) 
      DO NOTHING;
      
      INSERT INTO 
        app_numeric_info (name, value)
      VALUES
        ('images', 0),
        ('first_run', 1),
        ('should_ask_for_donation', 1),
        ('is_safe_mode_on', 0),
        ('current_chapter_milestone', ${AppConstants.CHAPTER.GOAL_START}),
        ('last_refreshed_at', 0)
      ON CONFLICT
        (name) 
      DO NOTHING;

    COMMIT;
  `
  ).catch(error => console.log("DATABASE MIGRATION ERROR", error));
  console.log("[DATABASE MIGRATION END]")
}


/**
 * Reads all rows from a given **local SQLite database** table.
 *
 * @template T - The expected type of each row returned.
 * @param db - SQLite database instance.
 * @param table - The name of the table to query.
 * @returns A promise that resolves to an array of rows of type T. Returns an empty array if the query fails.
 */
export async function dbReadAll<T>(db: SQLite.SQLiteDatabase, table: string): Promise<T[]> {
  const r = await db.getAllAsync<T>(
    `SELECT * FROM ${table};`
  ).catch(error => console.log(`error dbReadAll ${table}`, error))
  return r ? r : []
}


/**
 * Retrieves the maximum size allowed for the **image cache stored on the device** in bytes
 * from the **local SQLite database**.
 *
 * If the value is not found in the database, it will initialize it with the default size
 * from AppConstants and return that default.
 *
 * @param db - SQLite database instance.
 * @returns A promise that resolves to the maximum image cache size in bytes.
 */
export async function dbGetCacheMaxSize(db: SQLite.SQLiteDatabase): Promise<number> {
  const r = await dbReadNumericInfo(db, 'cacheMaxSize')
  if (!r) {
    await dbSetNumericInfo(db, 'maxCacheSize', AppConstants.DATABASE.SIZE.CACHE)
    return AppConstants.DATABASE.SIZE.CACHE
  }
  return r
}


/**
 * Sets the maximum allowed size for the **image cache stored on the device** in bytes
 * in the **local SQLite database**.
 *
 * @param db - SQLite database instance.
 * @param size - The new maximum image cache size in bytes.
 * @returns A promise that resolves once the value has been saved.
 */
export async function dbSetCacheMaxSize(db: SQLite.SQLiteDatabase, totalBytes: number) {
  await dbSetNumericInfo(db, 'maxCacheSize', totalBytes)
}


/**
 * Determines whether the **image cache stored on the device** should be cleared
 * by checking the **local SQLite database**.
 *
 * Compares the current cache size in bytes with the maximum allowed cache size
 * stored in the database.
 *
 * @param db - SQLite database instance.
 * @returns A promise that resolves to `true` if the current cache size exceeds
 *          the maximum allowed size, otherwise `false`.
 */
export async function dbShouldClearCache(db: SQLite.SQLiteDatabase): Promise<boolean> {
  const maxSize = await dbGetCacheMaxSize(db)
  const cacheSize = await getCacheSizeBytes()
  return cacheSize > maxSize;
}


/**
 * Counts the number of rows in a specified table from the **local SQLite database**.
 *
 * @param db - SQLite database instance
 * @param table - The name of the table to count rows from.
 * @returns A promise that resolves to the total number of rows in the table.
 */
export async function dbCount(db: SQLite.SQLiteDatabase, table: string): Promise<number> {
  const r = await db.getFirstAsync<{total: number}>(
    `
      SELECT 
        count(*) as total 
      FROM 
        ${table};
    `
  )
  return r ? r.total : 0
}


/**
 * Calculates the total size of the **local SQLite database** in megabytes (MiB).
 *
 * @param db - SQLite database instance
 * @returns A promise that resolves to the total database size in MiB, or `null` if the size could not be determined.
 */
async function dbGetTotalSizeMiB(db: SQLite.SQLiteDatabase): Promise<number | null> {
  const r = await db.getFirstAsync<{total_size_mb: number}>(
    `
      SELECT 
        CAST(page_count * page_size AS REAL) / 1024 / 1024 as total_size_mb 
      FROM 
        pragma_page_count(), 
        pragma_page_size();
      `
  )
  return r ? r.total_size_mb : null
}


export async function dbLog(db: SQLite.SQLiteDatabase) {  
  console.log("==========================")
  console.log("=====ACEROLA DATABASE=====")
  const r = [
    'num_tables: ' + (await db.getFirstAsync<{num_tables: number}>(`SELECT count(*) as num_tables FROM sqlite_master WHERE type='table';`))?.num_tables,
    'size_mib: ' + await dbGetTotalSizeMiB(db),
    'manhwas: ' + await dbCount(db, 'manhwas'),    
    'genres: ' + await dbCount(db, 'genres'),
    'manhwa_genres: ' + await dbCount(db, 'manhwa_genres'),
    'authors: ' + await dbCount(db, 'authors'),
    'manhwa_authors: ' + await dbCount(db, 'manhwa_authors'),
    'alt_tiles: ' + await dbCount(db, 'alt_titles'),
    'max_cache_size: ' + await dbGetCacheMaxSize(db) / 1024 / 1024 + ' MB',
    'current_cache_size: ' + formatBytes(await getCacheSizeBytes())
  ].forEach(i => console.log(i))
  console.log("=========================")
  console.log("=========================")
}


export async function dbListTable(db: SQLite.SQLiteDatabase, table: string) {
  const r = await db.getAllAsync(
    `SELECT * FROM ${table};`
  ).catch(error => console.log("error dbListTable", error))
  r ? r.forEach(i => console.log(i)) : null
}


export async function dbGetLastDatabaseSync(db: SQLite.SQLiteDatabase): Promise<number> {
  return await dbReadNumericInfo(db, 'last_refreshed_at', 0)
}


export async function dbCleanTable(db: SQLite.SQLiteDatabase, table: string) {
  await db.runAsync(`DELETE FROM ${table};`).catch(error => console.log(`error dbCleanTable ${table}`, error))
}


/**
 * Clears the main tables in the **local SQLite database** by deleting all rows from key tables.
 *
 * Currently clears:
 * - manhwas
 * - genres 
 * - authors
 * - manhwa_authors (VIA ON DELETE CASCADE)
 * - manhwa_genres (VIA ON DELETE CASCADE)
 *
 * @param db - SQLite database instance
 * @returns A promise that resolves once the database has been cleared.
 *          Logs errors to the console if any deletion fails.
 * @note This does not reset autoincrement counters or foreign key references.
 */
export async function dbClearDatabase(db: SQLite.SQLiteDatabase) {
  await dbCleanTable(db, 'manhwas')
  await dbCleanTable(db, 'authors')
  await dbCleanTable(db, 'genres')
  console.log("[DATABASE CLEAR]")
}


/**
 * Reads a value from the `app_info` table in the **local SQLite database** by its name.
 *
 * @param db - SQLite database instance
 * @param name - The name of the info entry to read.
 * @returns A promise that resolves to the value as a string, or `defaultValue` if not found.
 */
export async function dbReadInfo(
  db: SQLite.SQLiteDatabase, 
  name: string,
  defaultValue: string = ''
): Promise<string> {
  const r = await db.getFirstAsync<{value: string}>(
    `
      SELECT 
        value 
      FROM 
        app_info 
      WHERE 
        name = ?;
    `,
    [name]
  ).catch(error => console.log("error dbReadInfo", name, defaultValue, error))

  if (!r) {
    await dbSetInfo(db, name, defaultValue)
    return defaultValue
  }

  return r.value
}


/**
 * Inserts or replaces the value of an existing entry in the `app_info` table in the **local SQLite database**.
 *
 * @param db - SQLite database instance
 * @param name - The name of the info entry to update.
 * @param value - The new value to set for the entry.
 * @returns A promise that resolves when the update is complete.
 */
export async function dbSetInfo(db: SQLite.SQLiteDatabase, name: string, value: string) {
  await db.runAsync(
    `
      INSERT OR REPLACE INTO 
        app_info (name, value)
      VALUES
        (?,?);
    `,
    [name, value]
  ).catch(error => console.log("error dbSetInfo", error))
}


/**
 * Generates a new UUID for the user and stores it in the `app_info` table under the key `user_id` in the **local SQLite database**.
 * If an entry already exists, it will be replaced.
 *
 * @param db - SQLite database instance
 * @returns A promise that resolves to the newly generated user UUID as a string.
 */
async function dbSetUserUUID(db: SQLite.SQLiteDatabase): Promise<string> {
  const user_id = uuid.v4()
  await dbSetInfo(db, 'user_id', user_id)
  return user_id
}


/**
 * Retrieves the user's UUID from the **local SQLite database**.
 *
 * If the UUID does not exist, it will generate a new one and store it in the database.
 *
 * @param db - SQLite database instance
 * @returns A promise that resolves to the user's UUID as a string.
 */
export async function dbGetUserUUID(db: SQLite.SQLiteDatabase): Promise<string> {  
  let user_id: string | null = await dbReadInfo(db, 'user_id')    
  if (!user_id) { user_id = await dbSetUserUUID(db) }
  return user_id!
}


/**
 * Handles first-run initialization of the app using the **local SQLite database**.
 * 
 * @param db - SQLite database instance
 * @returns A promise that resolves when first-run initialization is complete.
 */
export async function dbFirstRun(db: SQLite.SQLiteDatabase) {
  const r = await dbReadNumericInfo(db, 'first_run')  
  if (r !== 1) {
    const user_id = await dbGetUserUUID(db)
    spUpdateUserLastLogin(user_id)
    return
  }
  
  const supportedAbis = (await DeviceInfo.supportedAbis()).join(', '); 
  const model = DeviceInfo.getModel()
  const systemName = DeviceInfo.getSystemName()
  const systemVersion = DeviceInfo.getSystemVersion()
  const device = `${model}, ${supportedAbis}, ${systemName}[${systemVersion}]`
  await dbSetNumericInfo(db, 'first_run', 0)
  await dbSetInfo(db, 'device', device)
  const user_id = await dbSetUserUUID(db)
  const version: string = await dbReadInfo(db, 'version', AppConstants.APP.VERSION)
  spRegisterNewUser(user_id, device, version)
}


export async function dbGetManhwaAltNames(
  db: SQLite.SQLiteDatabase, 
  manhwa_id: number  
): Promise<string[]> {
  const r = await db.getAllAsync<{title: string}>(
    `
      SELECT 
        title 
      FROM 
        alt_titles 
      WHERE 
        manhwa_id = ?;
    `,
    [manhwa_id]
  ).catch(error => console.log("erro  dbGetManhwaAltNames", error))

  return r ? r.map(i => i.title) : []
}


export async function dbSetLastDatabaseSync(db: SQLite.SQLiteDatabase) {    
  await dbSetNumericInfo(db, 'last_refreshed_at', Date.now())
}


export async function dbShouldSyncDatabase(db: SQLite.SQLiteDatabase): Promise<boolean> {
  const last_refreshed_at = await dbReadNumericInfo(db, 'last_refreshed_at', 0)
  return last_refreshed_at === 0 || Date.now() - last_refreshed_at >= AppConstants.DATABASE.UPDATE_INTERVAL.SERVER
}


export async function dbUpsertManhwa(db: SQLite.SQLiteDatabase, manhwa: ServerManhwa) {
  await db.runAsync(
    `    
      INSERT OR REPLACE INTO manhwas (
          manhwa_id, 
          title,
          descr,
          cover_image_url,
          status,
          color,
          views,
          updated_at
      )
      VALUES 
        (?,?,?,?,?,?,?,?);
    `,
    [
      manhwa.manhwa_id, 
      manhwa.title, 
      manhwa.descr, 
      manhwa.cover_image_url, 
      manhwa.status, 
      manhwa.color, 
      manhwa.views, 
      manhwa.updated_at
    ]
  ).catch(error => console.log("error dbUpsertManhwa", error));  

  // Genres
  await dbUpsertManhwaGenres(db, manhwa.genres.map(g => {return {genre: g.genre, genre_id: g.genre_id, manhwa_id: manhwa.manhwa_id}}))

  // Authors
  await dbUpsertAuthors(db, manhwa.authors)
  await dbUpsertManhwaAuthors(db, manhwa.authors.map(a => {return {author_id: a.author_id, manhwa_id: manhwa.manhwa_id, name: a.name, role: a.role}}))  
    
  await dbUpsertAltTitles(
    db, 
    manhwa.manhwa_id, 
    manhwa.alt_titles ? [manhwa.title, ...manhwa.alt_titles] : [manhwa.title]
  )

  await db.runAsync(
    `
      INSERT INTO 
        manhwa_ratings (manhwa_id, rating, total_rating)
      VALUES (?, ?, ?)
      ON CONFLICT
        (manhwa_id)
      DO UPDATE SET
        rating = EXCLUDED.rating,
        total_rating = EXCLUDED.total_rating
    `,
    [manhwa.manhwa_id, manhwa.rating, manhwa.total_ratings]
  ).catch(error => console.log("error INSERT INTO manhwa_ratings", error))

}


async function dbUpsertAltTitles(db: SQLite.SQLiteDatabase, manhwa_id: number, titles: string[]) {  
  const placeholders = titles.map(() => `(${manhwa_id},?)`).join(',');
  await db.runAsync(
    `
      INSERT OR REPLACE INTO alt_titles (
        manhwa_id,
        title
      )
      VALUES ${placeholders};
    `,
    titles
  ).catch(error =>  console.log("error dbUpsertAltTitles", error))
}


async function dbUpsertManhwas(db: SQLite.SQLiteDatabase, manhwas: Manhwa[]) {
  const placeholders = manhwas.map(() => '(?,?,?,?,?,?,?,?)').join(',');  
  const params = manhwas.flatMap(i => [
    i.manhwa_id, 
    i.title, 
    i.descr,
    i.cover_image_url,
    i.status,
    i.color,
    i.views,    
    i.updated_at,
  ]);  
  await db.runAsync(`    
    INSERT INTO manhwas (
        manhwa_id, 
        title,
        descr,
        cover_image_url,
        status,
        color,
        views,
        updated_at
    )
    VALUES ${placeholders};
    ON CONFLICT 
      (manhwa_id)
    DO UPDATE SET
      title = EXCLUDED.title,
      descr = EXCLUDED.descr,
      cover_image_url = EXCLUDED.cover_image_url,
      color = EXCLUDED.color,
      views = EXCLUDED.views,
      updated_at = EXCLUDED.updated_at;`, 
    params
  ).catch(error => console.log("error dbUpsertManhwas", error));
}


/**
 * Inserts data into a specified table in batches in the **local SQLite database**, handling large numbers of parameters to avoid SQLite limits.
 * Supports optional `ON CONFLICT` behavior.
 * 
 * @param db - SQLite database instance
 * @param params - A flat array of values to insert
 * @param table - The name of the table to insert data into
 * @param columns - A comma-separated string of column names corresponding to the values
 * @param rowPlaceholder - A string representing the placeholders for a single row, e.g., `(?,?,?)`
 * @param numColumns - The number of columns per row (used to split params into correct batches)
 * @param onConflict - Optional SQL clause for handling conflicts, e.g., `ON CONFLICT(...) DO UPDATE SET ...`
 * @returns A promise that resolves when all batches have been processed
 */
async function dbUpsertBatch(
  db: SQLite.SQLiteDatabase,
  params: any[],
  table: string,
  columns: string,
  rowPlaceholder: string,
  numColumns: number,
  onConflict?: string
) {

  if (numColumns === 0 || params.length % numColumns != 0) {
    console.log("invalid numColumns", params.length, numColumns)
    return
  }

  const MAX_PARAMS = 900
  const CHUNK_SIZE = Math.floor(MAX_PARAMS / numColumns)
  const STEP = CHUNK_SIZE * numColumns

  for (let i = 0; i < params.length; i += STEP) {
    const chunk = params.slice(i, i + STEP)
    const placeholders = Array(chunk.length / numColumns).fill(rowPlaceholder).join(',')
    try {
      await db.runAsync(
        `
          INSERT INTO ${table} (
            ${columns}
          )
          VALUES
            ${placeholders}
          ${onConflict ?? ''};
        `,
        chunk
      )
    } catch (error) {
      console.log(`error dbUpsertBatch ${table}`, error)
    }
  }
}


async function dbUpsertGenres(db: SQLite.SQLiteDatabase, genres: Genre[]) {
  const placeholders = genres.map(() => '(?,?)').join(',');
  const params = genres.flatMap(i => [ i.genre_id, i.genre ]);
  await db.runAsync(
    `
      INSERT INTO genres (
        genre_id, 
        genre        
      ) 
      VALUES 
        ${placeholders}
      ON CONFLICT 
        (genre_id)
      DO UPDATE SET 
        genre = EXCLUDED.genre;
    `, 
    params
  ).catch(error => console.log("error dbUpsertGenres", error));
}


async function dbUpsertManhwaGenres(db: SQLite.SQLiteDatabase, manhwaGenres: ManhwaGenre[]) {
  const placeholders = manhwaGenres.map(() => '(?,?)').join(',');  
  const params = manhwaGenres.flatMap(i => [
      i.genre_id,
      i.manhwa_id
  ]);
  await db.runAsync(
  `
      INSERT INTO manhwa_genres (
          genre_id,
          manhwa_id
      ) 
      VALUES ${placeholders}
      ON CONFLICT 
        (genre_id, manhwa_id)
      DO NOTHING;
  `, params
  ).catch(error => console.log("error dbUpsertManhwaGenres", error));
}


async function dbUpsertAuthors(db: SQLite.SQLiteDatabase, authors: Author[]) {  
  const placeholders = authors.map(() => '(?,?,?)').join(',');  
  const params = authors.flatMap(i => [
      i.author_id,
      i.name,
      i.role
  ]);
  await db.runAsync(
    `
    INSERT OR REPLACE INTO authors (
        author_id, 
        name,
        role
    ) 
    VALUES ${placeholders};      
    `, 
    params
  ).catch(error => console.log("error dbUpsertAuthors", error));
}


async function dbUpsertManhwaAuthors(db: SQLite.SQLiteDatabase, manhwaAuthor: ManhwaAuthor[]) {
  const placeholders = manhwaAuthor.map(() => '(?,?,?)').join(',');
  const params = manhwaAuthor.flatMap(i => [
    i.author_id,
    i.manhwa_id,
    i.role
  ]);
  await db.runAsync(
    `
      INSERT INTO manhwa_authors (
          author_id, 
          manhwa_id,
          role
      ) 
      VALUES ${placeholders}
      ON CONFLICT 
        (author_id, manhwa_id, role)
      DO NOTHING;
    `, 
    params
  ).catch(error => console.log("error dbUpsertManhwaAuthors", error));
}


export async function dbSyncDatabase(db: SQLite.SQLiteDatabase): Promise<number> {
  console.log('[UPDATING DATABASE]')
  const last_sync: number = await dbGetLastDatabaseSync(db)
  const last_sync_timestampz = last_sync === 0 ? null : new Date(last_sync).toISOString()
  
  const response_time_start = Date.now()
  const manhwas: ServerManhwa[] | null = await spGetManhwas(last_sync_timestampz)
  const response_time_end = Date.now()

  if (manhwas === null) { 
    console.log("[DATABASE UPDATE ERROR]")
    return 0 
  }
  
  await dbSetLastDatabaseSync(db)

  if (manhwas.length == 0) {
    console.log(
      "[DATABASE UPDATED]",
      "[SUPABASE] ->", (response_time_end - response_time_start) / 1000,
      "[MANHWAS] ->", manhwas.length
    )
    return manhwas.length
  }

  await dbClearDatabase(db)
  await dbUpsertManhwas(db, manhwas)

  const authors: AuthorSet = new AuthorSet()
  const genres: GenreSet = new GenreSet()
  const manhwaAuthors: any[] = []
  const manhwaGenres: any[] = []
  const ratings: (number | string)[] = []
  const altTitles: (number | string)[] = []

  manhwas.forEach(manhwa => {
    // Genres
    manhwa.genres.forEach(g => {
      genres.add(g)
      manhwaGenres.push(g.genre_id)
      manhwaGenres.push(manhwa.manhwa_id)
    });

    // Authors
    manhwa.authors.forEach(a => {
      authors.add({author_id: a.author_id, name: a.name, role: a.role});
      manhwaAuthors.push(a.author_id)
      manhwaAuthors.push(manhwa.manhwa_id)
      manhwaAuthors.push(a.role)
    });

    // Titles
    altTitles.push(manhwa.manhwa_id)
    altTitles.push(manhwa.title)
    manhwa.alt_titles.forEach(title => {
      altTitles.push(manhwa.manhwa_id)
      altTitles.push(title)
    })

    // Ratings
    ratings.push(manhwa.manhwa_id)
    ratings.push(manhwa.rating)
    ratings.push(manhwa.total_ratings)
  }),
  
  await Promise.all([
    dbUpsertGenres(db, genres.values()),
    dbUpsertBatch(
      db,
      altTitles,
      'alt_titles',
      'manhwa_id, title',
      '(?,?)',
      2,
      'ON CONFLICT (manhwa_id, title) DO NOTHING'
    ), 
    dbUpsertBatch(
      db,
      authors.values().flatMap(a => [a.author_id, a.name, a.role]),
      'authors',
      'author_id, name, role',
      '(?,?,?)',
      3,
      'ON CONFLICT (author_id) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role'
    ),
    dbUpsertBatch(
      db,
      ratings,
      'manhwa_ratings',
      'manhwa_id, rating, total_rating',
      '(?,?,?)',
      3,
      'ON CONFLICT (manhwa_id) DO UPDATE SET rating = EXCLUDED.rating, total_rating = EXCLUDED.total_rating'
    )
  ])

  await Promise.all([
    dbUpsertBatch(
      db,
      manhwaAuthors,
      'manhwa_authors',
      'author_id, manhwa_id, role',
      '(?,?,?)',
      3,
      'ON CONFLICT (author_id, manhwa_id, role) DO NOTHING'
    ),
    dbUpsertBatch(
      db,
      manhwaGenres,
      'manhwa_genres',
      'genre_id, manhwa_id',
      '(?,?)',
      2,
      'ON CONFLICT (genre_id, manhwa_id) DO NOTHING'
    )
  ])

  console.log(
    "[DATABASE UPDATED]", 
    "[SUPABASE] ->", (response_time_end - response_time_start) / 1000,
    "| [SQLITE] ->", (Date.now() - response_time_end) / 1000,
    "| [MANHWAS] ->", manhwas.length
  )

  return manhwas.length
}


export async function dbHasNoManhwas(db: SQLite.SQLiteDatabase): Promise<boolean> {
  const row = await db.getFirstAsync<{manhwa_id: number}>(
    `
      SELECT
        manhwa_id
      FROM
        manhwas
      LIMIT 1;
    `    
  ).catch(error => console.log('dbHasNoManhwas', error)); 
  return row == null
}


export async function dbHasManhwa(db: SQLite.SQLiteDatabase, manhwa_id: number): Promise<boolean> {
  const row = await db.getFirstAsync<{manga_id: number}>(
    `
      SELECT
        manhwa_id
      FROM
        manhwas
      WHERE
        manhwa_id = ?;
    `,
    [manhwa_id]  
  ).catch(error => {console.log('dbHasManhwa', error); return null});
  return row !== null
}


export async function dbGetRandomManhwaId(db: SQLite.SQLiteDatabase): Promise<number | null> {
  const row = await db.getFirstAsync<{manhwa_id: number}>(
    'SELECT manhwa_id FROM manhwas ORDER BY RANDOM() LIMIT 1;'
  ).catch(error => console.log("error dbGetRandomManhwaId", error));
  
  return row ? row.manhwa_id : null
}


export async function dbReadAppVersion(db: SQLite.SQLiteDatabase): Promise<string> {
  const r = await dbReadInfo(db, 'version')
  return r!
}


export async function dbReadGenres(db: SQLite.SQLiteDatabase): Promise<Genre[]> {
  const rows = await db.getAllAsync(
    `
      SELECT 
        *
      FROM 
        genres
      ORDER BY 
        genre;
    ` 
  ).catch(error => console.log("error dbReadGenres", error));
  return rows ? rows as Genre[] : []
}


export async function dbReadManhwaById(
  db: SQLite.SQLiteDatabase,
  manhwa_id: number
): Promise<Manhwa | null> {
  const row = await db.getFirstAsync(
    'SELECT * FROM manhwas WHERE manhwa_id = ?;',
    [manhwa_id]
  ).catch(error => console.log("error dbReadManhwaById", manhwa_id, error));

  return row ? row as Manhwa : null

}


export async function dbReadManhwasOrderedByUpdateAt(
  db: SQLite.SQLiteDatabase,
  p_offset: number = 0, 
  p_limit: number = 30
): Promise<Manhwa[]> {
  const rows = await db.getAllAsync(
    `
      SELECT 
        manhwa_id,
        title,
        status,
        cover_image_url        
      FROM 
        manhwas
      ORDER BY 
        updated_at DESC
      LIMIT ?
      OFFSET ?;
    `,
    [p_limit, p_offset]
  ).catch(error => console.log("error dbReadManhwasOrderedByUpdateAt", error));
  return rows ? rows as Manhwa[]  : []
}


export async function dbReadManhwasOrderedByViews(
  db: SQLite.SQLiteDatabase,
  p_offset: number = 0, 
  p_limit: number = 30
): Promise<Manhwa[]> {  
  const rows = await db.getAllAsync(
    `
      SELECT
        manhwa_id,
        title,
        status,
        cover_image_url        
      FROM
        manhwas
      ORDER BY 
        views DESC
      LIMIT ?
      OFFSET ?;
    `,
    [p_limit, p_offset]
  ).catch(error => console.log("error dbReadManhwasOrderedByViews", error));
  return rows ? rows as Manhwa[]  : []
}


/**
 * Searches for manhwas whose titles or alternative titles match the provided search text (case-insensitive) in the **local SQLite database**.
 * Results are grouped by manhwa and ordered by view count descending, then by manhwa ID.
 * 
 * @param db - SQLite database instance
 * @param p_search_text - The text to search for in manhwa titles and alternative titles.
 * @param p_offset - The offset for pagination. Defaults to 0.
 * @param p_limit - The maximum number of manhwas to return. Defaults to 30.
 * @returns A promise that resolves to an array of `Manhwa` objects matching the search criteria. Returns an empty array if no matches are found.
 */
export async function dbSearchManhwas(
  db: SQLite.SQLiteDatabase, 
  p_search_text: string,
  p_offset: number = 0,
  p_limit: number = 30
): Promise<Manhwa[]> {
  const rows = await db.getAllAsync(
    `
      SELECT 
        m.title,
        m.manhwa_id,
        m.cover_image_url,
        m.status
      FROM 
        alt_titles at
      JOIN
        manhwas m ON m.manhwa_id = at.manhwa_id
      WHERE 
        at.title LIKE ? COLLATE NOCASE
      GROUP BY
        m.manhwa_id
      ORDER BY 
        m.views DESC, 
        m.manhwa_id
      LIMIT ?
      OFFSET ?;
    `,
    [`%${p_search_text}%`, p_limit, p_offset]
  ).catch(error => console.log("error dbSearchMangas", p_search_text, error))
  return rows ? rows as Manhwa[] : []
}


/**
 * Increments the view count of a specific manhwa by 1 in the **local SQLite database**.
 * 
 * @param db - SQLite database instance
 * @param manhwa_id - The ID of the manhwa whose views should be incremented.
 * @returns A promise that resolves when the update is complete.
 */
export async function dbUpdateManhwaViews(
  db: SQLite.SQLiteDatabase,
  manhwa_id: number
) {
  await db.runAsync(
    `
      UPDATE 
        manhwas
      SET
        views = views + 1
      WHERE
        manhwa_id = ?
    `,
    [manhwa_id]
  ).catch(error => console.log("error dbUpdateManhwaViews", manhwa_id, error))
}


export async function dbReadManhwaGenres(
  db: SQLite.SQLiteDatabase,
  manhwa_id: number
): Promise<Genre[]> {
  const rows = await db.getAllAsync(
    `
      SELECT 
        g.*
      FROM 
        genres g
      JOIN 
        manhwa_genres mg ON mg.genre_id = g.genre_id
      WHERE 
        mg.manhwa_id = ?
      ORDER BY 
        g.genre;
    `,
    [manhwa_id]
  ).catch(error => console.log("error dbReadManhwaGenres", manhwa_id, error));

  return rows ? rows as Genre[] : []
}


export async function dbReadManhwaAuthors(
  db: SQLite.SQLiteDatabase,
  manhwa_id: number
): Promise<ManhwaAuthor[]> {
  const rows = await db.getAllAsync(
    `
      SELECT 
        a.*
      FROM 
        authors a
      JOIN 
        manhwa_authors ma ON a.author_id = ma.author_id
      WHERE 
        ma.manhwa_id = ?;
    `,
    [manhwa_id]
  ).catch(error => console.log("error dbReadMangaAuthors", manhwa_id, error));

  return rows ? rows as ManhwaAuthor[] : []
}


/**
 * Retrieves the set of chapter IDs that the user has read for a specific manhwa from the **local SQLite database**.
 * 
 * @param db - SQLite database instance
 * @param manhwa_id - The ID of the manhwa to fetch read chapters for.
 * @returns A promise that resolves to a `Set` of chapter IDs. Returns an empty set if no chapters have been read.
 */
export async function dbGetManhwaReadChapters(
  db: SQLite.SQLiteDatabase, 
  manhwa_id: number
): Promise<Set<number>> {
  const rows = await db.getAllAsync(
    `
      SELECT
        chapter_id
      FROM 
        reading_history
      WHERE 
        manhwa_id = ?;
    `,
    [manhwa_id]
  ).catch(error => console.log("error dbGetManhwaReadChapters", error));

  
  if (!rows) {
    return new Set<number>()
  }
  
  return new Set<number>(rows.map((item: any) => item.chapter_id))
}


/**
 * Retrieves the reading status of a specific manhwa for the local user from the **local SQLite database**.
 * 
 * @param db - SQLite database instance
 * @param manhwa_id - The ID of the manhwa to fetch the reading status for.
 * @returns A promise that resolves to the reading status string, or `null` if no status is recorded.
 */
export async function dbReadManhwaReadingStatus(
  db: SQLite.SQLiteDatabase,
  manhwa_id: number
): Promise<string | null> {
  const row = await db.getFirstAsync<{status: string}>(
    "SELECT status FROM reading_status WHERE manhwa_id = ?", 
    [manhwa_id]
  ).catch(error => console.log("error dbGetManhwaReadingStatus", manhwa_id, error));

  return row ? row.status : null
}


/**
 * Updates or inserts the reading status of a specific manhwa for the local user in the **local SQLite database**.
 * If a status already exists for the given manhwa, it will be updated along with the timestamp.
 * 
 * @param db - SQLite database instance
 * @param manhwa_id - The ID of the manhwa to update the reading status for.
 * @param status - The new reading status to set (e.g., "reading", "completed").
 * @returns A promise that resolves when the operation is complete.
 */
export async function dbUpdateManhwaReadingStatus(
  db: SQLite.SQLiteDatabase,
  manhwa_id: number, 
  status: string
) {  
  await db.runAsync(
    `
      INSERT INTO reading_status (
        manhwa_id,
        status
      )
      VALUES (?, ?)
      ON CONFLICT
        (manhwa_id)
      DO UPDATE SET
        status = EXCLUDED.status,
        updated_at = CURRENT_TIMESTAMP;
    `,
    [manhwa_id, status]
  ).catch(error => console.log("error dbUpdateManhwaReadingStatus", manhwa_id, status, error))
}


export async function dbReadManhwasByAuthorId(
  db: SQLite.SQLiteDatabase,
  author_id: number
): Promise<Manhwa[]> {
  const rows = await db.getAllAsync(
    `
      SELECT 
        m.manhwa_id,
        m.title,
        m.status,
        m.cover_image_url
      FROM 
        manhwas m
      JOIN 
        manhwa_authors ma ON m.manhwa_id = ma.manhwa_id
      WHERE 
        ma.author_id = ?
      ORDER BY 
        m.views DESC;
    `,
    [author_id]
  ).catch(error => console.log("error dbReadManhwasByAuthorId", author_id, error));

  return rows ? rows as Manhwa[]  : []
}


export async function dbReadManhwasByGenreId(
  db: SQLite.SQLiteDatabase,
  genre_id: number,
  p_offset: number = 0,
  p_limit: number = 30
): Promise<Manhwa[]> {  
  const rows = await db.getAllAsync(
    `
      SELECT 
        m.manhwa_id,
        m.title,
        m.status,
        m.cover_image_url
      FROM 
        manhwas m
      JOIN 
        manhwa_genres mg ON m.manhwa_id = mg.manhwa_id
      JOIN 
        genres g ON mg.genre_id = g.genre_id
      WHERE 
        g.genre_id = ?
      ORDER BY 
        m.views DESC, m.manhwa_id ASC
      LIMIT ?
      OFFSET ?;
    `,
    [genre_id, p_limit, p_offset]
  ).catch(error => console.log("error dbReadManhwasByGenreId", genre_id, error));

  return rows ? rows as Manhwa[]  : []
}


/**
 * Inserts or updates the reading history for a specific manhwa chapter in the **local SQLite database**.
 * If the chapter has already been marked as read, its timestamp will be updated to the current time.
 * 
 * @param db - SQLite database instance
 * @param manhwa_id - The ID of the manhwa.
 * @param chapter_id - The ID of the chapter being marked as read.
 * @returns A promise that resolves when the operation is complete.
 */
export async function dbUpsertManhwaReadingHistory(
  db: SQLite.SQLiteDatabase,
  manhwa_id: number, 
  chapter_id: number
) {
  await db.runAsync(
    `
      INSERT INTO reading_history (
        manhwa_id,
        chapter_id,
        readed_at
      )
      VALUES 
        (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT 
        (manhwa_id, chapter_id)
      DO UPDATE SET 
        readed_at = CURRENT_TIMESTAMP;
    `,
    [manhwa_id, chapter_id]
  ).catch(error => console.log("error dbUpsertReadingHistory", manhwa_id, chapter_id, error))
}

/**
 * Retrieves a paginated list of manhwas that the user has read from the **local SQLite database**, ordered by the most recently read chapters.
 * Each manhwa appears only once in the list.
 * 
 * @param db - SQLite database instance
 * @param p_offset - The offset for pagination. Defaults to 0.
 * @param p_limit - The maximum number of manhwas to return. Defaults to 30.
 * @returns A promise that resolves to an array of `Manhwa` objects. Returns an empty array if no reading history exists.
 */
export async function dbGetManhwaReadingHistory(
  db: SQLite.SQLiteDatabase,
  p_offset: number = 0,
  p_limit: number = 30
): Promise<Manhwa[]> {
  const rows = await db.getAllAsync(
    `
      SELECT
          m.manhwa_id,
          m.title,
          m.cover_image_url
      FROM 
          reading_history AS rh
      JOIN 
          manhwas AS m
      ON 
          m.manhwa_id = rh.manhwa_id
      GROUP BY
          m.manhwa_id
      ORDER BY
          readed_at DESC
      LIMIT ?
      OFFSET ?;
    `,
    [p_limit, p_offset]
  ).catch(error => console.log("error dbUserReadHistory", error));
  return rows as Manhwa[]
}


export async function dbReadManhwasByReadingStatus(
  db: SQLite.SQLiteDatabase,
  status: string  
): Promise<Manhwa[]> {
  const rows = await db.getAllAsync(
    `
      SELECT
        m.title,
        m.manhwa_id,
        m.cover_image_url
      FROM
        manhwas m
      JOIN
        reading_status r
        on r.manhwa_id = m.manhwa_id
      WHERE
        r.status = ?
      ORDER BY 
        r.updated_at DESC;
    `,
    [status]
  ).catch(error => console.log("error dbGetMangasByReadingStatus", status, error));
  return rows ? rows as Manhwa[] : []
}


/**
 * Retrieves the total number of chapters that the user has read across all manhwas from the **local SQLite database**.
 * 
 * @param db - SQLite database instance
 * @returns A promise that resolves to the total count of read chapters. Returns 0 if no chapters have been read.
 */
export async function dbReadChaptersCount(db: SQLite.SQLiteDatabase): Promise<number> {
  const r = await db.getFirstAsync<{total: number}>(
    `
      SELECT 
        count(*) as total 
      FROM 
        reading_history;
    `    
  ).catch(error => console.log("error dbReadChaptersCount", error))
  return r ? r.total : 0
}


/**
 * Retrieves the total number of distinct manhwas that the user has read at least one chapter of from the **local SQLite database**.
 * 
 * @param db - SQLite database instance
 * @returns A promise that resolves to the count of unique manhwas read. Returns 0 if no manhwas have been read.
 */
export async function dbReadManhwasCount(db: SQLite.SQLiteDatabase): Promise<number> {
  const r = await db.getFirstAsync<{total: number}>(
    'SELECT COUNT(DISTINCT manhwa_id) AS total FROM reading_history;'
  ).catch(error => console.log("error dbNumUniqueManhwasReaded", error))
  return r ? r.total : 0
}


/**
 * Retrieves the total number of images that have been fetched by the app from the **local SQLite database**.
 * 
 * @param db - SQLite database instance
 * @returns A promise that resolves to the count of fetched images.
 */
export async function dbReadNumImagesFetchedCount(db: SQLite.SQLiteDatabase): Promise<number> {
  const r = await db.getFirstAsync<{value: number}>(
    `SELECT value FROM app_numeric_info WHERE name = 'images'`
  ).catch(error => console.log("error dbGetNumImagesFetched", error))
  return r ? r.value : 0
}


/**
 * Retrieves the device name from the **local SQLite database**.
 * 
 * If the device name is not already stored in the database, it will:
 * - Fetch the device name using `getDeviceName()`.
 * - Store the retrieved device name in the database under the key `device`.
 * 
 * @param db - SQLite database instance
 * @returns A promise that resolves to the device name as a string.
 */
export async function dbReadDeviceName(db: SQLite.SQLiteDatabase): Promise<string> {
  let device = await dbReadInfo(db, 'device')
  if (!device) {
    device = await getDeviceName()
    await dbSetInfo(db, 'device', device)
  }
  return device
}


/**
 * Retrieves a numeric value from the **local SQLite database** `app_numeric_info` table by its name.
 * 
 * @param db - SQLite database instance
 * @param name - The key/name of the numeric info to retrieve
 * @returns A promise that resolves to the numeric value if found, or `null` if not found
 */
export async function dbReadNumericInfo(
  db: SQLite.SQLiteDatabase, 
  name: string,
  defaultValue: number = 0
): Promise<number> {
  const r = await db.getFirstAsync<{value: number}>(
    `
      SELECT 
        value 
      FROM 
        app_numeric_info 
      WHERE 
        name = ?;
      `,
    [name]
  ).catch(error => console.log("error dbGetNumericInfo", error))
  if (!r) {
    await dbSetNumericInfo(db, name, defaultValue)
    return defaultValue
  }
  return r.value
}


/**
 * Increments a numeric value in the **local SQLite database** `app_numeric_info` table by a specified amount.
 * 
 * @param db - SQLite database instance
 * @param name - The key/name of the numeric info to update
 * @param delta - The amount to add to the current value. Defaults to 1
 * @returns A promise that resolves when the update operation is complete
 */
export async function dbAddNumericInfo(db: SQLite.SQLiteDatabase, name: string, delta: number = 1) {
  await db.runAsync(
    `
      UPDATE 
        app_numeric_info
      SET
        value = value + ?
      WHERE
        name = ?;
    `,
    [delta, name]
  ).catch(error => console.log("error dbAddNumericInfo", error))
}


/**
 * Creates or updates a numeric entry in the **local SQLite database** `app_numeric_info` table.
 * If an entry with the given name already exists, its value is replaced.
 * 
 * @param db - SQLite database instance
 * @param name - The key/name of the numeric info to create or update
 * @param value - The numeric value to set
 * @returns A promise that resolves when the insert or update operation is complete
 */
export async function dbCreateNumericInfo(db: SQLite.SQLiteDatabase, name: string, value: number) {
  await db.runAsync(
    `
    INSERT OR REPLACE INTO app_numeric_info (
      name, value
    )
    VALUES (?, ?);
    `,
    [name, value]
  ).catch(error => console.log("error dbCreateNumericInfo", error))
}


/**
 * Updates or creates a numeric value in the **local SQLite database** `app_numeric_info` table for a given name.
 * 
 * @param db - SQLite database instance
 * @param name - The key/name of the numeric info to update
 * @param value - The numeric value to set or update
 * @returns A promise that resolves when the update operation is complete
 */
export async function dbSetNumericInfo(db: SQLite.SQLiteDatabase, name: string, value: number) {
  await db.runAsync(
    `
      INSERT OR REPLACE INTO 
        app_numeric_info (name, value)
      VALUES 
        (?, ?);
    `,
    [name, value]
  ).catch(error => console.log("error dbSetNumericInfo", error))
}


/**
 * @param db - SQLite database instance
 * @returns A promise that resolves to a `UserData` object containing:
 *   - `chapters`: Total number of chapters read
 *   - `images`: Total number of images fetched
 *   - `supportedAbis`: arm64-v8a, x86_64 etc
 */
export async function dbGetUserData(db: SQLite.SQLiteDatabase): Promise<UserData> {
  const [chapters, images, supportedAbis] = await Promise.all([
    dbReadChaptersCount(db),
    dbReadNumImagesFetchedCount(db),
    dbGetSupportedAbis()
  ])
  return { chapters, images, supportedAbis }
}


/**
 * Updates the local setting in the **SQLite database** that controls whether the app should prompt the user for a donation.
 * Modifies the `should_ask_for_donation` key in the `app_info` table.
 * 
 * @param db - SQLite database instance
 * @param value - A string representing the new state. Typically `'1'` to enable asking for donations, or `'0'` to disable
 */
export async function dbSetShouldAskForDonation(db: SQLite.SQLiteDatabase, value: number) {
  await dbSetNumericInfo(db, 'should_ask_for_donation', value)
}


/**
 * Determines whether the app should currently prompt the user for a donation based on the **local SQLite database** setting.
 * The check is performed on the `should_ask_for_donation` key in the `app_info` table.
 * 
 * @param db - SQLite database instance
 * @returns A promise resolving to `true` if the app should ask for a donation, otherwise `false`
 */
export async function dbShouldAskForDonation(db: SQLite.SQLiteDatabase): Promise<boolean> {
  const r = await dbReadNumericInfo(db, 'should_ask_for_donation', 1)
  return r === 1
}


/**
 * Checks whether the user has reached the next chapter milestone for prompting a donation message in the **local SQLite database**.
 * 
 * Logic:
 * 1. Verifies if the app should ask for a donation (`dbShouldAskForDonation`).
 * 2. Reads the total number of chapters the user has read from the local database.
 * 3. Retrieves the current milestone from the database, initializing it if missing.
 * 4. If the read chapters count meets or exceeds the milestone:
 *    - Updates the milestone by adding a defined increment.
 *    - Returns `true` to indicate the milestone has been reached.
 * 5. Otherwise, returns `false`.
 *
 * @param db - SQLite database instance
 * @returns A promise resolving to `true` if a chapter milestone is reached, `false` otherwise
 */
export async function dbIsChapterMilestoneReached(db: SQLite.SQLiteDatabase): Promise<boolean> {
  const shouldAsk = await dbShouldAskForDonation(db)
  if (!shouldAsk) { return false }

  const readChaptersCount = await dbReadChaptersCount(db)
  
  let currentMilestone = await dbReadNumericInfo(db, 'current_chapter_milestone')
  if (!currentMilestone) {
    await dbCreateNumericInfo(db, 'current_chapter_milestone', AppConstants.CHAPTER.GOAL_START)
    currentMilestone = AppConstants.CHAPTER.GOAL_START
  }  
  
  if (readChaptersCount >= currentMilestone) {
    await dbSetNumericInfo(
      db, 
      'current_chapter_milestone', 
      readChaptersCount + AppConstants.CHAPTER.GOAL_INCREMENT
    )
    return true
  }  
  return false
}


/**
 * Checks whether the app's "Safe Mode" is currently enabled in the **local SQLite database**.
 *
 * Safe Mode may be used to filter or restrict certain content in the app.
 *
 * @param db - SQLite database instance
 * @returns `true` if Safe Mode is enabled, `false` otherwise
 */
export async function dbIsSafeModeEnabled(db: SQLite.SQLiteDatabase): Promise<boolean> {
  const r = await dbReadNumericInfo(db, 'is_safe_mode_on')
  return r === 1
}



/**
 * Sets the state of the app's "Safe Mode" in the **local SQLite database**.
 *
 * Safe Mode may be used to filter or restrict certain content in the app.
 *
 * @param db - SQLite database instance
 * @param state - `true` to enable Safe Mode, `false` to disable it
 */
export async function dbSetSafeModeState(db: SQLite.SQLiteDatabase, state: boolean) {
  await dbSetNumericInfo(db, 'is_safe_mode_on', state ? 1 : 0)
}


/**
 * Reads TODO items from the **local SQLite database**.
 *
 * Retrieves all TODOs, optionally filtered by their completion status.
 *
 * @param db - SQLite database instance
 * @param completed - If `true`, returns only completed TODOs; 
 *                    if `false`, returns only incomplete TODOs;
 *                    if `null` (default), returns all TODOs
 * @returns An array of TODO items, ordered by completion and creation date
 */
export async function dbReadTodos(
  db: SQLite.SQLiteDatabase,
  completed: boolean | null = null
): Promise<Todo[]> {
  if (completed === null) {
    const r = await db.getAllAsync<Todo>(
      `
        SELECT
          *
        FROM 
          todos
        ORDER BY
          completed ASC, created_at DESC;
      `
    ).catch(error => console.log("error dbReadTodos", error))
    return r ? r : []
  }
  const r = await db.getAllAsync<Todo>(
      `
        SELECT
          *
        FROM 
          todos
        WHERE
          completed = ?
        ORDER BY
          created_at DESC;        
      `,
      [completed ? 1 : 0]
  ).catch(error => console.log("error dbReadTodos", error))
  return r ? r : []
}


/**
 * Retrieves a single TODO item by its ID from the **local SQLite database**.
 *
 * @param db - SQLite database instance
 * @param todo_id - The unique ID of the TODO item to retrieve
 * @returns The TODO item if found, otherwise `null`
 */
export async function dbReadTodoById(db: SQLite.SQLiteDatabase, todo_id: number): Promise<Todo | null> {
  const r = await db.getFirstAsync<Todo>(
    'SELECT * FROM todos WHERE todo_id = ?;',
    [todo_id]
  ).catch(error => console.log("error dbReadTodoById", error))
  return r ? r : null
}


/**
 * Creates a new TODO item in the **local SQLite database**.
 *
 * @param db - SQLite database instance
 * @param title - The title of the TODO item
 * @param descr - An optional description of the TODO item
 * @returns The newly created TODO item if successful, otherwise `null`
 */
export async function dbCreateTodo(db: SQLite.SQLiteDatabase, title: string, descr: string | null = null): Promise<Todo | null> {
  const r = await db.getFirstAsync<{todo_id: number}>(
    `
      INSERT INTO todos (
        title,
        descr,
        created_at
      )
      VALUES 
        (?, ?, ?)
      RETURNING
        todo_id;
    `,
    [title, descr, new Date().toString()]
  ).catch(error => console.log("error dbCreateTodo", error))
  
  if (r?.todo_id) {
    return await dbReadTodoById(db, r.todo_id)
  }

  return null
}


/**
 * Deletes all TODO items marked as completed from the **local SQLite database**.
 *
 * @param db - SQLite database instance
 */
export async function dbDeleteCompletedTodos(db: SQLite.SQLiteDatabase) {
  await db.runAsync(
    'DELETE FROM todos WHERE completed = 1;'
  ).catch(error => console.log("error dbDeleteCompletedTodos", error))
}


/**
 * Updates a TODO item in the **local SQLite database**.
 *
 * @param db - SQLite database instance
 * @param todo_id - The ID of the TODO item to update.
 * @param title - The new title of the TODO.
 * @param descr - The new description of the TODO (optional).
 * @param completed - The completion status (1 for completed, 0 for not completed).
 * @returns A boolean indicating whether the update was successful.
 *
 * Notes:
 * - If `completed` is 1, `finished_at` will be set to the current timestamp; otherwise, it will be null.
 */
export async function dbUpdateTodo(
  db: SQLite.SQLiteDatabase, 
  todo_id: number, 
  title: string, 
  descr: string | null,
  completed: number,
): Promise<boolean> {
  const r = await db.runAsync(
    `
      UPDATE 
        todos 
      SET
        title = ?,
        descr = ?,
        completed = ?,
        finished_at = ?
      WHERE
        todo_id = ?;
    `,
    [title, descr, completed, completed === 1 ? new Date().toString() : null, todo_id]
  ).catch(error => {console.log("error dbUpdateTodo", error); return false})
  return r !== false
}



/**
 * Deletes a TODO item from the **local SQLite database** by its ID.
 *
 * @param db - SQLite database instance
 * @param todo_id - The ID of the TODO item to delete.
 * @returns A boolean indicating whether the deletion was successful.
 */
export async function dbDeleteTodo(db: SQLite.SQLiteDatabase, todo_id: number): Promise<boolean> {
  const r = await db.runAsync(
    'DELETE FROM todos WHERE todo_id = ?;',
    [todo_id]
  ).catch(error => {console.log("error dbDeleteTodo", error); return false})
  return r !== false
}


/**
 * Retrieves the Safe Mode password from the **local SQLite database**.
 * If no password exists, initializes it with an empty string and returns ''.
 *
 * @param db - SQLite database instance
 * @returns The Safe Mode password as a string.
 */
export async function dbReadSafeModePassword(db: SQLite.SQLiteDatabase): Promise<string> {
  const password = await dbReadInfo(db, 'password')
  if (!password) {
    await dbSetInfo(db, 'password', '')
    return ''
  }
  return password
}



/**
 * Inserts or replaces the Safe Mode password in the **local SQLite database**.
 *
 * @param db - SQLite database instance
 * @param password - The password string to store.
 */
export async function dbCreateSafeModePassword(db: SQLite.SQLiteDatabase, password: string) {
  await dbSetInfo(db, 'password', password)
}


/**
 * Checks if the provided password matches the stored Safe Mode password in the **local SQLite database**.
 * 
 * @param db - SQLite database instance
 * @param password - Password string to check
 * @returns A boolean indicating whether the password is correct
 */
export async function dbCheckPassword(db: SQLite.SQLiteDatabase, password: string): Promise<boolean> {
  const p = await dbReadSafeModePassword(db)
  return p === password
}


/**
 * Fills the `reading_status` table in the **local SQLite database** for all manhwas with a specified status.
 * 
 * Inserts or replaces entries for every manhwa in the database. The `updated_at` field is set to the current timestamp.
 *
 * @param db - SQLite database instance
 * @param status - The status value to assign to all manhwas (e.g., "unread", "reading", "completed").
 * @returns A promise that resolves when the operation is complete. Errors are logged to the console but do not throw.
 *
 * @example
 * ```ts
 * // Mark all manhwas as "Reading" for debug
 * await dbFillReadingStatus(db, "Reading");
 * ```
 */
export async function dbFillReadingStatus(db: SQLite.SQLiteDatabase, status: string) {
  await db.runAsync(
    `
      INSERT OR REPLACE INTO reading_status (
        manhwa_id, 
        status, 
        updated_at
      )
      SELECT 
        manhwa_id, 
        '${status}', 
        CURRENT_TIMESTAMP
      FROM 
        manhwas;
    `
  ).catch(error => console.log("error dbFillReadingStatus", error))
}


/**
 * Fetches debug information and statistics from the **local SQLite database**.
 * 
 * Collects aggregate counts from various tables (e.g., manhwas, authors, genres) and stored debug metadata.
 * Returns a combined object containing all debug-related values for inspection or logging.
 *
 * @param db - SQLite database instance
 * @returns A promise that resolves to an object containing database debug statistics and metadata.
 */
export async function dbFetchDebugInfo(db: SQLite.SQLiteDatabase): Promise<DebugInfo> {
  const part1 = await Promise.all([
    dbCount(db, 'manhwas'),
    dbCount(db, 'authors'),
    dbCount(db, 'genres'),
    dbCount(db, 'manhwa_genres'),
    dbCount(db, 'manhwa_authors'),
    dbCount(db, 'reading_status'),
    dbCount(db, 'reading_history')
  ]).then(([
    total_manhwas,
    total_authors,
    total_genres,
    total_manhwa_genres,
    total_manhwa_authors,
    total_reading_status,
    total_reading_history
  ]) => {
    return {
      total_manhwas,
      total_authors,
      total_genres,
      total_manhwa_genres,
      total_manhwa_authors,
      total_reading_status,
      total_reading_history
    }
  })

  const part2 = await Promise.all([
    dbReadDeviceName(db),
    dbReadNumericInfo(db, 'first_run', 1),
    dbReadInfo(db, 'last_sync_time'),
    dbReadNumericInfo(db, 'should_ask_for_donation', 1),
    dbReadNumericInfo(db, 'images'),
    dbReadNumericInfo(db, 'current_chapter_milestone', AppConstants.CHAPTER.GOAL_START),
    dbReadChaptersCount(db)
  ]).then(([
    device,
    first_run,
    last_sync_time,
    should_ask_for_donation,    
    images,
    current_chapter_milestone,
    read_chapters
  ]) => {
    return {
      device,
      first_run,
      last_sync_time,
      should_ask_for_donation,
      images,
      current_chapter_milestone,
      read_chapters
    }
  })

  return {...part1, ...part2}
}


/**
 * Saves debug information into the **local SQLite database**.
 * 
 * Writes multiple debug-related fields concurrently into the database, handling both string and numeric values.
 * Any errors encountered are logged to the console but do not throw.
 *
 * @param db - SQLite database instance
 * @returns A promise that resolves when all debug data has been saved.
 */
export async function dbSetDebugInfo(
  db: SQLite.SQLiteDatabase, 
  debug: DebugInfo
) {
  await Promise.all([
    dbSetInfo(db, 'device', debug.device ?? ''),
    dbSetNumericInfo(db, 'first_run', debug.first_run),
    dbSetInfo(db, 'last_sync_time', debug.last_sync_time ?? ''),
    dbSetNumericInfo(db, 'should_ask_for_donation', debug.should_ask_for_donation),
    dbSetNumericInfo(db, 'images', debug.images),
    dbSetNumericInfo(db, 'current_chapter_milestone', debug.current_chapter_milestone)
  ]).catch(error => console.log("erro dbSetDebugInfo", error))
}


export async function dbReadManhwaRating(db: SQLite.SQLiteDatabase, manhwa_id: number): Promise<ManhwaRating> {
  const r = await db.getFirstAsync<ManhwaRating>(
    'SELECT * FROM manhwa_ratings WHERE manhwa_id = ?;',
    [manhwa_id]
  ).catch(error => console.log("error dbReadManhwaRating", error))

  return r ? r : {manhwa_id: -1, rating: 0, total_rating: 0, user_rating: 0}
}


export async function dbUpdateUserRating(db: SQLite.SQLiteDatabase, manhwa_id: number, rating: number) {
  await db.runAsync(
    'UPDATE manhwa_ratings SET user_rating = ? WHERE manhwa_id = ?;',
    [Math.floor(rating), manhwa_id]
  ).catch(error => console.log("error dbUpdateUserRating", error))
}


export async function dbReadDownload(db: SQLite.SQLiteDatabase, chapter_id: number): Promise<DownloadRecord | null> {
  const r = await db.getFirstAsync<DownloadRecord>(
    'SELECT * FROM downloads WHERE chapter_id = ?;',
    [chapter_id]
  ).catch(error => console.log("error dbReadDownload", error))
  return r ? r : null
}


export async function dbCreateDownload(
  db: SQLite.SQLiteDatabase, 
  manhwa_id: number, 
  chapter_id: number, 
  chapter_name: string
): Promise<DownloadRecord> {
  const path = await createChapterDir(chapter_id)
  const record: DownloadRecord = {
    manhwa_id,
    chapter_id,
    chapter_name,
    path,
    status: 'pending',
    created_at: Date.now()
  }
  await db.runAsync(
    `INSERT INTO 
        downloads (chapter_id, manhwa_id, chapter_name, path, status, created_at) 
      VALUES 
        (?,?,?,?,?,?)
      ON CONFLICT
        (chapter_id)
      DO NOTHING;
      `,
    [
      chapter_id,
      manhwa_id,
      chapter_name,
      path,
      'pending',
      record.created_at
    ]
  ).catch(error => {console.log("error dbCreateDownload", error); record.status = 'failed'})
  return record
}


export async function dbUpdateDownloadStatus(
  db: SQLite.SQLiteDatabase, 
  chapter_id: number, 
  status: DownloadStatus
) {
  await db.runAsync(
    "UPDATE downloads SET status = ? WHERE chapter_id = ?",
    [status, chapter_id]
  ).catch(error => console.log("error dbUpdateDownloadStatus", error))
}


export async function dbUpdateDownloadProgress(
  db: SQLite.SQLiteDatabase,  
  chapter_id: number,
  progress: number
) {
  await db.runAsync(
    "UPDATE downloads SET progress = ? WHERE chapter_id = ?",
    [Math.floor(progress), chapter_id]
  ).catch(error => console.log("error dbUpdateDownloadProgress", error))
}


export async function dbDeleteDownload(
  db: SQLite.SQLiteDatabase,   
  chapter_id: number
) {
 const d: DownloadRecord | null = await dbReadDownload(db, chapter_id)
  if (d) {
    await deleteDocumentDir(d.path)
    await db.runAsync(
      "DELETE FROM downloads WHERE chapter_id = ?",
      [chapter_id]
    ).catch(error => console.log("error dbDeleteDownload", error))
    console.log(`[DOWNLOAD DELETED FOR CHAPTER ${chapter_id}]`);
  } 
}


export async function dbReadDownloadsByStatus(db: SQLite.SQLiteDatabase, status: DownloadStatus): Promise<DownloadRecord[]> {
  const r = await db.getAllAsync<DownloadRecord>(
    'SELECT * FROM downloads WHERE status = ? ORDER BY created_at DESC;',
    [status]
  ).catch(error => console.log("error dbReadDownloadsByStatus", error))
  return r ? r : []
}


export async function dbReadPendingDownloads(db: SQLite.SQLiteDatabase): Promise<DownloadRequest[]> {
  const r = await db.getAllAsync(
    `
      SELECT 
        d.*,
        m.title
      FROM
        downloads d
      JOIN  
        manhwas m ON m.manhwa_id = d.manhwa_id
      WHERE
        d.status = 'pending';
    `
  ).catch(error => console.log("error dbReadPendingDownloads", error))

  return r ? r.map((i: any) => {return {
    chapter_id: i.chapter_id,
    chapter_name: i.chapter_name,
    manhwa_id: i.manhwa_id,
    manhwa_name: i.title
  }}) : []
}



export async function dbDeleteAllDownloads(db: SQLite.SQLiteDatabase) {
  const records = (await dbReadAll<DownloadRecord>(db, 'downloads')).map(i => i.path)
  await asyncPool<string, void>(8, records, deleteDocumentDir)
  await dbCleanTable(db, 'downloads')
}


export async function dbReadDownloadedManhwas(db: SQLite.SQLiteDatabase): Promise<Manhwa[]> {
  const r = await db.getAllAsync<Manhwa>(
    `
      SELECT 
        m.*        
      FROM 
        manhwas m
      JOIN 
        downloads d ON d.manhwa_id = m.manhwa_id
      WHERE 
        d.status = 'completed'
      GROUP 
        BY m.manhwa_id
      ORDER BY 
        m.title ASC;
    `
  ).catch(error => console.log("error dbReadDownloadsByManhwas", error))

  return r ? r : []
}
