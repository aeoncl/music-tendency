import { Instance } from "./Instance";
import { Command } from "./Command";
import { CommandType } from "./CommandType";
import { Song } from "./Song";
import { ParseCommandError } from "../Exceptions/ParseCommandError";
import { BotPermissionError } from "../Exceptions/BotPermissionsError";
import { InvalidYoutubeLink } from "../Exceptions/InvalidYoutubeLink";
const ytpl = require('ytpl');
const ytdl = require('ytdl-core');

export class MusicTendency{

    private _instances = new Map<String, Instance>();
    
    constructor() {
        
    }

    SendCommand(command : Command){
        try{
            switch(command.CommandType){
                case CommandType.PLAY: 
                    this.Play(command);
                    break;
                case CommandType.CLEAR:
                    break;
            }
        }catch(e){
            throw new InvalidYoutubeLink();
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
                playlistItems.forEach((item: { title: String; url_simple: String; })  => {
                    instance.AddSong(new Song(item.title, item.url_simple, command.Sender))
                });
            }else{
                let urlIsValid = ytdl.validateURL(url);
                if(!urlIsValid){
                    throw new InvalidYoutubeLink();
                }
                //const songInfo = await ytdl.getInfo(url);
                //instance.AddSong(new Song(songInfo.title, songInfo.video_url, command.Sender));
                //TODO
                instance.AddSong(new Song("Title", url, command.Sender));
            }
        }catch(e){
            throw new InvalidYoutubeLink();
        }
        
    }

    private GetInstanceForCommand(command : Command){
        let instanceId = command.TargetVoiceChannelId;
        if(!this._instances.has(instanceId)){
            this._instances.set(instanceId, new Instance(command.TargetVoiceChannel));
        }

        return this._instances.get(instanceId);
    }

    
}