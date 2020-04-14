import { TextChannel, DMChannel } from "discord.js";
import { Song } from "./Song";
import { stringify } from "querystring";
const fs = require("fs");

export class MessageSenderHelper{

    static readonly header : string = fs.readFileSync("././assets/ascii/header.txt", "ascii");
    static readonly help : string = fs.readFileSync("././assets/ascii/help.txt", "utf8");

    static PrintStop(channel: TextChannel) {
        channel.send(`⏹ Stopped playing.`);
    }

    static PrintLeave(channel: TextChannel) {
        channel.send(`See you next time.`);
    }
    
    static PrintQueue(queue: Song[], channel: TextChannel) {
        let totalSeconds = 0;
        let queueOut = "Coming up next ⏳\n";
        queueOut += "--------------------------\n";
        let count = 0;
        queue.forEach((song) => {
            if(count <= 10){
                queueOut += `${song.Title} added by ${song.sender}\n`;
            }
            totalSeconds += this.GetNbrSecondsFromString(song.duration);
            count++;
        });
        queueOut += "--------------------------\n";
        queueOut += "... and counting 🦀🎶";
      //  queueOut += `The playlist will last ${this.SecondsToString(totalSeconds)}`;
        channel.send(queueOut);
    }
    
    static WriteClear(channel: TextChannel) {
        channel.send(`🗑️ All clear.`);
    }

    static WriteSkip(channel: TextChannel) {
        channel.send(`⏭ Skip song.`);
    }

    static WriteSongsAdded(playlist : any, sender: String,  channel: TextChannel){
        const songs : {duration: string, title: string}[] = playlist.items;
        let sortie = "";
        let totalSeconds = 0;
        songs.forEach((song : any) => {
             sortie += `⏳ *${song.title}* has been added to the queue by ${sender}.\n`
             totalSeconds = this.GetNbrSecondsFromString(song.duration);
        });
        //sortie += `Your playlist lasts ${this.SecondsToString(totalSeconds)}`;
        channel.send(sortie);
    }

    private static GetNbrSecondsFromString(duration: String){
        let totalSeconds = 0;
        let durationArray = duration.split(":");
        totalSeconds += Number.parseInt(durationArray[0]) * 60;
        totalSeconds += Number.parseInt(durationArray[1]);
        return totalSeconds;
    }

    private static SecondsToString(seconds: number){
        let remainingSeconds = seconds;
        let hours = (remainingSeconds/3600);
        remainingSeconds = remainingSeconds - (hours*3600);
        let minutes = remainingSeconds/60;
        remainingSeconds = remainingSeconds - (minutes*60);
        let secondes = remainingSeconds;
        return hours===0?`${this.padDigits(minutes,2)}:${this.padDigits(secondes,2)}`:`${this.padDigits(hours,2)}H ${this.padDigits(minutes,2)}:${this.padDigits(secondes,2)}`
    }


    private static padDigits(nbr : number, digits : number) {
        return Array(Math.max(digits - String(nbr).length + 1, 0)).join('0') + nbr;
    }

    static WriteSongAdded(title: String, sender: String, channel: TextChannel) {
        channel.send(`⏳ *${title}* has been added to the queue by ${sender}.`);
    }

    static PrintError(message : String, channel : TextChannel){
        channel.send(`${message} ¯\\_(ツ)_/¯`);
    }

    static PrintHelp(channel: TextChannel | DMChannel){
        channel.send(`\`\`\`${this.header}\`\`\``);
        channel.send(this.help);
    }

}