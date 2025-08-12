import { AppConstants } from '@/constants/AppConstants';
import { Author, Chapter, Collection, Genre, Manhwa, ManhwaAuthor, ManhwaGenre, Todo, UserHistory } from '@/helpers/types';
import { formatBytes, getCacheSizeBytes, secondsSince } from '@/helpers/util';
import * as SQLite from 'expo-sqlite';
import DeviceInfo from 'react-native-device-info';
import uuid from 'react-native-uuid';
import { spGetManhwas, spNewRun } from './supabase';


export async function dbMigrate(db: SQLite.SQLiteDatabase) {
    console.log("[DATABASE MIGRATION START]")
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      PRAGMA synchronous = NORMAL;
      PRAGMA foreign_keys = ON;
      PRAGMA temp_store = MEMORY;
      PRAGMA cache_size = -10000;

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
        ('version', '${AppConstants.COMMON.APP_VERSION}');
      
      INSERT INTO app_info 
        (name, value)
      VALUES
        ('device', 'null'),
        ('first_run', '1'),
        ('last_sync_time', ''),
        ('should_ask_for_donation', '1'),
        ('password', ''),
        ('is_safe_mode_on', '0')
      ON CONFLICT 
        (name)
      DO NOTHING;

      INSERT INTO app_numeric_info
        (name, value)        
      VALUES
        ('images', 0),
        ('current_chapter_milestone', ${AppConstants.COMMON.CHAPTER_START_MILESTONE})
      ON CONFLICT 
        (name)
      DO NOTHING;

      INSERT INTO 
        update_history (name, refresh_cycle)
      VALUES
        ('server', ${AppConstants.COMMON.SERVER_UPDATE_RATE}),
        ('client', ${AppConstants.COMMON.CLIENT_UPDATE_RATE}),
        ('collections', ${AppConstants.COMMON.COLLECTIONS_UPDATE_RATE})
      ON CONFLICT 
        (name)
      DO UPDATE SET 
        refresh_cycle = EXCLUDED.refresh_cycle;

      INSERT INTO 
        update_history (name, refresh_cycle)
      VALUES
        ('cache', ${AppConstants.COMMON.DEFAULT_CACHE_SIZE})
      ON CONFLICT  
        (name)
      DO NOTHING;
    `
    ).catch(error => console.log("DATABASE MIGRATION ERROR", error));
    console.log("[DATABASE MIGRATION END]")
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
    await dbSetCacheSize(db, AppConstants.COMMON.DEFAULT_CACHE_SIZE)
  }

  return r ? r.refresh_cycle : AppConstants.COMMON.DEFAULT_CACHE_SIZE;
}


export async function dbShouldClearCache(db: SQLite.SQLiteDatabase): Promise<boolean> {
  const maxSize = await dbGetCacheMaxSize(db)
  const cacheSize = await getCacheSizeBytes()
  return cacheSize > maxSize;
}


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


export async function dbListTable(db: SQLite.SQLiteDatabase, table: string) {
  const r = await db.getAllAsync(
    `SELECT * FROM ${table};`
  ).catch(error => console.log("error dbListTable", error))
  r ? r.forEach(i => console.log(i)) : null
}


export async function dbGetLastDatabaseUpdateTimestamp(db: SQLite.SQLiteDatabase): Promise<string | null> {
  const r = await db.getFirstAsync<{value: string}>(
    'SELECT value FROM app_info WHERE name = ?',
    'last_sync_time'
  ).catch(error => console.log("error dbGetLastDatabaseUpdateTimestamp", error))

  return r?.value && r.value.trim() !== '' ? r.value : null
}


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


export async function dbReadInfo(db: SQLite.SQLiteDatabase, name: string): Promise<string | null> {
  const r = await db.getFirstAsync<{value: string}>(
    "SELECT value FROM app_info WHERE name = ?;",
    [name]
  ).catch(error => console.log("error dbCheckInfo", error))
  return r?.value ? r.value : null
}

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

export async function dbSetInfo(db: SQLite.SQLiteDatabase, name: string, value: string) {
  await db.runAsync(
    "UPDATE app_info SET value = ? WHERE name = ?;",
    [value, name]
  ).catch(error => console.log("error dbSetInfo", error))
}


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

async function dbUpsertAltTitlesBatch(db: SQLite.SQLiteDatabase, titles: (number | string)[]) {
  let placeholders = ''
  const p = '(?, ?), '
  for (let i = 0; i < titles.length / 2; i++) {
    placeholders += p
  }
  
  placeholders = placeholders.slice(0, placeholders.length - 2)

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


export async function dbUpsertCollections(db: SQLite.SQLiteDatabase, collections: Collection[]) {
  const placeholders = collections.map(() => '(?,?)').join(',');  
  const params = collections.flatMap(i => [
    i.collection_id, 
    i.name    
  ]); 
  await db.runAsync(
    `
      INSERT OR REPLACE INTO collections (
        collection_id,
        name        
      )
      VALUES ${placeholders};
    `,
    params
  ).catch(error => console.log("error dbUpsertCollections", error))
}


export async function dbReadCollections(db: SQLite.SQLiteDatabase): Promise<Collection[]> {
  const r = await db.getAllAsync<Collection>(
    'SELECT * FROM collections ORDER BY name;'
  ).catch(error => console.log("dbReadCollections", error))
  return r ? r : [];
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
  `, params
  ).catch(error => console.log("error dbUpsertChapter", error));
}


async function dbUpsertGenres(db: SQLite.SQLiteDatabase, genres: Genre[]) {
  const placeholders = genres.map(() => '(?,?)').join(',');
  const params = genres.flatMap(i => [
    i.genre_id, 
    i.genre    
  ]);
  await db.runAsync(
    `
      INSERT OR REPLACE INTO genres (
        genre_id, 
        genre        
      ) 
      VALUES ${placeholders};
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
        INSERT OR REPLACE INTO manhwa_genres (
            genre_id,
            manhwa_id
        ) 
        VALUES ${placeholders};        
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
        INSERT OR REPLACE INTO manhwa_authors (
            author_id, 
            manhwa_id,
            role
        ) 
        VALUES ${placeholders};
      `, 
      params
    ).catch(error => console.log("error dbUpsertManhwaAuthors", error));
}

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

    const chapters: Chapter[] = []
    const authors: Author[] = []
    const genres: Set<Genre> = new Set()
    const manhwaAuthors: ManhwaAuthor[] = []
    const manhwaGenres: ManhwaGenre[] = []
    const titles: (number | string)[] = []

    manhwas.forEach(i => {
      // Last 3 chapters
      i.chapters.forEach(c => chapters.push({...c, manhwa_id: i.manhwa_id})); 

      // Genres
      i.genres.forEach(g => {
        genres.add(g)
        manhwaGenres.push({genre_id: g.genre_id, manhwa_id: i.manhwa_id})
      });

      // Authors
      i.authors.forEach(a => {
        authors.push(a);
        manhwaAuthors.push({...a, manhwa_id: i.manhwa_id})
      });

      // Titles
      titles.push(i.manhwa_id); titles.push(i.title);
      i.alt_titles.forEach(alt_title => {
        titles.push(i.manhwa_id); titles.push(alt_title)
      })
      
    })

    await dbUpsertAltTitlesBatch(db, titles)
              
    await dbUpsertGenres(db, Array.from(genres))
    await dbUpsertManhwaGenres(db, manhwaGenres)
        
    await dbUpsertAuthors(db, authors)
    await dbUpsertManhwaAuthors(db, manhwaAuthors)
    
    await dbUpsertChapter(db, chapters)    

    const end = Date.now()
    console.log(
      "[DATABASE UPDATED]", 
      "[SUPABASE] ->", (response_time_end - response_time_start) / 1000,
      "| [SQLITE] ->", (end - response_time_end) / 1000,
      "| [MANHWAS] ->", manhwas.length
    )
    return manhwas.length
}


export async function dbHasManhwas(db: SQLite.SQLiteDatabase): Promise<boolean> {
  const row = await db.getFirstAsync<{manga_id: number}>(
    `
      SELECT
        manhwa_id
      FROM
        manhwas
      LIMIT 1;
    `    
  ).catch(error => console.log('dbHasManhwas', error)); 
  return row != null
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


export async function dbGetAppVersion(db: SQLite.SQLiteDatabase): Promise<string> {
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


export async function dbGetReadChaptersCount(db: SQLite.SQLiteDatabase): Promise<number> {
  const r = await db.getFirstAsync<{total: number}>(
    'SELECT count(*) as total FROM reading_history;', ['chapters']
  ).catch(error => console.log("error dbNumReadedChapters", error))
  return r ? r.total : 0
}


export async function dbGetReadManhwasCount(db: SQLite.SQLiteDatabase): Promise<number> {
  const r = await db.getFirstAsync<{total: number}>(
    'SELECT COUNT(DISTINCT manhwa_id) AS total FROM reading_history;'
  ).catch(error => console.log("error dbNumUniqueManhwasReaded", error))
  return r ? r.total : 0
}

export async function dbGetNumImagesFetchedCount(db: SQLite.SQLiteDatabase): Promise<number> {
  const r = await db.getFirstAsync<{value: number}>(
    `SELECT value FROM app_numeric_info WHERE name = 'images'`
  ).catch(error => console.log("error dbGetNumImagesFetched", error))
  return r ? r.value : 0
}

export async function dbGetNumericInfo(db: SQLite.SQLiteDatabase, name: string): Promise<number | null> {
  const r = await db.getFirstAsync<{value: number}>(
    'SELECT value FROM app_numeric_info WHERE name = ?;',
    [name]
  ).catch(error => console.log("error dbGetNumericInfo", error))
  return r ? r.value : null
}


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


export async function dbGetUserHistory(db: SQLite.SQLiteDatabase): Promise<UserHistory> {
  const [manhwas, chapters, images] = await Promise.all([
    dbGetReadManhwasCount(db),
    dbGetReadChaptersCount(db),
    dbGetNumImagesFetchedCount(db)
  ])
  return { manhwas, chapters, images }
}



export async function dbIsChapterMilestoneReached(db: SQLite.SQLiteDatabase): Promise<boolean> {
  const shouldAsk = await dbShouldAskForDonation(db)
  if (!shouldAsk) { return false }

  const readChaptersCount = await dbGetReadChaptersCount(db)
  
  let currentMilestone = await dbGetNumericInfo(db, 'current_chapter_milestone')
  if (!currentMilestone) {
    await dbCreateNumericInfo(db, 'current_chapter_milestone', AppConstants.COMMON.CHAPTER_START_MILESTONE)
    currentMilestone = AppConstants.COMMON.CHAPTER_START_MILESTONE
  }  
  
  if (readChaptersCount >= currentMilestone) {
    await dbSetNumericInfo(db, 'current_chapter_milestone', readChaptersCount + AppConstants.COMMON.CHAPTER_MILESTONE_INCREMENT)    
    return true
  }  
  return false
}


export async function dbShouldAskForDonation(db: SQLite.SQLiteDatabase): Promise<boolean> {
  const r = await dbReadInfo(db, 'should_ask_for_donation')
  return r !== null && r === '1'
}


export async function dbSetShouldAskForDonation(db: SQLite.SQLiteDatabase, value: string) {
  await dbSetInfo(db, 'should_ask_for_donation', value)
}


export async function dbIsSafeModeEnabled(db: SQLite.SQLiteDatabase): Promise<boolean> {
  const r = await dbReadInfo(db, 'is_safe_mode_on')
  return r === '1'
}


export async function dbSetSafeModeState(db: SQLite.SQLiteDatabase, state: boolean) {
  await dbSetInfo(db, 'is_safe_mode_on', state ? '1' : '0')
}


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

export async function dbReadTodoById(db: SQLite.SQLiteDatabase, todo_id: number): Promise<Todo | null> {
  const r = await db.getFirstAsync<Todo>(
    'SELECT * FROM todos WHERE todo_id = ?;',
    [todo_id]
  ).catch(error => console.log("error dbReadTodoById", error))
  return r ? r : null
}

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

export async function dbDeleteCompletedTodos(db: SQLite.SQLiteDatabase) {
  await db.runAsync(
    'DELETE FROM todos WHERE completed = 1;'
  ).catch(error => console.log("error dbDeleteCompletedTodos", error))
}

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


export async function dbDeleteTodo(db: SQLite.SQLiteDatabase, todo_id: number): Promise<boolean> {
  const r = await db.runAsync(
    'DELETE FROM todos WHERE todo_id = ?;',
    [todo_id]
  ).catch(error => {console.log("error dbDeleteTodo", error); return false})
  return r !== false
}


export async function dbReadSafeModePassword(db: SQLite.SQLiteDatabase): Promise<string> {
  const password = await dbReadInfo(db, 'password')
  if (!password) {
    await dbCreateInfo(db, 'password', '')
    return ''
  }
  return password
}


export async function dbCreateSafeModePassword(db: SQLite.SQLiteDatabase, password: string) {
  await dbCreateInfo(db, 'password', password)
}


export async function dbCheckPassword(db: SQLite.SQLiteDatabase, password: string): Promise<boolean> {
  const p = await dbReadSafeModePassword(db)
  return p === password
}