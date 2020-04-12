import { TextChannel, Channel } from "discord.js";
import { Song } from "./Song";

export class MessageSenderHelper{

    static PrintStop(channel: TextChannel) {
        channel.send(`⏹ Stopped playing.`);
    }

    static PrintLeave(channel: TextChannel) {
        channel.send(`See you next time.`);
    }
    
    static PrintQueue(queue: Song[], channel: TextChannel) {
        let queueOut = "Coming up next ⏳\n";
        queueOut += "--------------------------\n";
        let count = 0;
        queue.forEach((song) => {
            if(count === 10){
                return;
            }
            queueOut += `${song.Title} added by ${song.sender}\n`;
            count++;
        });
        queueOut += "--------------------------\n";
        queueOut += "... and counting 🦀🎶";
        channel.send(queueOut);
    }
    
    static WriteClear(channel: TextChannel) {
        channel.send(`🗑️ All clear.`);
    }

    static WriteSkip(channel: TextChannel) {
        channel.send(`⏭ Skip song.`);
    }


    static WriteSongAdded(title: String, sender: String, channel: TextChannel) {
        channel.send(`⏳ *${title}* has been added to the queue by ${sender}.`);
    }

    static PrintError(message : String, channel : TextChannel){
        channel.send(`${message} ¯\\_(ツ)_/¯`);
    }

}