import { Author } from "./types"


/**
 * Represents a collection of `Author` objects, indexed by their unique `author_id`.
 * Provides methods to add authors, retrieve all stored authors, and get the number of authors in the set.
 */
export class AuthorSet {
  
    private map = new Map<number, Author>()

    /**
     * Adds an `Author` object to the set.
     * If an author with the same `author_id` already exists, it will be replaced.
     * @param a - The `Author` object to add.
     */
    add(a: Author) {
        this.map.set(a.author_id, a)
    }
    
    /**
     * Returns an array of all `Author` objects currently in the set.
     * @returns An array of `Author` objects.
     */
    values() {
        return [...this.map.values()]
    }
    
    /**
     * Returns the total number of `Author` objects in the set.
     * @returns The number of authors.
     */
    size(): number {
        return this.map.size
    }
}