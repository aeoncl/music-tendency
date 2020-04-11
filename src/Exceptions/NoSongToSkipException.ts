export class NoSongToSkipException extends Error {
    constructor(message: string = "There is no song to skip") {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
        this.name = NoSongToSkipException.name; // stack traces display correctly now 
    }
    
}