import { 
  Author, 
  Chapter,  
  Genre, 
  Manhwa, 
  ManhwaAuthor, 
  ManhwaGenre, 
  Settings, 
  Todo, 
  UserHistory 
} from '@/helpers/types';
import {formatBytes, getCacheSizeBytes, secondsSince } from '@/helpers/util';
import { AppConstants } from '@/constants/AppConstants';
import DeviceInfo from 'react-native-device-info';
import { spGetManhwas, spNewRun } from './supabase';
import { GenreSet } from '@/helpers/GenreSet';
import * as SQLite from 'expo-sqlite';
import uuid from 'react-native-uuid';
import { AuthorSet } from '@/helpers/AuthorSet';


export async function dbMigrate(db: SQLite.SQLiteDatabase) {
  console.log("[DATABASE MIGRATION START]")
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;
    PRAGMA foreign_keys = ON;
    PRAGMA temp_store = MEMORY;
    PRAGMA cache_size = 512;

    CREATE TABLE IF NOT EXISTS app_info (
      name TEXT NOT NULL PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS app_numeric_info (
      name TEXT NOT NULL PRIMARY KEY,
      value INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS collections (
      collection_id INTEGER PRIMARY KEY,
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS update_history (
        name TEXT NOT NULL PRIMARY KEY,
        refresh_cycle INTEGER,
        last_refreshed_at TIMESTAMP DEFAULT NULL
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

    CREATE TABLE IF NOT EXISTS chapters (
      chapter_id INTEGER PRIMARY KEY,
      manhwa_id INTEGER,
      chapter_num INTEGER NOT NULL,
      chapter_name TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (manhwa_id) REFERENCES manhwas(manhwa_id) ON DELETE CASCADE ON UPDATE CASCADE
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

    CREATE INDEX IF NOT EXISTS idx_ma_manhwa_id ON manhwa_authors(manhwa_id);
    CREATE INDEX IF NOT EXISTS idx_authors_name ON authors(name);

    CREATE INDEX IF NOT EXISTS idx_chapters_manhwa_num ON chapters(manhwa_id, chapter_num DESC);
    CREATE INDEX IF NOT EXISTS idx_reading_status_manhwa_id_status ON reading_status (manhwa_id, status);
    CREATE INDEX IF NOT EXISTS idx_reading_history_readed_at ON reading_history(manhwa_id, readed_at DESC);
    CREATE INDEX IF NOT EXISTS idx_alt_titles ON alt_titles(title, manhwa_id);
          
    CREATE INDEX IF NOT EXISTS idx_manhwas_views ON manhwas(views DESC);
    CREATE INDEX IF NOT EXISTS idx_manhwas_updated_at ON manhwas(updated_at DESC);

    INSERT OR REPLACE INTO 
      app_info (name, value)
    VALUES 
      ('version', '${AppConstants.APP_VERSION}');
    
    INSERT INTO app_info 
      (name, value)
    VALUES
      ('device', 'null'),
      ('first_run', '1'),
      ('last_sync_time', ''),
      ('should_ask_for_donation', '1'),
      ('password', ''),
      ('is_safe_mode_on', '0'),
      ('show_last_3_chapters', '0')
    ON CONFLICT 
      (name)
    DO NOTHING;

    INSERT INTO app_numeric_info
      (name, value)        
    VALUES
      ('images', 0),
      ('current_chapter_milestone', ${AppConstants.CHAPTER_GOAL_START}),
      ('drawDistance', ${AppConstants.DEFAULT_DRAW_DISTANCE}),
      ('onEndReachedThreshold', ${AppConstants.DEFAULT_ON_END_REACHED_THRESHOLD})
    ON CONFLICT 
      (name)
    DO NOTHING;

    INSERT INTO 
      update_history (name, refresh_cycle)
    VALUES
      ('server', ${AppConstants.DATABASE.UPDATE_INTERVAL.SERVER}),
      ('client', ${AppConstants.DATABASE.UPDATE_INTERVAL.CLIENT}),
      ('collections', ${AppConstants.DATABASE.UPDATE_INTERVAL.COLLECTIONS})
    ON CONFLICT 
      (name)
    DO UPDATE SET 
      refresh_cycle = EXCLUDED.refresh_cycle;

    INSERT INTO 
      update_history (name, refresh_cycle)
    VALUES
      ('cache', ${AppConstants.DATABASE.SIZE.CACHE})
    ON CONFLICT  
      (name)
    DO NOTHING;
  `
  ).catch(error => console.log("DATABASE MIGRATION ERROR", error));
  console.log("[DATABASE MIGRATION END]")
}

export async function dbReadAll<T>(db: SQLite.SQLiteDatabase, table: string): Promise<T[]> {
  const r = await db.getAllAsync<T>(
    `SELECT * FROM ${table};`
  ).catch(error => console.log(`error dbReadAll ${table}`, error))
  return r ? r : []
}


export async function dbSetCacheSize(db: SQLite.SQLiteDatabase, size: number) {
  await db.runAsync(
      `
        INSERT INTO 
          update_history (name, refresh_cycle) 
        VALUES 
          (?, ?)
        ON CONFLICT
          (name)
        DO UPDATE SET
          refresh_cycle = EXCLUDED.refresh_cycle;
      `,
      ['cache', size]
    ).catch(error => console.log("error dbSetCacheSize", error))
}

export async function dbGetCacheMaxSize(db: SQLite.SQLiteDatabase): Promise<number> {
  const r = await db.getFirstAsync<{refresh_cycle: number}>(
    `
      SELECT 
        refresh_cycle 
      FROM 
        update_history 
      WHERE 
        name = ?;
    `,
    ['cache']
  ).catch(error => console.log("error dbGetCacheMaxSize", error))

  if (!r) {
    await dbSetCacheSize(db, AppConstants.DATABASE.SIZE.CACHE)
  }

  return r ? r.refresh_cycle : AppConstants.DATABASE.SIZE.CACHE;
}

/**
 * Determines whether the local cache should be cleared based on its current size and the maximum allowed size.
 * @param db - An instance of `SQLiteDatabase`.
 * @returns A promise that resolves to `true` if the cache size exceeds the maximum allowed size, `false` otherwise.
 */
export async function dbShouldClearCache(db: SQLite.SQLiteDatabase): Promise<boolean> {
  const maxSize = await dbGetCacheMaxSize(db)
  const cacheSize = await getCacheSizeBytes()
  return cacheSize > maxSize;
}

/**
 * Counts the number of rows in a specified table.
 * @param db - An instance of `SQLiteDatabase`.
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
 * Calculates the total size of the SQLite database in megabytes (MiB).
 * @param db - An instance of `SQLiteDatabase`.
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
  console.log("=========================")
  console.log("[ACEROLA DATABASE START]")
  const r = [
    'num_tables: ' + (await db.getFirstAsync<{num_tables: number}>(`SELECT count(*) as num_tables FROM sqlite_master WHERE type='table';`))?.num_tables,
    'size_mib: ' + await dbGetTotalSizeMiB(db),
    'manhwas: ' + await dbCount(db, 'manhwas'),
    'chapters: ' + await dbCount(db, 'chapters'),
    'genres: ' + await dbCount(db, 'genres'),
    'manhwa_genres: ' + await dbCount(db, 'manhwa_genres'),
    'authors: ' + await dbCount(db, 'authors'),
    'manhwa_authors: ' + await dbCount(db, 'manhwa_authors'),
    'alt_tiles: ' + await dbCount(db, 'alt_titles'),
    'max_cache_size: ' + await dbGetCacheMaxSize(db) / 1024 / 1024 + ' MB',
    'current_cache_size: ' + formatBytes(await getCacheSizeBytes())
  ].forEach(i => console.log(i))
  console.log("[ACEROLA DATABASE END]")
  console.log("=========================")
}


/**
 * Retrieves and logs all rows from a specified table.
 * @param db - An instance of `SQLiteDatabase`.
 * @param table - The name of the table to list rows from.
 * @returns A promise that resolves when the operation is complete. Each row is logged to the console.
 */
export async function dbListTable(db: SQLite.SQLiteDatabase, table: string) {
  const r = await db.getAllAsync(
    `SELECT * FROM ${table};`
  ).catch(error => console.log("error dbListTable", error))
  r ? r.forEach(i => console.log(i)) : null
}


/**
 * Retrieves the timestamp of the last database update from the `app_info` table.
 * @param db - An instance of `SQLiteDatabase`.
 * @returns A promise that resolves to the last update timestamp as a string, or `null` if not found or empty.
 */
export async function dbGetLastDatabaseUpdateTimestamp(db: SQLite.SQLiteDatabase): Promise<string | null> {
  const r = await db.getFirstAsync<{value: string}>(
    'SELECT value FROM app_info WHERE name = ?',
    'last_sync_time'
  ).catch(error => console.log("error dbGetLastDatabaseUpdateTimestamp", error))

  return r?.value && r.value.trim() !== '' ? r.value : null
}

/**
 * Updates the timestamp of the last database update in the `app_info` table.
 * @param db - An instance of `SQLiteDatabase`.
 * @param value - The timestamp string to set as the last update time.
 * @returns A promise that resolves when the update is complete.
 */
export async function dbSetLastDatabaseUpdateTimestamp(db: SQLite.SQLiteDatabase, value: string) {
  await db.runAsync(
    'UPDATE app_info SET value = ? WHERE name = ?;',
    [value, 'last_sync_time']
  ).catch(error => console.log("error dbSetLastDatabaseUpdateTimestamp", error))
}


export async function dbCleanTable(db: SQLite.SQLiteDatabase, table: string) {
  await db.runAsync(`DELETE FROM ${table};`).catch(error => console.log(`error dbCleanTable ${table}`, error))
}

export async function dbClearDatabase(db: SQLite.SQLiteDatabase) {
  await db.runAsync('DELETE FROM manhwas;').catch(error => console.log("error dbClearDatabase manhwas", error))
  await db.runAsync('DELETE FROM genres;').catch(error => console.log("error dbClearDatabase genres", error))
  console.log("[DATABASE CLEAR]")
}


/**
 * Reads a value from the `app_info` table by its name.
 * @param db - An instance of `SQLiteDatabase`.
 * @param name - The name of the info entry to read.
 * @returns A promise that resolves to the value as a string, or `null` if not found.
 */
export async function dbReadInfo(db: SQLite.SQLiteDatabase, name: string): Promise<string | null> {
  const r = await db.getFirstAsync<{value: string}>(
    "SELECT value FROM app_info WHERE name = ?;",
    [name]
  ).catch(error => console.log("error dbCheckInfo", error))
  return r?.value ? r.value : null
}

/**
 * Creates or updates an entry in the `app_info` table.
 * If an entry with the same name already exists, its value will be updated.
 * @param db - An instance of `SQLiteDatabase`.
 * @param name - The name of the info entry.
 * @param value - The value to set for the info entry.
 * @returns A promise that resolves when the operation is complete.
 */
export async function dbCreateInfo(db: SQLite.SQLiteDatabase, name: string, value: string) {
  await db.runAsync(
    `
      INSERT INTO 
        app_info (name, value) 
      VALUES 
        (?,?)
      ON CONFLICT
        (name)
      DO UPDATE SET
        value = EXCLUDED.value;
      `,
      [name, value]
  ).catch(error => console.log("error dbCreateInfo", error))
}

/**
 * Updates the value of an existing entry in the `app_info` table.
 * @param db - An instance of `SQLiteDatabase`.
 * @param name - The name of the info entry to update.
 * @param value - The new value to set for the entry.
 * @returns A promise that resolves when the update is complete.
 */
export async function dbSetInfo(db: SQLite.SQLiteDatabase, name: string, value: string) {
  await db.runAsync(
    "UPDATE app_info SET value = ? WHERE name = ?;",
    [value, name]
  ).catch(error => console.log("error dbSetInfo", error))
}


/**
 * Generates a new UUID for the user and stores it in the `app_info` table under the key `user_id`.
 * If an entry already exists, it will be replaced.
 * @param db - An instance of `SQLiteDatabase`.
 * @returns A promise that resolves to the newly generated user UUID as a string.
 */
async function dbSetUserUUID(db: SQLite.SQLiteDatabase): Promise<string> {
  const user_id = uuid.v4()
  await db.runAsync(
    "INSERT OR REPLACE INTO app_info (name, value) VALUES (?, ?);",
    ['user_id', user_id]
  ).catch(error => console.log("error dbSetInfo", error))
  return user_id
}


export async function dbGetUserUUID(db: SQLite.SQLiteDatabase): Promise<string> {  
  let user_id: string | null = await dbReadInfo(db, 'user_id')    
  if (!user_id) {
    user_id = await dbSetUserUUID(db)
  }
  return user_id!
}


/**
 * Handles first-run initialization of the app.
 * - Checks the `first_run` flag in `app_info`.
 * - If it is the first run:
 *   - Stores device information in the database.
 *   - Generates and stores a new user UUID.
 *   - Invokes spNewRun to transmit first-run user and device information to Supabase.
 * @param db - An instance of `SQLiteDatabase`.
 * @returns A promise that resolves when first-run initialization is complete.
 */
export async function dbFirstRun(db: SQLite.SQLiteDatabase) {
  const r = await dbReadInfo(db, 'first_run')  
  if (r === '1') {
    const model = DeviceInfo.getModel()
    const systemName = DeviceInfo.getSystemName()
    const systemVersion = DeviceInfo.getSystemVersion()
    const device = `${model}, ${systemName}[${systemVersion}]`
    await dbSetInfo(db, 'first_run', '0')
    await dbSetInfo(db, 'device', device)
    const user_id = await dbSetUserUUID(db)
    spNewRun(user_id, device)
    console.log("New User", device, user_id)
  }
}


/**
 * Retrieves all alternative titles for a specific manhwa, excluding the main title.
 * @param db - An instance of `SQLiteDatabase`.
 * @param manhwa_id - The unique ID of the manhwa.
 * @param manhwa_title - The main title of the manhwa to exclude from results.
 * @returns A promise that resolves to an array of alternative titles.
 */
export async function dbGetManhwaAltNames(
  db: SQLite.SQLiteDatabase, 
  manhwa_id: number, 
  manhwa_title: string
): Promise<string[]> {
  const r = await db.getAllAsync<{title: string}>(
    'SELECT title FROM alt_titles WHERE manhwa_id = ?;',
    [manhwa_id]
  ).catch(error => console.log("erro  dbGetManhwaAltNames", error))

  return r ? r.map(i => i.title).filter(i => i != manhwa_title) : []
}


/**
 * Calculates the remaining seconds until the next allowed refresh for a given resource.
 * @param db - An instance of `SQLiteDatabase`.
 * @param name - The name of the resource in the `update_history` table.
 * @returns A promise that resolves to the number of seconds remaining until the next refresh.
 *          Returns a negative value (-1) if the resource is not found.
 */
export async function dbCheckSecondsSinceLastRefresh(
  db: SQLite.SQLiteDatabase, 
  name: string
): Promise<number> {
    const row = await db.getFirstAsync<{
        last_refreshed_at: string,
        refresh_cycle: number
    }>(`
        SELECT
            refresh_cycle,
            last_refreshed_at
        FROM
            update_history
        WHERE
            name = ?;
        `,
        [name]
    ).catch(error => console.log(`error dbCheckSecondsSinceLastRefresh ${name}`, error));

    if (!row) { 
        console.log(`could not read updated_history of ${name}`)
        return -1
    }

    const seconds = secondsSince(row.last_refreshed_at)
    return row.refresh_cycle - seconds
}


/**
 * Updates the `last_refreshed_at` timestamp for a given resource in the `update_history` table to the current time.
 * @param db - An instance of `SQLiteDatabase`.
 * @param name - The name of the resource to update.
 * @returns A promise that resolves when the update is complete.
 */
export async function dbSetLastRefresh(db: SQLite.SQLiteDatabase, name: string) {    
    await db.runAsync(
      `
        UPDATE 
            update_history 
        SET 
            last_refreshed_at = ?
        WHERE name = ?;
      `,
      [new Date().toString(), name]
    ).catch(error => console.log("error dbSetLastRefresh", name, error));
}

/**
 * Determines whether a resource should be updated based on its refresh cycle and last refreshed timestamp.
 * If an update is required, the `last_refreshed_at` timestamp is updated to the current time.
 * @param db - An instance of `SQLiteDatabase`.
 * @param name - The name of the resource in the `update_history` table.
 * @returns A promise that resolves to `true` if the resource should be updated, `false` otherwise.
 */
export async function dbShouldUpdate(
  db: SQLite.SQLiteDatabase, 
  name: string
): Promise<boolean> {
    const row = await db.getFirstAsync<{
        name: string,
        refresh_cycle: number,
        last_refreshed_at: string
    }>(
    `
        SELECT
            name,
            refresh_cycle,
            last_refreshed_at
        FROM
            update_history
        WHERE
            name = ?;
    `, [name]
    ).catch(error => console.log(`error dbShouldUpdate ${name}`, error));

    if (!row) { 
        console.log(`could not read update_history of ${name}`)
        return false 
    }
    
    const seconds = row.last_refreshed_at ? secondsSince(row.last_refreshed_at) : -1
    const shouldUpdate = seconds < 0 || seconds >= row.refresh_cycle

    if (shouldUpdate) {
        const current_time = new Date().toString()
        await db.runAsync(
          `
            UPDATE 
                update_history 
            SET 
                last_refreshed_at = ?
            WHERE name = ?;
          `,
          [current_time, name]
        ).catch(error => console.log("error dbShouldUpdate update_history", name, error));
        return true
    }

    return false
}


/**
 * Inserts or updates a `Manhwa` record in the database along with its related data.
 * This includes genres, authors, chapters, and alternative titles.
 * @param db - An instance of `SQLiteDatabase`.
 * @param manhwa - The `Manhwa` object containing all relevant information to upsert.
 * @returns A promise that resolves when the manhwa and all related data have been upserted.
 */
export async function dbUpsertManhwa(db: SQLite.SQLiteDatabase, manhwa: Manhwa) {
  await db.runAsync(`    
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
    VALUES (?,?,?,?,?,?,?,?);`, 
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
  
  // Chapters
  await dbUpsertChapter(db, manhwa.chapters.map(i => {return {...i, manhwa_id: manhwa.manhwa_id}}))
    
  await dbUpsertAltTitles(
    db, 
    manhwa.manhwa_id, 
    manhwa.alt_titles ? [manhwa.title, ...manhwa.alt_titles] : [manhwa.title]
  )
}


/**
 * Inserts or updates alternative titles for a specific manhwa in the `alt_titles` table.
 * @param db - An instance of `SQLiteDatabase`.
 * @param manhwa_id - The ID of the manhwa to associate the alternative titles with.
 * @param titles - An array of alternative title strings to upsert.
 * @returns A promise that resolves when all titles have been inserted or updated.
 */
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


/**
 * Inserts or updates multiple `Manhwa` records in the `manhwas` table.
 * @param db - An instance of `SQLiteDatabase`.
 * @param manhwas - An array of `Manhwa` objects to upsert.
 * @returns A promise that resolves when all manhwa records have been inserted or updated.
 */
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
    VALUES ${placeholders};`, 
    params
  ).catch(error => console.log("error dbUpsertManhwas", error));
}


/**
 * Inserts or updates multiple `Chapter` records in the `chapters` table.
 * @param db - An instance of `SQLiteDatabase`.
 * @param chapters - An array of `Chapter` objects to upsert.
 * @returns A promise that resolves when all chapter records have been inserted or updated.
 */
async function dbUpsertChapter(db: SQLite.SQLiteDatabase, chapters: Chapter[]) {
  const placeholders = chapters.map(() => '(?,?,?,?,?)').join(',');  
  const params = chapters.flatMap(i => [
      i.chapter_id, 
      i.manhwa_id,
      i.chapter_num,
      i.chapter_name,
      i.created_at
  ]);
  await db.runAsync(
    `
      INSERT OR REPLACE INTO chapters (
        chapter_id,
        manhwa_id,
        chapter_num,
        chapter_name,
        created_at
      )
      VALUES ${placeholders};
    `,
    params
  ).catch(error => console.log("error dbUpsertChapter", error));
}


/**
 * Inserts data into a specified table in batches, handling large numbers of parameters to avoid SQLite limits.
 * Supports optional `ON CONFLICT` behavior.
 * @param db - An instance of `SQLiteDatabase`.
 * @param params - A flat array of values to insert.
 * @param table - The name of the table to insert data into.
 * @param columns - A comma-separated string of column names corresponding to the values.
 * @param rowPlaceholder - A string representing the placeholders for a single row, e.g., `(?,?,?)`.
 * @param numColumns - The number of columns per row (used to split params into correct batches).
 * @param onConflict - Optional SQL clause for handling conflicts, e.g., `ON CONFLICT(...) DO UPDATE SET ...`.
 * @returns A promise that resolves when all batches have been processed.
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


/**
 * Inserts or updates multiple `Genre` records in the `genres` table.
 * If a genre with the same `genre_id` already exists, its name will be updated.
 * @param db - An instance of `SQLiteDatabase`.
 * @param genres - An array of `Genre` objects to upsert.
 * @returns A promise that resolves when all genre records have been inserted or updated.
 */
async function dbUpsertGenres(db: SQLite.SQLiteDatabase, genres: Genre[]) {
  const placeholders = genres.map(() => '(?,?)').join(',');
  const params = genres.flatMap(i => [
    i.genre_id, 
    i.genre    
  ]);
  await db.runAsync(
    `
      INSERT INTO genres (
        genre_id, 
        genre        
      ) 
      VALUES ${placeholders}
      ON CONFLICT 
        (genre_id)
      DO UPDATE SET 
        genre = EXCLUDED.genre;
    `, 
    params
  ).catch(error => console.log("error dbUpsertGenres", error));
}


/**
 * Inserts multiple `ManhwaGenre` relationships into the `manhwa_genres` table.
 * If a relationship already exists (same `genre_id` and `manhwa_id`), it will be ignored.
 * @param db - An instance of `SQLiteDatabase`.
 * @param manhwaGenres - An array of `ManhwaGenre` objects to upsert.
 * @returns A promise that resolves when all genre relationships have been inserted.
 */
async function dbUpsertManhwaGenres(db: SQLite.SQLiteDatabase, manhwaGenres: ManhwaGenre[]) {
  const t1 = Date.now()
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
  console.log("dbUpsertManhwaGenres", Date.now() - t1)
}


/**
 * Inserts or updates multiple `Author` records in the `authors` table.
 * Existing authors with the same `author_id` will be replaced.
 * @param db - An instance of `SQLiteDatabase`.
 * @param authors - An array of `Author` objects to upsert.
 * @returns A promise that resolves when all author records have been inserted or updated.
 */
async function dbUpsertAuthors(db: SQLite.SQLiteDatabase, authors: Author[]) {
  const t1 = Date.now()
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
  console.log("dbUpsertAuthors", Date.now() - t1)
}

/**
 * Inserts multiple `ManhwaAuthor` relationships into the `manhwa_authors` table.
 * If a relationship with the same `author_id`, `manhwa_id`, and `role` already exists, it will be ignored.
 * @param db - An instance of `SQLiteDatabase`.
 * @param manhwaAuthor - An array of `ManhwaAuthor` objects to upsert.
 * @returns A promise that resolves when all author-manwha relationships have been inserted.
 */
async function dbUpsertManhwaAuthors(db: SQLite.SQLiteDatabase, manhwaAuthor: ManhwaAuthor[]) {
  const t1 = Date.now()
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
  console.log("dbUpsertManhwaAuthors", Date.now() - t1)
}


/**
 * Updates the local SQLite database with the latest manhwa data from Supabase.
 * - Fetches manhwas updated since the last database update.
 * - Clears the current database and upserts the latest manhwas, chapters, authors, genres, manhwa-author relationships, manhwa-genre relationships, and alternative titles.
 * - Updates the last database update timestamp.
 * - Logs the duration of the Supabase fetch and SQLite update operations.
 * @param db - An instance of `SQLiteDatabase`.
 * @returns A promise that resolves to the number of manhwas fetched and updated in the database.
 */
export async function dbUpdateDatabase(db: SQLite.SQLiteDatabase): Promise<number> {
  console.log('[UPDATING DATABASE]')
  
  const response_time_start = Date.now()
  const last_update: string | null = await dbGetLastDatabaseUpdateTimestamp(db)
  const manhwas: Manhwa[] = await spGetManhwas(last_update)
  const response_time_end = Date.now()

  if (manhwas.length == 0) {
    console.log(
      "[DATABASE UPDATED]",
      "[SUPABASE] ->", (response_time_end - response_time_start) / 1000,
      "[MANHWAS] ->", manhwas.length
    )
    return manhwas.length
  }

  await dbSetLastDatabaseUpdateTimestamp(db, new Date().toISOString())
  await dbClearDatabase(db)
  await dbUpsertManhwas(db, manhwas)

  const chapters: any[] = []
  const authors: AuthorSet = new AuthorSet()
  const genres: GenreSet = new GenreSet()
  const manhwaAuthors: any[] = []
  const manhwaGenres: any[] = []
  const altTitles: (number | string)[] = []

  manhwas.forEach(manhwa => {
    // Only Last 3 chapters
    manhwa.chapters.forEach(
      c => {
        chapters.push(c.chapter_id)
        chapters.push(manhwa.manhwa_id)
        chapters.push(c.chapter_num)
        chapters.push(c.chapter_name)
        chapters.push(c.created_at)
      }
    )
      
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
  }),
  
  await Promise.all([
    dbUpsertGenres(db, genres.values()),
    dbUpsertBatch(
      db,
      chapters,
      'chapters',
      'chapter_id, manhwa_id, chapter_num, chapter_name, created_at',
      "(?,?,?,?,?)",
      5,
      `
      ON CONFLICT 
        (chapter_id) 
      DO UPDATE SET
        manhwa_id = EXCLUDED.manhwa_id,
        chapter_num = EXCLUDED.chapter_num,
        chapter_name = EXCLUDED.chapter_name,
        created_at = EXCLUDED.created_at
      `
    ),
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
      `
        ON CONFLICT
          (author_id, manhwa_id, role)
        DO NOTHING
      `
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

/**
 * Checks whether the `manhwas` table in the database contains any entries.
 * @param db - An instance of `SQLiteDatabase`.
 * @returns A promise that resolves to `true` if there are no manhwas in the table, or `false` otherwise.
 */
export async function dbHasNoManhwas(db: SQLite.SQLiteDatabase): Promise<boolean> {
  const row = await db.getFirstAsync<{manga_id: number}>(
    `
      SELECT
        manhwa_id
      FROM
        manhwas
      LIMIT 1;
    `    
  ).catch(error => console.log('dbHasManhwas', error)); 
  return row == null
}


/**
 * Checks whether a manhwa with a given ID exists in the `manhwas` table.
 * @param db - An instance of `SQLiteDatabase`.
 * @param manhwa_id - The ID of the manhwa to check.
 * @returns A promise that resolves to `true` if the manhwa exists, `false` otherwise.
 */
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


/**
 * Retrieves a random manhwa ID from the `manhwas` table.
 * @param db - An instance of `SQLiteDatabase`.
 * @returns A promise that resolves to a random manhwa ID, or `null` if the table is empty.
 */
export async function dbGetRandomManhwaId(db: SQLite.SQLiteDatabase): Promise<number | null> {
  const row = await db.getFirstAsync<{manhwa_id: number}>(
    'SELECT manhwa_id FROM manhwas ORDER BY RANDOM() LIMIT 1;'
  ).catch(error => console.log("error dbGetRandomManhwaId", error));
  
  return row ? row.manhwa_id : null
}


/**
 * Retrieves the last three chapters of a specific manhwa, ordered by chapter number descending.
 * @param db - An instance of `SQLiteDatabase`.
 * @param manhwa_id - The ID of the manhwa to fetch chapters for.
 * @returns A promise that resolves to an array of up to three `Chapter` objects. Returns an empty array if no chapters are found.
 */
export async function dbReadLast3Chapters(
  db: SQLite.SQLiteDatabase,
  manhwa_id: number
): Promise<Chapter[]> {
  const rows = await db.getAllAsync(
    `
      SELECT
        *
      FROM
        chapters
      WHERE
        manhwa_id = ?
      ORDER BY 
        chapter_num DESC
      LIMIT 3;
    `,
    [manhwa_id]
  ).catch(error => console.log("error dbReadLast3Chapters", manhwa_id, error));

  return rows ? rows as Chapter[] : []
}


/**
 * Retrieves the current app version from the `app_info` table.
 * @param db - An instance of `SQLiteDatabase`.
 * @returns A promise that resolves to the app version string.
 */
export async function dbGetAppVersion(db: SQLite.SQLiteDatabase): Promise<string> {
  const r = await dbReadInfo(db, 'version')
  return r!
}


/**
 * Retrieves all genres from the `genres` table, ordered alphabetically by genre name.
 * @param db - An instance of `SQLiteDatabase`.
 * @returns A promise that resolves to an array of `Genre` objects. Returns an empty array if no genres are found.
 */
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


/**
 * Retrieves a manhwa record by its ID from the `manhwas` table.
 * @param db - An instance of `SQLiteDatabase`.
 * @param manhwa_id - The ID of the manhwa to fetch.
 * @returns A promise that resolves to a `Manhwa` object if found, or `null` if no matching record exists.
 */
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


/**
 * Retrieves a paginated list of manhwas ordered by their `updated_at` timestamp in descending order.
 * Each manhwa includes its last three chapters.
 * @param db - An instance of `SQLiteDatabase`.
 * @param p_offset - The offset for pagination. Defaults to 0.
 * @param p_limit - The maximum number of manhwas to return. Defaults to 30.
 * @returns A promise that resolves to an array of `Manhwa` objects. Returns an empty array if no manhwas are found.
 */
export async function dbReadManhwasOrderedByUpdateAt(
  db: SQLite.SQLiteDatabase,
  p_offset: number = 0, 
  p_limit: number = 30
): Promise<Manhwa[]> {
  const rows = await db.getAllAsync<{
    manhwa_id: number, 
    title: string, 
    status: string, 
    cover_image_url: string, 
    chapters: Chapter[]
  }>(
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

  if (rows) {
    rows.forEach(async m => {
      m.chapters = await dbReadLast3Chapters(db, m.manhwa_id)
    })
  }

  return rows ? rows as Manhwa[]  : []
}


/**
 * Retrieves a paginated list of manhwas ordered by their view count in descending order.
 * Each manhwa includes its last three chapters.
 * @param db - An instance of `SQLiteDatabase`.
 * @param p_offset - The offset for pagination. Defaults to 0.
 * @param p_limit - The maximum number of manhwas to return. Defaults to 30.
 * @returns A promise that resolves to an array of `Manhwa` objects. Returns an empty array if no manhwas are found.
 */
export async function dbReadManhwasOrderedByViews(
  db: SQLite.SQLiteDatabase,
  p_offset: number = 0, 
  p_limit: number = 30
): Promise<Manhwa[]> {  
  const rows = await db.getAllAsync<{
    manhwa_id: number, 
    title: string, 
    status: string, 
    cover_image_url: string, 
    chapters: Chapter[]
  }>(
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
  
  if (rows) {
    rows.forEach(async m => {
      m.chapters = await dbReadLast3Chapters(db, m.manhwa_id)
    })
  }

  return rows ? rows as Manhwa[]  : []
}


/**
 * Searches for manhwas whose titles or alternative titles match the provided search text (case-insensitive).
 * Results are grouped by manhwa and ordered by view count descending, then by manhwa ID.
 * @param db - An instance of `SQLiteDatabase`.
 * @param p_search_text - The text to search for in manhwa titles and alternative titles.
 * @param p_offset - The offset for pagination. Defaults to 0.
 * @param p_limit - The maximum number of manhwas to return. Defaults to 30.
 * @returns A promise that resolves to an array of `Manhwa` objects matching the search criteria. Returns an empty array if no matches are found.
 */
export async function dbSearchMangas(
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
        m.views DESC, m.manhwa_id      
      LIMIT ?
      OFFSET ?;
    `,
    [`%${p_search_text}%`, p_limit, p_offset]
  ).catch(error => console.log("error dbSearchMangas", p_search_text, error))
  return rows ? rows as Manhwa[] : []
}


/**
 * Increments the view count of a specific manhwa by 1.
 * @param db - An instance of `SQLiteDatabase`.
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


/**
 * Retrieves all genres associated with a specific manhwa, ordered alphabetically by genre name.
 * @param db - An instance of `SQLiteDatabase`.
 * @param manhwa_id - The ID of the manhwa to fetch genres for.
 * @returns A promise that resolves to an array of `Genre` objects. Returns an empty array if no genres are found.
 */
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


/**
 * Retrieves all authors associated with a specific manhwa.
 * @param db - An instance of `SQLiteDatabase`.
 * @param manhwa_id - The ID of the manhwa to fetch authors for.
 * @returns A promise that resolves to an array of `ManhwaAuthor` objects. Returns an empty array if no authors are found.
 */
export async function dbReadMangaAuthors(
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
 * Retrieves the set of chapter IDs that the user has read for a specific manhwa.
 * @param db - An instance of `SQLiteDatabase`.
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
 * Retrieves the reading status of a specific manhwa for the local user.
 * @param db - An instance of `SQLiteDatabase`.
 * @param manhwa_id - The ID of the manhwa to fetch the reading status for.
 * @returns A promise that resolves to the reading status string, or `null` if no status is recorded.
 */
export async function dbGetManhwaReadingStatus(
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
 * Updates or inserts the reading status of a specific manhwa for the local user.
 * If a status already exists for the given manhwa, it will be updated along with the timestamp.
 * @param db - An instance of `SQLiteDatabase`.
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


/**
 * Retrieves all manhwas associated with a specific author, ordered by view count in descending order.
 * @param db - An instance of `SQLiteDatabase`.
 * @param author_id - The ID of the author to fetch manhwas for.
 * @returns A promise that resolves to an array of `Manhwa` objects. Returns an empty array if no manhwas are found for the author.
 */
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


/**
 * Retrieves a paginated list of manhwas associated with a specific genre, ordered by view count descending and then by manhwa ID ascending.
 * @param db - An instance of `SQLiteDatabase`.
 * @param genre_id - The ID of the genre to fetch manhwas for.
 * @param p_offset - The offset for pagination. Defaults to 0.
 * @param p_limit - The maximum number of manhwas to return. Defaults to 30.
 * @returns A promise that resolves to an array of `Manhwa` objects. Returns an empty array if no manhwas are found for the genre.
 */
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
 * Inserts or updates the reading history for a specific manhwa chapter.
 * If the chapter has already been marked as read, its timestamp will be updated to the current time.
 * @param db - An instance of `SQLiteDatabase`.
 * @param manhwa_id - The ID of the manhwa.
 * @param chapter_id - The ID of the chapter being marked as read.
 * @returns A promise that resolves when the operation is complete.
 */
export async function dbUpsertReadingHistory(
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
 * Retrieves a paginated list of manhwas that the user has read, ordered by the most recently read chapters.
 * Each manhwa appears only once in the list.
 * @param db - An instance of `SQLiteDatabase`.
 * @param p_offset - The offset for pagination. Defaults to 0.
 * @param p_limit - The maximum number of manhwas to return. Defaults to 30.
 * @returns A promise that resolves to an array of `Manhwa` objects. Returns an empty array if no reading history exists.
 */
export async function dbGetReadingHistory(
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


/**
 * Retrieves a paginated list of manhwas filtered by a specific reading status, ordered by the most recent status update.
 * Each manhwa includes its last three chapters.
 * @param db - An instance of `SQLiteDatabase`.
 * @param status - The reading status to filter by (e.g., "reading", "completed").
 * @param p_offset - The offset for pagination. Defaults to 0.
 * @param p_limit - The maximum number of manhwas to return. Defaults to 30.
 * @returns A promise that resolves to an array of `Manhwa` objects. Returns an empty array if no manhwas match the status.
 */
export async function dbGetManhwasByReadingStatus(
  db: SQLite.SQLiteDatabase,
  status: string,
  p_offset: number = 0,
  p_limit: number = 30
): Promise<Manhwa[]> {
  const rows = await db.getAllAsync<{
    title: string,
    manhwa_id: number,
    cover_image_url: string,
    chapters: Chapter[]
  }>(
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
        r.updated_at DESC
      LIMIT ?
      OFFSET ?;
    `,
    [status, p_limit, p_offset]
  ).catch(error => console.log("error dbGetMangasByReadingStatus", status, error));  

  if (rows) {
    for (let i = 0; i < rows.length; i++) {
      rows[i].chapters = await dbReadLast3Chapters(db, rows[i].manhwa_id)
    }
  }
  
  return rows ? rows as Manhwa[] : []
}


/**
 * Retrieves the total number of chapters that the user has read across all manhwas.
 * @param db - An instance of `SQLiteDatabase`.
 * @returns A promise that resolves to the total count of read chapters. Returns 0 if no chapters have been read.
 */
export async function dbGetReadChaptersCount(db: SQLite.SQLiteDatabase): Promise<number> {
  const r = await db.getFirstAsync<{total: number}>(
    'SELECT count(*) as total FROM reading_history;', ['chapters']
  ).catch(error => console.log("error dbNumReadedChapters", error))
  return r ? r.total : 0
}


/**
 * Retrieves the total number of distinct manhwas that the user has read at least one chapter of.
 * @param db - An instance of `SQLiteDatabase`.
 * @returns A promise that resolves to the count of unique manhwas read. Returns 0 if no manhwas have been read.
 */
export async function dbGetReadManhwasCount(db: SQLite.SQLiteDatabase): Promise<number> {
  const r = await db.getFirstAsync<{total: number}>(
    'SELECT COUNT(DISTINCT manhwa_id) AS total FROM reading_history;'
  ).catch(error => console.log("error dbNumUniqueManhwasReaded", error))
  return r ? r.total : 0
}


/**
 * Retrieves the total number of images that have been fetched by the app.
 * @param db - An instance of `SQLiteDatabase`.
 * @returns A promise that resolves to the count of fetched images.
 */
export async function dbGetNumImagesFetchedCount(db: SQLite.SQLiteDatabase): Promise<number> {
  const r = await db.getFirstAsync<{value: number}>(
    `SELECT value FROM app_numeric_info WHERE name = 'images'`
  ).catch(error => console.log("error dbGetNumImagesFetched", error))
  return r ? r.value : 0
}


/**
 * Retrieves a numeric value stored in the `app_numeric_info` table by its name.
 * @param db - An instance of `SQLiteDatabase`.
 * @param name - The key/name of the numeric info to retrieve.
 * @returns A promise that resolves to the numeric value if found, or `null` if not found.
 */
export async function dbReadNumericInfo(db: SQLite.SQLiteDatabase, name: string): Promise<number | null> {
  const r = await db.getFirstAsync<{value: number}>(
    'SELECT value FROM app_numeric_info WHERE name = ?;',
    [name]
  ).catch(error => console.log("error dbGetNumericInfo", error))
  return r ? r.value : null
}


/**
 * Increments a numeric value in the `app_numeric_info` table by a specified amount.
 * @param db - An instance of `SQLiteDatabase`.
 * @param name - The key/name of the numeric info to update.
 * @param delta - The amount to add to the current value. Defaults to 1.
 * @returns A promise that resolves when the update operation is complete.
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
 * Creates or updates a numeric entry in the `app_numeric_info` table.
 * If an entry with the given name already exists, its value is replaced.
 * @param db - An instance of `SQLiteDatabase`.
 * @param name - The key/name of the numeric info to create or update.
 * @param value - The numeric value to set.
 * @returns A promise that resolves when the insert or update operation is complete.
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
 * Sets a numeric value in the `app_numeric_info` table for a given name.
 * @param db - An instance of `SQLiteDatabase`.
 * @param name - The key/name of the numeric info to update.
 * @param value - The numeric value to set.
 * @returns A promise that resolves when the update operation is complete.
 */
export async function dbSetNumericInfo(db: SQLite.SQLiteDatabase, name: string, value: number) {
  await db.runAsync(
    `
      UPDATE 
        app_numeric_info
      SET
        value = ?
      WHERE
        name = ?;
    `,
    [value, name]
  ).catch(error => console.log("error dbSetNumericInfo", error))
}


/**
 * Retrieves the user's overall reading history statistics.
 * @param db - An instance of `SQLiteDatabase`.
 * @returns A promise that resolves to a `UserHistory` object containing:
 *   - `manhwas`: Total number of distinct manhwas read.
 *   - `chapters`: Total number of chapters read.
 *   - `images`: Total number of images fetched.
 */
export async function dbGetUserHistory(db: SQLite.SQLiteDatabase): Promise<UserHistory> {
  const [manhwas, chapters, images] = await Promise.all([
    dbGetReadManhwasCount(db),
    dbGetReadChaptersCount(db),
    dbGetNumImagesFetchedCount(db)
  ])
  return { manhwas, chapters, images }
}


/**
 * Updates the local setting that controls whether the app should prompt the user for a donation.
 *
 * This modifies the `should_ask_for_donation` key in the `app_info` table.
 *
 * @param db - The local SQLite database instance.
 * @param value - A string representing the new state. Typically `'1'` to enable asking for donations, or `'0'` to disable.
 */
export async function dbSetShouldAskForDonation(db: SQLite.SQLiteDatabase, value: string) {
  await dbSetInfo(db, 'should_ask_for_donation', value)
}


/**
 * Determines whether the app should currently prompt the user for a donation.
 *
 * The check is based on a local app setting stored in `app_info` under the key `should_ask_for_donation`.
 * A value of `'1'` indicates that the app should ask for a donation; any other value or absence of the key means no prompt.
 *
 * @param db - The local SQLite database instance.
 * @returns A promise resolving to `true` if the app should ask for a donation, otherwise `false`.
 */
export async function dbShouldAskForDonation(db: SQLite.SQLiteDatabase): Promise<boolean> {
  const r = await dbReadInfo(db, 'should_ask_for_donation')
  return r !== null && r === '1'
}


/**
 * Checks whether the user has reached the next chapter milestone for prompting a donation message.
 * 
 * Logic:
 * 1. Verifies if the app should ask for a donation (`dbShouldAskForDonation`).
 * 2. Reads the total number of chapters the user has read.
 * 3. Retrieves the current milestone from the database, initializing it if missing.
 * 4. If the read chapters count meets or exceeds the milestone:
 *    - Updates the milestone by adding a defined increment.
 *    - Returns `true` to indicate the milestone has been reached.
 * 5. Otherwise, returns `false`.
 *
 * @param db - The local SQLite database instance.
 * @returns A promise resolving to `true` if a chapter milestone is reached, `false` otherwise.
 */
export async function dbIsChapterMilestoneReached(db: SQLite.SQLiteDatabase): Promise<boolean> {
  const shouldAsk = await dbShouldAskForDonation(db)
  if (!shouldAsk) { return false }

  const readChaptersCount = await dbGetReadChaptersCount(db)
  
  let currentMilestone = await dbReadNumericInfo(db, 'current_chapter_milestone')
  if (!currentMilestone) {
    await dbCreateNumericInfo(db, 'current_chapter_milestone', AppConstants.CHAPTER_GOAL_START)
    currentMilestone = AppConstants.CHAPTER_GOAL_START
  }  
  
  if (readChaptersCount >= currentMilestone) {
    await dbSetNumericInfo(
      db, 
      'current_chapter_milestone', 
      readChaptersCount + AppConstants.CHAPTER_GOAL_INCREMENT
    )
    return true
  }  
  return false
}


/**
 * Checks whether the app's "Safe Mode" is currently enabled.
 *
 * Safe Mode may be used to filter or restrict certain content in the app.
 *
 * @param db - The local SQLite database instance.
 * @returns `true` if Safe Mode is enabled, `false` otherwise.
 */
export async function dbIsSafeModeEnabled(db: SQLite.SQLiteDatabase): Promise<boolean> {
  const r = await dbReadInfo(db, 'is_safe_mode_on')
  return r === '1'
}


/**
 * Sets the state of the app's "Safe Mode".
 *
 * Safe Mode may be used to filter or restrict certain content in the app.
 *
 * @param db - The local SQLite database instance.
 * @param state - `true` to enable Safe Mode, `false` to disable it.
 */
export async function dbSetSafeModeState(db: SQLite.SQLiteDatabase, state: boolean) {
  await dbSetInfo(db, 'is_safe_mode_on', state ? '1' : '0')
}


/**
 * Reads TODO items from the local database.
 *
 * Retrieves all TODOs, optionally filtered by their completion status.
 *
 * @param db - The SQLite database instance.
 * @param completed - If `true`, returns only completed TODOs; 
 *                    if `false`, returns only incomplete TODOs;
 *                    if `null` (default), returns all TODOs.
 * @returns An array of TODO items, ordered by completion and creation date.
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
 * Retrieves a single TODO item by its ID.
 *
 * @param db - The SQLite database instance.
 * @param todo_id - The unique ID of the TODO item to retrieve.
 * @returns The TODO item if found, otherwise `null`.
 */
export async function dbReadTodoById(db: SQLite.SQLiteDatabase, todo_id: number): Promise<Todo | null> {
  const r = await db.getFirstAsync<Todo>(
    'SELECT * FROM todos WHERE todo_id = ?;',
    [todo_id]
  ).catch(error => console.log("error dbReadTodoById", error))
  return r ? r : null
}


/**
 * Creates a new TODO item in the database.
 *
 * @param db - The SQLite database instance.
 * @param title - The title of the TODO item.
 * @param descr - An optional description of the TODO item.
 * @returns The newly created TODO item if successful, otherwise `null`.
 */
export async function dbCreateTodo(db: SQLite.SQLiteDatabase, title: string, descr: string | null = null): Promise<Todo | null> {
  const r = await db.getFirstAsync<{todo_id: number}>(
    `
      INSERT INTO todos (
        title,
        descr
      )
      VALUES 
        (?, ?)
      RETURNING
        todo_id;
    `,
    [title, descr]
  ).catch(error => console.log("error dbCreateTodo", error))
  
  if (r?.todo_id) {
    return await dbReadTodoById(db, r.todo_id)
  }

  return null
}


/**
 * Deletes all TODO items that have been marked as completed from the database.
 *
 * @param db - The SQLite database instance.
 */
export async function dbDeleteCompletedTodos(db: SQLite.SQLiteDatabase) {
  await db.runAsync(
    'DELETE FROM todos WHERE completed = 1;'
  ).catch(error => console.log("error dbDeleteCompletedTodos", error))
}


/**
 * Updates a TODO item in the database.
 *
 * @param db - The SQLite database instance.
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
    [title, descr, completed, completed === 1 ? 'CURRENT_TIMESTAMP' : null, todo_id]
  ).catch(error => {console.log("error dbUpdateTodo", error); return false})
  return r !== false
}


/**
 * Deletes a TODO item from the database by its ID.
 *
 * @param db - The SQLite database instance.
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
 * Retrieves the Safe Mode password from the local database.
 * If no password exists, initializes it with an empty string and returns ''.
 *
 * @param db - The SQLite database instance.
 * @returns The Safe Mode password as a string.
 */
export async function dbReadSafeModePassword(db: SQLite.SQLiteDatabase): Promise<string> {
  const password = await dbReadInfo(db, 'password')
  if (!password) {
    await dbCreateInfo(db, 'password', '')
    return ''
  }
  return password
}


/**
 * Sets or creates the Safe Mode password in the local database.
 *
 * @param db - The SQLite database instance.
 * @param password - The password string to store.
 */
export async function dbCreateSafeModePassword(db: SQLite.SQLiteDatabase, password: string) {
  await dbCreateInfo(db, 'password', password)
}


/**
 * Checks if the provided password matches the stored safe mode password.
 * Adds a 0.5-second delay before performing the check.
 * 
 * @param db - SQLite database instance
 * @param password - Password string to check
 * @returns A boolean indicating whether the password is correct
 */
export async function dbCheckPassword(db: SQLite.SQLiteDatabase, password: string): Promise<boolean> {
  await new Promise(resolve => setTimeout(resolve, 500));
  const p = await dbReadSafeModePassword(db)
  return p === password
}


/**
 * Resets the app to its initial state by:
 *  - Re-initializing `app_info` with default values
 *  - Setting numeric app info values (`images`, `current_chapter_milestone`)
 *  - Ensuring a default entry in `update_history` for caching
 *  - Clearing all entries in `chapters`, `reading_status`, `reading_history`, and `todos` tables
 *
 * @param db - SQLite database instance
 */
export async function dbResetApp(db: SQLite.SQLiteDatabase) {
  await db.execAsync(
    `
    INSERT OR REPLACE INTO 
      app_info (name, value)
    VALUES 
      ('version', '${AppConstants.APP_VERSION}');

    INSERT INTO app_info 
      (name, value)
    VALUES
      ('device', 'null'),
      ('last_sync_time', ''),
      ('should_ask_for_donation', '1'),
      ('password', ''),
      ('is_safe_mode_on', '0')
    ON CONFLICT 
      (name)
    DO UPDATE SET
      value = EXCLUDED.value;

    INSERT INTO app_numeric_info
      (name, value)        
    VALUES
      ('images', 0),
      ('current_chapter_milestone', ${AppConstants.CHAPTER_GOAL_START})
    ON CONFLICT 
      (name)
    DO UPDATE SET
      value = EXCLUDED.value;

    INSERT INTO 
      update_history (name, refresh_cycle)
    VALUES
      ('cache', ${AppConstants.DATABASE.SIZE.CACHE})
    ON CONFLICT  
      (name)
    DO NOTHING;
    `
  ).catch(error => console.log("error dbResetApp", error))
  await dbCleanTable(db, 'chapters')
  await dbCleanTable(db, 'reading_status')
  await dbCleanTable(db, 'reading_history')
  await dbCleanTable(db, 'todos')
}


/**
 * Loads the app's user settings from the database.
 *  
 * Returns default values if any setting is not found or if an error occurs.
 *
 * @param db - SQLite database instance
 * @returns Settings object containing user preferences
 */
export async function dbLoadSettings(db: SQLite.SQLiteDatabase): Promise<Settings> {
  const r: Settings | null = await Promise.all([
      dbReadInfo(db, 'show_last_3_chapters'),
      dbReadNumericInfo(db, 'drawDistance'),
      dbReadNumericInfo(db, 'onEndReachedThreshold')
  ]).then(([
    showLast3Chapters,
    drawDistance,
    onEndReachedThreshold
  ]) => {
      return {
        showLast3Chapters: showLast3Chapters === '1',
        drawDistance: drawDistance !== null ? drawDistance : AppConstants.DEFAULT_DRAW_DISTANCE,
        onEndReachedThreshold: onEndReachedThreshold !== null ? onEndReachedThreshold : AppConstants.DEFAULT_ON_END_REACHED_THRESHOLD
      }
  }).catch(error => {
    console.log("error dbLoadSettings", error); 
    return null
  })

  return r ? r : {
    showLast3Chapters: false,
    drawDistance: AppConstants.DEFAULT_DRAW_DISTANCE,
    onEndReachedThreshold: AppConstants.DEFAULT_ON_END_REACHED_THRESHOLD
  }
}