import {Client, TextChannel} from "discord.js";
import { prefix } from "./config.json";
import {Command} from "./Models/Command";
import {MusicTendency} from "./Models/MusicTendency"
import { CommandType } from "./Models/CommandType";
import { SenderNotInVoiceChannelError } from "./Exceptions/SenderNotInVoiceChannelError";
import { BotPermissionError } from "./Exceptions/BotPermissionsError";
import { MessageSenderHelper } from "./Models/MessageSenderHelper";
import "./Env/env";

const token = process.env.BOT_TOKEN;
const client = new Client();
const musicTendency = new MusicTendency();

client.once('ready', () => { console.log('Ready'); });
client.once('disconnect', () => { console.log('Disconnect'); });
client.on('debug', console.log);

//client.user.setPresence({ game: { name: `🎵 Battle Tendency` } , status: 'online' } as PresenceData);


client.on('message', async message => {

    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;
    const voiceChannel = message.member?.voice?.channel;

    try{
        let command = new Command(message.content, message.author.username, message.channel as TextChannel, voiceChannel, message.guild?.id);

        if(command.CommandType === CommandType.NONE){
            return;
        }

        if(command.CommandType < CommandType.HELP && !voiceChannel){
            throw new SenderNotInVoiceChannelError();
        }

        if(command.CommandType === CommandType.PLAY){
            const permissions = voiceChannel.permissionsFor(message.client.user);
            if(!permissions.has('CONNECT') || !permissions.has('SPEAK')){
                throw new BotPermissionError();
            }
        }

        musicTendency.SendCommand(command);
    }catch(e){
        MessageSenderHelper.PrintError(e.message, message.channel as TextChannel);
        return;
    }
   
});


client.login(token);

