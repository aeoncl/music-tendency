import { TextChannel } from "discord.js";

export class MessageSenderHelper{

    static PrintError(message : String, channel : TextChannel){
        channel.send(`${message} ¯\\_(ツ)_/¯`);
    }

}