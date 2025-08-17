import { Genre } from "./types"


/**
 * Represents a collection of `Genre` objects, indexed by their unique `genre_id`.
 * Provides methods to add genres, retrieve all stored genres, and get the number of genres in the set.
 */
export class GenreSet {
  
    private map = new Map<number, Genre>()

    /**
     * Adds a `Genre` object to the set. 
     * If a genre with the same `genre_id` already exists, it will be replaced.
     * @param g - The `Genre` object to add.
     */
    add(g: Genre) {
        this.map.set(g.genre_id, g)
    }

    /**
     * Returns an array of all `Genre` objects currently in the set.
     * @returns An array of `Genre` objects.
     */
    values() {
        return [...this.map.values()]
    }

    /**
     * Returns the total number of `Genre` objects in the set.
     * @returns The number of genres.
     */
    size(): number {
        return this.map.size
    }
}