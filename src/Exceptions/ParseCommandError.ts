export class ParseCommandError extends Error {
    constructor(message: string = "Couldn't parse URL - check for extra whitespaces") {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
        this.name = ParseCommandError.name; // stack traces display correctly now 
    }
    
}