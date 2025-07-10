import { AppRelease, Author, Chapter, Genre, Manhwa, ManhwaAuthor, ManhwaGenre } from '@/helpers/types';
import { secondsSince } from '@/helpers/util';
import * as SQLite from 'expo-sqlite';
import { spGetManhwas, spGetReleases } from './supabase';


export async function dbMigrate(db: SQLite.SQLiteDatabase) {
    console.log("[DATABASE MIGRATION START]")
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      PRAGMA synchronous = NORMAL;      

      CREATE TABLE IF NOT EXISTS app_info (
          name TEXT NOT NULL PRIMARY KEY,
          value TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS update_history (
          name TEXT NOT NULL PRIMARY KEY,
          refresh_cycle INTEGER,
          last_refreshed_at TIMESTAMP DEFAULT NULL
      );

      CREATE TABLE IF NOT EXISTS genres (
          genre_id INTEGER PRIMARY KEY,
          genre TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS authors (
          author_id INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          role TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS manhwas (
          manhwa_id INTEGER PRIMARY KEY,
          title TEXT NOT NULL UNIQUE,
          descr TEXT NOT NULL,
          cover_image_url TEXT NOT NULL,
          status TEXT NOT NULL,
          color TEXT NOT NULL,
          rating DECIMAL(2, 1) DEFAULT NULL,
          views INTEGER NOT NULL DEFAULT 0,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS manhwa_authors (
          manhwa_author_id INTEGER AUTO_INCREMENT,
          author_id INTEGER NOT NULL,
          manhwa_id INTEGER NOT NULL,
          role TEXT NOT NULL,
          CONSTRAINT manhwa_authors_pkey PRIMARY KEY (manhwa_id, author_id, role),          
          CONSTRAINT manhwa_authors_author_id_fkey FOREIGN KEY (author_id) REFERENCES authors (author_id) ON UPDATE CASCADE ON DELETE CASCADE,
          CONSTRAINT manhwa_authors_manhwa_id_fkey FOREIGN KEY (manhwa_id) REFERENCES manhwas (manhwa_id) ON UPDATE CASCADE ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS manhwa_genres (
          genre_id INTEGER NOT NULL,
          manhwa_id INTEGER NOT NULL,
          CONSTRAINT manhwa_genres_pkey PRIMARY KEY (manhwa_id, genre_id),
          CONSTRAINT manhwa_genres_genre_id_fkey FOREIGN KEY (genre_id) REFERENCES genres (genre_id) ON UPDATE CASCADE ON DELETE CASCADE,        
          CONSTRAINT manhwa_genres_manhwa_id_fkey FOREIGN KEY (manhwa_id) REFERENCES manhwas (manhwa_id) ON UPDATE CASCADE ON DELETE CASCADE
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
          updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_reading_status_manhwa FOREIGN KEY (manhwa_id) REFERENCES manhwas (manhwa_id) ON UPDATE CASCADE ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS reading_history (
          manhwa_id    INTEGER NOT NULL,      
          chapter_id   INTEGER NOT NULL,
          chapter_num  INTEGER NOT NULL,
          readed_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY  (manhwa_id, chapter_id),              
          FOREIGN KEY  (manhwa_id) REFERENCES manhwas (manhwa_id) ON UPDATE CASCADE ON DELETE CASCADE,
          FOREIGN KEY  (chapter_id) REFERENCES chapters (chapter_id) ON UPDATE CASCADE ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS app_releases (
        release_id INTEGER PRIMARY KEY,
        version TEXT NOT NULL,
        url TEXT NOT NULL,
        descr TEXT,
        created_at TIMESTAMP NOT NULL
      );            

      CREATE INDEX IF NOT EXISTS idx_chapters_manhwa_id ON chapters(manhwa_id);
      CREATE INDEX IF NOT EXISTS idx_ma_manhwa_id ON manhwa_authors(manhwa_id);
      CREATE INDEX IF NOT EXISTS idx_manhwas_status ON manhwas(status);
      CREATE INDEX IF NOT EXISTS idx_manhwas_rating ON manhwas(rating);
      CREATE INDEX IF NOT EXISTS idx_authors_name ON authors(name);
      CREATE INDEX IF NOT EXISTS idx_chapters_manhwa_num ON chapters(manhwa_id, chapter_num DESC);
      CREATE INDEX IF NOT EXISTS idx_reading_status_manhwa_id_status ON reading_status (manhwa_id, status);
      CREATE INDEX IF NOT EXISTS idx_reading_history_updated ON reading_history(manhwa_id, chapter_num, readed_at DESC);

      INSERT OR REPLACE INTO 
        app_info (name, value)
      VALUES 
        ('version', 'v1.0.0');
      
      INSERT INTO
        app_info (name, value)
      VALUES
        ('read_mode', 'List')        
      ON CONFLICT (name)
      DO NOTHING;

      INSERT INTO
          update_history (name, refresh_cycle)
      VALUES
        ('server', 60 * 60 * 2),
        ('client', 42)
      ON CONFLICT 
        (name)
      DO UPDATE SET 
        refresh_cycle = EXCLUDED.refresh_cycle;
    `
    ).catch(error => console.log("DATABASE MIGRATION ERROR", error));
    console.log("[DATABASE MIGRATION END]")
}


export async function dbClearTable(db: SQLite.SQLiteDatabase, name: string) {
    await db.runAsync(
      `DELETE FROM ${name};`,
      [name]
    ).catch(error => console.log("error dbClearTablError", name, error))
}


export async function dbClearDatabase(db: SQLite.SQLiteDatabase) {
    await db.runAsync('DELETE FROM manhwas;').catch(error => console.log("error dbClearDatabase manhwas", error))
    await db.runAsync('DELETE FROM chapters;').catch(error => console.log("error dbClearDatabase chapters", error))
    await db.runAsync('DELETE FROM genres;').catch(error => console.log("error dbClearDatabase genres", error))
    await db.runAsync('DELETE FROM app_releases;').catch(error => console.log("error dbClearDatabase app_releases", error))
    console.log("[DATABASE CLEARED]")
}


export async function dbListTables(db: SQLite.SQLiteDatabase) {
    const rows = await db.getAllAsync(`
        SELECT 
            name 
        FROM 
            sqlite_master 
        WHERE 
            type='table' AND name NOT LIKE 'sqlite_%';`
    ).catch(error => console.log("error dbListTables", error));

    if (rows) {
        rows.forEach(item => console.log(item))
    }
}


export async function dbReadlAll<T>(db: SQLite.SQLiteDatabase, name: string): Promise<T[]> {
    const rows = await db
        .getAllAsync(`SELECT * FROM ${name};`)
        .catch(error => console.log(`error dbReadlAll ${name}`, error));

    return rows ? rows as T[] : []  
}


export async function dbListTable(db: SQLite.SQLiteDatabase, name: string) {
    const rows = await db
        .getAllAsync(`SELECT * FROM ${name};`, [name])
        .catch(error => console.log(`error dbListTable ${name}`, error));

    if (rows) {
        rows.forEach(item => console.log(item))
    }
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

export async function dbShouldUpdate(db: SQLite.SQLiteDatabase, name: string): Promise<boolean> {
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
        console.log(`could not read updated_history of ${name}`)
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
        ).catch(error => console.log("error dbShouldUpdate update_historyerror", name, error));
        return true
    }

    return false
}


async function dbUpsertManhwas(db: SQLite.SQLiteDatabase, manhwas: Manhwa[]) {
  const placeholders = manhwas.map(() => '(?,?,?, ?,?,?, ?, ?)').join(',');  
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

async function dbUpsertReleases(db: SQLite.SQLiteDatabase, releases: AppRelease[]) {
  if (releases.length == 0) { return }
  const placeholders = releases.map(() => '(?,?,?,?,?)').join(',');
  const params = releases.flatMap(i => [
      i.release_id, 
      i.version, 
      i.url,
      i.descr,
      i.created_at
  ]);
  await db.runAsync(
    `
        INSERT OR REPLACE INTO app_releases (
            release_id, 
            version, 
            url,
            descr,
            created_at
        )
        VALUES ${placeholders};
    `, params
    ).catch(error => console.log("error dbUpsertReleases", error));
}

async function dbUpsertChapter(db: SQLite.SQLiteDatabase, chapters: Chapter[]) {
    const placeholders = chapters.map(() => '(?,?,?,?,?)').join(',');  
    const params = chapters.flatMap(i => [
        i.chapter_id, 
        i.manhwa_id, 
        i.chapter_num,
        i.created_at,
        i.chapter_name
    ]);
    await db.runAsync(
    `
        INSERT OR REPLACE INTO chapters (
            chapter_id, 
            manhwa_id, 
            chapter_num,
            created_at,
            chapter_name
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

export async function dbUpdateDatabase(db: SQLite.SQLiteDatabase) {
    console.log('[UPDATING DATABASE]')
    const start = Date.now()

    const manhwas: Manhwa[] = await spGetManhwas()

    if (manhwas.length == 0) { 
      return 
    }
    
    const releases: AppRelease[] = await spGetReleases()

    await dbClearDatabase(db)
    await dbUpsertManhwas(db, manhwas)    

    const chapters: Chapter[] = []
    const authors: Author[] = []
    const manhwaAuthors: ManhwaAuthor[] = []
    const genres: Genre[] = []
    const manhwaGenres: ManhwaGenre[] = []

    manhwas.forEach(i => {
        i.chapters.forEach(c => chapters.push(c)); 
        i.genres.forEach(g => {genres.push(g); manhwaGenres.push({...g, manhwa_id: i.manhwa_id})});
        i.authors.forEach(a => {authors.push(a); manhwaAuthors.push({...a, manhwa_id: i.manhwa_id})});    
    })
  
    await dbUpsertReleases(db, releases)
    await dbUpsertChapter(db, chapters)
    await dbUpsertGenres(db, genres)
    await dbUpsertManhwaGenres(db, manhwaGenres)
    await dbUpsertAuthors(db, authors)
    await dbUpsertManhwaAuthors(db, manhwaAuthors)

    const end = Date.now()
    console.log("[DATABASE UPDATED]", (end - start) / 1000)
}



export async function dbHasManhwas(db: SQLite.SQLiteDatabase): Promise<boolean> {
  const row = await db.getFirstAsync<{manga_id: number}>(
    `
      SELECT
        manhwa_id
      FROM
        manhwas
      LIMIT 1
      OFFSET 0;
    `    
  ).catch(error => console.log('dbHasManhwas', error)); 
  return row != null
}

export async function dbGetRandomManhwaId(db: SQLite.SQLiteDatabase): Promise<number | null> {
  const row = await db.getFirstAsync<{manhwa_id: number}>(
    'SELECT manhwa_id FROM manhwas ORDER BY RANDOM() LIMIT 1'
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
  const row = await db.getFirstAsync<{value: string}>(
    `
      SELECT
        value
      FROM
        app_info
      WHERE
        name = 'version';
    `    
  ).catch(error => console.log('dbGetAppVersion', error)); 

  return row!.value
}


export async function dbReadGenres(db: SQLite.SQLiteDatabase): Promise<Genre[]> {
  const rows = await db.getAllAsync(
    'SELECT * FROM genres ORDER BY genre;'    
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
        * 
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
        *
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


export async function dbSearchMangas(
  db: SQLite.SQLiteDatabase, 
  p_search_text: string,
  p_offset: number = 0,
  p_limit: number = 30
): Promise<Manhwa[]> {
  const rows = await db.getAllAsync(
    `
      SELECT 
        *
      FROM 
        manhwas
      WHERE 
        title LIKE ? COLLATE NOCASE
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


export async function dbReadManhwasByGenreName(
  db: SQLite.SQLiteDatabase,
  genre: string,
  p_offset: number = 0,
  p_limit: number = 30
): Promise<Manhwa[]> {
  const rows = await db.getAllAsync(
    `
      SELECT 
        m.*
      FROM 
        manhwas m
      JOIN 
        manhwa_genres mg ON m.manhwa_id = mg.manhwa_id
      JOIN 
        genres g ON mg.genre_id = g.genre_id
      WHERE 
        g.genre = ?
      ORDER BY 
        m.views DESC
      LIMIT ?
      OFFSET ?;
    `,
    [genre, p_limit, p_offset]
  ).catch(error => console.log("error dbReadManhwasByGenreName", genre, error));

  return rows ? rows as Manhwa[]  : []
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
        mg.manga_id = ?
      ORDER BY 
        g.genre;
    `,
    [manhwa_id]
  ).catch(error => console.log("error dbReadManhwaGenres", manhwa_id, error));

  return rows ? rows as Genre[] : []
}

