export class NoMusicFound extends Error {
    constructor(message: string = "I found nothing John Snow.") {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
        this.name = NoMusicFound.name; // stack traces display correctly now 
    }
    
}