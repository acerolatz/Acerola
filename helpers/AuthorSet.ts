import { Author } from "./types"


export class AuthorSet {
  
    private map = new Map<number, Author>()
    
    add(a: Author) {
        this.map.set(a.author_id, a)
    }
        
    values() {
        return [...this.map.values()]
    }
        
    size(): number {
        return this.map.size
    }
}