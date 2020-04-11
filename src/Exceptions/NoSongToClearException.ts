export class NoSongToClearException extends Error {
    constructor(message: string = "The queue is empty") {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
        this.name = NoSongToClearException.name; // stack traces display correctly now 
    }
    
}