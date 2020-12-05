import { prefix } from "../config.json";
import { CommandType } from "./CommandType";
import { VoiceChannel, TextChannel, DMChannel } from "discord.js";

/*
Represents a music tendency command
*/
export class Command{
    
    private static readonly aliases : Map<String, String[]> = new Map<String, String[]>();

    private readonly _commands = [new RegExp(`${prefix}(play)\\s(.*)`), 
    new RegExp(`${prefix}(skip)`), 
    new RegExp(`${prefix}(stop)`), 
    new RegExp(`${prefix}(queue)`),
    new RegExp(`${prefix}(clear)`),
    new RegExp(`${prefix}(leave)`),
    new RegExp(`${prefix}(replay)`),
    new RegExp(`${prefix}(help)`)];
    
    private _commandType: CommandType = CommandType.NONE;
    private _commandData : Array<String> = new Array<String>();
    private _sender : String = "";
    private _senderChannel : TextChannel | DMChannel;
    private _guildId : String;
    private _voiceChannel? : VoiceChannel;


    constructor(message : String, sender: String, senderChannel: TextChannel | DMChannel, targetVoiceChannel : VoiceChannel, guildId: string){
        this._senderChannel = senderChannel;
        this._sender = sender;
        this._voiceChannel = targetVoiceChannel;
        this._guildId= guildId;
        this.TryParseCommand(message.trim());
    }

    get CommandType() : CommandType {
        return this._commandType;
    }

    get CommandData() : Array<String>{
        return this._commandData;
    }

    get SenderChannel() {
        return this._senderChannel;
    }

    get Sender(){
        return this._sender;
    }

    get TargetVoiceChannel(){
        return this._voiceChannel;
    }

    get TargetVoiceChannelId(){
        return this._voiceChannel?.id;
    }

    get GuildId(){
        return this._guildId;
    }

    GetCommandDataById(id : number) : String{
        return this.CommandData[id];
    }

    private TryParseCommand(message : String){
        for(const regexIndex in this._commands){
            const commandRegEx = this._commands[regexIndex];
            let matches = message.match(commandRegEx);
            if(matches !== null){
                this._commandType = (<any>CommandType)[matches[1].toUpperCase()];
                matches.splice(0,2);
                matches.forEach((string) => this._commandData.push(string));
                break;
            }
        }
    }

    private GetAlias(message: String){
    }
    

}