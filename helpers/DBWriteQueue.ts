import { SQLiteDatabase } from "expo-sqlite"
import { WriteTask } from "./types"


/**
 * Manages a queue of database write operations to ensure that writes are executed sequentially.
 * Each task is a `WriteTask` (an async function) that will be run in order.
 */
class DbWriteQueue {
  private queue: WriteTask[] = []
  private running = false

  /**
   * Adds a write task to the queue and executes it when previous tasks have completed.
   * Returns a promise that resolves when the task completes successfully, or rejects if the task fails.
   * @param task - An async function representing a database write operation.
   * @returns A promise that resolves when the task finishes.
   */
  enqueue(task: WriteTask) {
    return new Promise<void>((resolve, reject) => {
      const wrapped: WriteTask = async () => {
        try {
          await task()
          resolve()
        } catch (err) {
          reject(err)
        } finally {
          this.running = false
          this.runNext()
        }
      }
      this.queue.push(wrapped)
      if (!this.running) {
        this.runNext()
      }
    })
  }

  /**
   * Executes the next task in the queue, if any, and marks the queue as running.
   * This method is called internally after a task finishes.
   */
  private runNext() {
    const next = this.queue.shift()
    if (next) {
      this.running = true
      next()
    }
  }
}


const dbWriteQueue = new DbWriteQueue()

/**
 * Executes batch inserts/updates with automatic chunking and a write queue
 * @param db - instance of SQLiteDatabase
 * @param table - name of the table
 * @param columns - array of column names
 * @param valuesArray - array of objects {col: value} to insert
 * @param conflictTarget - column(s) for ON CONFLICT
 */
export async function dbWriteBatch(
  db: SQLiteDatabase,
  table: string,
  columns: string[],
  valuesArray: Record<string, any>[],
  conflictTarget?: string | string[]
) {
  if (valuesArray.length === 0) return

  const MAX_PARAMS = 900
  const chunkSize = Math.floor(MAX_PARAMS / columns.length)

  await dbWriteQueue.enqueue(async () => {
    for (let i = 0; i < valuesArray.length; i += chunkSize) {
      const chunk = valuesArray.slice(i, i + chunkSize)
      const placeholders = chunk.map(() => `(${columns.map(() => '?').join(',')})`).join(',')
      const params = chunk.flatMap(obj => columns.map(col => obj[col]))

      let conflictClause = ''
      if (conflictTarget) {
        const target = Array.isArray(conflictTarget) ? conflictTarget.join(',') : conflictTarget
        const updates = columns.filter(c => !Array.isArray(conflictTarget) || !conflictTarget.includes(c))
          .map(c => `${c}=excluded.${c}`)
          .join(',')
        conflictClause = `ON CONFLICT(${target}) DO UPDATE SET ${updates}`
      }

      await db.execAsync('BEGIN TRANSACTION')
      try {
        const sql = `INSERT INTO ${table} (${columns.join(',')}) VALUES ${placeholders} ${conflictClause};`
        await db.runAsync(sql, params)
        await db.execAsync('COMMIT')
      } catch (err) {
        await db.execAsync('ROLLBACK')
        console.error(`dbWriteBatch error in table ${table}`, err)
        throw err
      }
    }
  })
}