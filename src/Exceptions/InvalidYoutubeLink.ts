export class InvalidYoutubeLink extends Error {
    constructor(message: string = "Unable to parse youtube link. Thank u, next.") {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
        this.name = InvalidYoutubeLink.name; // stack traces display correctly now 
    }
    
}