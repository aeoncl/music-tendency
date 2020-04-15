import { Instance } from "./Instance";
import { Command } from "./Command";
import { CommandType } from "./CommandType";
import { Song } from "./Song";
import { NoMusicFound } from "../Exceptions/NoMusicFoundError";
import { MessageSenderHelper } from "./MessageSenderHelper";
import { TextChannel, Message } from "discord.js";
import { YoutubeFileStreamProvider } from "./Providers/YoutubeFileStreamProvider";
import { SongResolver } from "./Adapter/SongResolver";
const ytpl = require('ytpl');
const ytdl = require('ytdl-core');

export class MusicTendency{

    private _instances = new Map<String, Instance>();
    private readonly _songResolver = new SongResolver();

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
                case CommandType.LEAVE:
                    this.Leave(command);
                    break;
                case CommandType.CLEAR:
                    this.Clear(command);
                    break;
                case CommandType.HELP:
                    MessageSenderHelper.PrintHelp(command.SenderChannel);
                    break;
                default:
                    break;
            }
    }

    private async Play(command : Command){
        let instance = this.GetInstanceForCommand(command);
        await instance.JoinVocal(command.TargetVoiceChannel);
        try {
            let listSongs = await this._songResolver.ResolveUri(command.CommandData[0], command);
            if(listSongs.length > 0){
                MessageSenderHelper.WriteSongsAdded(listSongs, command.SenderChannel as TextChannel);
                instance.AddSongs(listSongs);
            }else{
                throw new NoMusicFound();
            }
        }catch(e){
            throw new NoMusicFound();
        }
        
    }

    private Skip(command : Command){
        let instance = this.GetInstanceForCommand(command);
        try{
            instance.Skip();
            MessageSenderHelper.WriteSkip(command.SenderChannel as TextChannel);
        }catch(e){
            MessageSenderHelper.PrintError(e.message, command.SenderChannel as TextChannel);
        }
    }

    private Leave(command: Command) {
        let instance = this.GetInstanceForCommand(command);
        try{
            MessageSenderHelper.PrintLeave(command.SenderChannel as TextChannel);
            instance.Stop();
            instance.Close();
        }catch(e){
            MessageSenderHelper.PrintError(e, command.SenderChannel as TextChannel);
        }
    }

    private Stop(command: Command) {
        let instance = this.GetInstanceForCommand(command);
        try{
            instance.Stop();
            MessageSenderHelper.PrintStop(command.SenderChannel as TextChannel);
        }catch(e){
            MessageSenderHelper.PrintError(e, command.SenderChannel as TextChannel);
        }
    }

    private Clear(command: Command) {
        let instance = this.GetInstanceForCommand(command);
        try{
            instance.Clear();
            MessageSenderHelper.WriteClear(command.SenderChannel as TextChannel);
        }catch(e){
            MessageSenderHelper.PrintError(e, command.SenderChannel as TextChannel);
        }
    }
   
    private Queue(command: Command) {
        let instance = this.GetInstanceForCommand(command);
        let queue = instance.Queue;
        if(queue.length === 0){
            MessageSenderHelper.PrintError("The queue is currently empty", command.SenderChannel as TextChannel);
        }else{
            MessageSenderHelper.PrintQueue(queue, command.SenderChannel as TextChannel);
        }
    }

    private GetInstanceForCommand(command : Command){
        let instanceId = command.GuildId;
        if(!this._instances.has(instanceId)){
            let instance = new Instance();
            instance.on('closure', (a) => {
                this._instances.delete(a);
                console.log("Closure received");
            });
            this._instances.set(instanceId, instance);
        }
        return this._instances.get(instanceId);
    }
}