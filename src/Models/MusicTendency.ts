import { Instance } from "./Instance";
import { Command } from "./Command";
import { CommandType } from "./CommandType";
import { Song } from "./Song";
import { ParseCommandError } from "../Exceptions/ParseCommandError";
import { BotPermissionError } from "../Exceptions/BotPermissionsError";
import { InvalidYoutubeLink } from "../Exceptions/InvalidYoutubeLink";
import { MessageSenderHelper } from "./MessageSenderHelper";
import { TextChannel } from "discord.js";
const ytpl = require('ytpl');
const ytdl = require('ytdl-core');

export class MusicTendency{

    private _instances = new Map<String, Instance>();
    
    constructor() {
        
    }

    SendCommand(command : Command){
            switch(+command.CommandType){
                case CommandType.PLAY: 
                    this.Play(command).catch(err => MessageSenderHelper.PrintError(err.message, command.SenderChannel as TextChannel));
                    break;
                case CommandType.SKIP:
                    this.Skip(command);
                    break
                case CommandType.STOP:
                    this.Stop(command);
                    break;
                case CommandType.QUEUE:
                    this.Queue(command);
                    break
                case CommandType.CLEAR:
                    this.Clear(command);
                    break;
            }
    }
    Stop(command: Command) {
        let instance = this.GetInstanceForCommand(command);
        try{
            let stop = instance.Stop();
            MessageSenderHelper.PrintStop(command.SenderChannel as TextChannel);
        }catch(e){
            MessageSenderHelper.PrintError(e, command.SenderChannel as TextChannel);
        }
    }

    Clear(command: Command) {
        let instance = this.GetInstanceForCommand(command);
        try{
            let clearSuccess = instance.Clear();
            if(clearSuccess){
                MessageSenderHelper.WriteClear(command.SenderChannel as TextChannel);
            }
        }catch(e){
            MessageSenderHelper.PrintError(e, command.SenderChannel as TextChannel);
        }
    }
   
    Queue(command: Command) {
        let instance = this.GetInstanceForCommand(command);
        let queue = instance.Queue;
        if(queue.length === 0){
            MessageSenderHelper.PrintError("The queue is currently empty", command.SenderChannel as TextChannel);
        }else{
            MessageSenderHelper.PrintQueue(queue, command.SenderChannel as TextChannel);
        }
    }

    private async Play(command : Command){
        let url = command.GetCommandDataById(0);
        let instance = this.GetInstanceForCommand(command);
        
        try {
            let isPlaylist : boolean = ytpl.validateURL(url);
            if(isPlaylist){
                let playlistId = url?.match(/(.+list=)([^&]+)/)[2];
                const playlistInfo = await ytpl(playlistId);
                const playlistItems = playlistInfo['items'];

                for(let playlistItemId in playlistItems){
                    let item : { title: String; url_simple: String; } = playlistItems[playlistItemId];
                    let song = new Song(item.title, item.url_simple, command.Sender);
                    await instance.AddSong(song);
                    //MessageSenderHelper.WriteSongAdded(song.Title, song.Sender, command.SenderChannel as  TextChannel);
                }
            }else{
                let urlIsValid = ytdl.validateURL(url);
                if(!urlIsValid){
                    throw new InvalidYoutubeLink();
                }
                const songInfo = await ytdl.getInfo(url);
                await instance.AddSong(new Song(songInfo.title, songInfo.video_url, command.Sender));
                MessageSenderHelper.WriteSongAdded(songInfo.title, command.Sender, command.SenderChannel as  TextChannel);
            }
        }catch(e){
            throw new InvalidYoutubeLink();
        }
        
    }

    private Skip(command : Command){
        let instance = this.GetInstanceForCommand(command);
        try{
            let skipSuccess = instance.Skip();
            if(skipSuccess){
                MessageSenderHelper.WriteSkip(command.SenderChannel as TextChannel);
            }
        }catch(e){
            MessageSenderHelper.PrintError(e.message, command.SenderChannel as TextChannel);
        }
    }


    private GetInstanceForCommand(command : Command){
        let instanceId = command.TargetVoiceChannelId;
        if(!this._instances.has(instanceId)){
            let instance = new Instance(command.TargetVoiceChannel);
            instance.on('closure', (a) => {this._instances.delete(a)});
            this._instances.set(instanceId, instance);
        }
        return this._instances.get(instanceId);
    }
}