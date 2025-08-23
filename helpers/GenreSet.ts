import { Genre } from "./types"


export class GenreSet {
  
    private map = new Map<number, Genre>()
    
    add(g: Genre) {
        this.map.set(g.genre_id, g)
    }
    
    values() {
        return [...this.map.values()]
    }

    size(): number {
        return this.map.size
    }
}