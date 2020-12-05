export class BotPermissionError extends Error {
    constructor(message: string = "Missing permissions to join the voicechannel & play music") {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
        this.name = BotPermissionError.name; // stack traces display correctly now 
    }
    
}