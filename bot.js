const Discord = require('discord.js');
const cfg = require('./config.json');
const ytdl = require('ytdl-core');
const client = new Discord.Client;
const queue = new Map();
const token = process.env.BOT_TOKEN;

client.once('ready', () => { console.log('Ready'); });
client.once('reconnecting', () => { console.log('Reconnecting'); });
client.once('disconnect', () => { console.log('Disconnect'); });

client.on('message', async message => {

    if (message.author.bot) return;
    if (!message.content.startsWith(cfg.prefix)) return;

    const serverQueue = queue.get(message.guild.id);

    if (message.content.startsWith(`${cfg.prefix}play`)) {
        execute(message, serverQueue);
    } else if (message.content.startsWith(`${cfg.prefix}skip`)) {
        skip(message, serverQueue);
    } else if (message.content.startsWith(`${cfg.prefix}stop`) || message.content.startsWith(`${cfg.prefix}leave`)) {
        stop(message, serverQueue);
        return;
    } else {
        message.channel.send('Invalid command');
    }
});

async function execute(message, serverQueue) {
    
    var match = message.content.match(/(!play\s)([^\s].+)/);
    if (match === null) {
        return message.channel.send("Couldn't parse URL - check for extra whitespaces");
    }

    const voiceChannel = message.member.voiceChannel;
    if (!voiceChannel) {
        return message.channel.send('You need to be in a voice channel to play music');
    }

    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
        return message.channel.send('Missing permissions to join the voicechannel & play music');
    }

    const songInfo = await ytdl.getInfo(match[2]);
    const song = { title: songInfo.title, url: songInfo.video_url }

    if (!serverQueue) {

        const queueConstruct = {
            textChannel: message.channel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
            volume: 5,
            playing: true
        };

        queue.set(message.guild.id, queueConstruct);
        queueConstruct.songs.push(song);

        try {
            var connection = await voiceChannel.join();
            queueConstruct.connection = connection;
            play(message, queueConstruct.songs[0]);
        } catch (e) {
            console.log(e);
            queue.delete(message.guild.id);
            return message.channel.send(e);
        }
    } else {
        serverQueue.songs.push(song);
        console.log(serverQueue.songs);
        return message.channel.send(`${song.title} has been added to the queue ⏳`);
    }
}

function play(message, song) {

    const serverQueue = queue.get(message.guild.id);
    if (!song) {
        message.member.voiceChannel.leave();
        queue.delete(message.guild.id);
        return ; 
    }
    message.channel.send(`Now playing ${song.title} ▶`);

    const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
        .on('end', () => { 
            console.log('Music ended');
            serverQueue.songs.shift();
            play(message, serverQueue.songs[0]);
        })
        .on('error', (error) => {
            console.error(error);
        });
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 10);
}

function skip(message, serverQueue) {
    if (!message.member.voiceChannel) return message.channel.send('You have to be in a voice channel to skip a song');
    if (!serverQueue) return message.channel.send('There is no song to skip');
    serverQueue.connection.dispatcher.end();
    return message.channel.send("Skipped song ⏭");
}

function stop(message, serverQueue) {
    if (!message.member.voiceChannel) return message.channel.send('You have to be in a voice channel to stop the music');
    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
    return message.channel.send("Stopped playing ⏹");
}

client.login(token);
