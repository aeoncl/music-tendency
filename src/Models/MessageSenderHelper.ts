import { TextChannel, DMChannel, MessageEmbed } from "discord.js";
import { Song } from "./Song";
import { stringify } from "querystring";
const fs = require("fs");

export class MessageSenderHelper{


    static readonly header : string = fs.readFileSync("././assets/ascii/header.txt", "ascii");
    static readonly help : string = fs.readFileSync("././assets/ascii/help.txt", "utf8");

    static PrintStop(channel: TextChannel) {
        let embed = new MessageEmbed()
        .setColor('#6300aa')
        .setDescription("⏹ Stopped playing.");
        channel.send(embed);
    }

    static PrintNowPlaying(song : Song){
        let embed = new MessageEmbed()
        .setColor('#6300aa')
        .setTitle(song?.title)
        .setURL(song.Uri as string)
        .setAuthor("▶  Now Playing" , "https://i.imgur.com/l0hxro3.png" , song.Uri as string)
        .setThumbnail(song.Thumbnail as string)
        .addFields([
            { name: 'Duration', value: song.DurationAsString, inline: true },
            { name: 'Added by', value: `${song.Sender}`, inline: true }
        ])
        .setFooter('Music Tendency', "https://i.imgur.com/l0hxro3.png")
        .setTimestamp(new Date());
        song.TargetTextChannel.send(embed);
    }

    static PrintLeave(channel: TextChannel) {
        let embed = new MessageEmbed()
        .setColor('#6300aa')
        .setDescription("See you next time.");
        channel.send(embed);
    }

    static async WriteSpotify(channel: TextChannel) {
        let embed = new MessageEmbed()
        .setColor('#6300aa')
        .setDescription("Bip boup. Please wait while i'm automagically taking your songs from Spotify. 🧙🏻‍♂️🌟")
        .setImage("https://media0.giphy.com/media/QyWBTLDn9WHt0FXGJS/giphy.gif");
        let msg = await channel.send(embed);
        return msg;
    }
    
    static PrintQueue(queue: Song[], channel: TextChannel) {


        let embed = new MessageEmbed()
        .setColor('#6300aa')
        .setAuthor("Coming up next" , "https://i.imgur.com/l0hxro3.png")
        .setFooter('Music Tendency', "https://i.imgur.com/l0hxro3.png")
        .setTimestamp(new Date());

        let totalSeconds = 0;
        let description = "";
        for(let i = 0; i<queue.length;i+=1){
            let song = queue[i];

            if(i<15){
                description+= `${i+1}. ${song.Title.substr(0,70)}\n`;
            }
            totalSeconds += song.Duration;

        }

        description+= "... and counting 🦀🎶\n";

        embed.setDescription(description);
        embed.addFields([
            { name: 'Song Count', value: queue.length, inline: true },
            { name: 'Total time', value: this.GetDurationAsString(totalSeconds), inline: true}
        ]);
        //queueOut += "--------------------------\n";
        //queueOut += "... and counting 🦀🎶";
      //  queueOut += `The playlist will last ${this.SecondsToString(totalSeconds)}`;
        return channel.send(embed);
    }
    
    static WriteClear(channel: TextChannel) {
        let embed = new MessageEmbed()
        .setColor('#6300aa')
        .setDescription("🗑️ All clear.");
        channel.send(embed);
    }

    static WriteSkip(channel: TextChannel) {
        let embed = new MessageEmbed()
        .setColor('#6300aa')
        .setDescription("⏭ Skip song.");
        channel.send(embed);
    }

    static WriteSongAdded(channel: TextChannel) {
        let embed = new MessageEmbed()
        .setColor('#6300aa')
        .setDescription(`Stuff added to the queue`);
        channel.send(embed);
    }

    static PrintError(message : String, channel : TextChannel){
        let embed = new MessageEmbed()
        .setColor('#fc051d')
        .setDescription(`${message} ¯\\_(ツ)_/¯`);
        channel.send(embed);
    }

    static PrintHelp(channel: TextChannel | DMChannel){
        //channel.send(`\`\`\`${this.header}\`\`\``);
        let embed = new MessageEmbed()
        .setColor('#6300aa')
        .setDescription(`${this.help}`);
        channel.send(embed);
    }


    static GetDurationAsString(durationInSeconds : number){
        let date = new Date(0);
        let remaningSeconds = durationInSeconds;
        date.setHours(remaningSeconds/3600);
        remaningSeconds -= date.getHours() * 3600;
        date.setMinutes(remaningSeconds/60);
        remaningSeconds -= date.getMinutes() * 60;
        date.setSeconds(remaningSeconds);
        let timeString = date.toISOString().substr(11, 8);
        return timeString;
    }

}