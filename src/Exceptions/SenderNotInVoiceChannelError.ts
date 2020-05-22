export class SenderNotInVoiceChannelError extends Error {
    constructor(message: string = "You need to be in a voice channel to play music") {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
        this.name = SenderNotInVoiceChannelError.name; // stack traces display correctly now 
    }
    
}