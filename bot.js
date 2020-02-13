const Discord = require('discord.js');
const cfg = require('./config.json');
const ytdl = require('ytdl-core');
const ytpl = require('ytpl');
const client = new Discord.Client;
const queue = new Map();
const token = process.env.BOT_TOKEN;

client.once('ready', () => { console.log('Ready'); });
client.once('reconnecting', () => { console.log('Reconnecting'); });
client.once('disconnect', () => { console.log('Disconnect'); });
client.on('debug', console.log);
client.on('message', async message => {

    if (message.author.bot) return;
    if (!message.content.startsWith(cfg.prefix)) return;

    const serverQueue = queue.get(message.guild.id);

    if (message.content.startsWith(`${cfg.prefix}play`)) {
        execute(message, serverQueue);
        return;
    } else if (message.content.startsWith(`${cfg.prefix}skip`)) {
        skip(message, serverQueue);
        return;
    } else if (message.content.startsWith(`${cfg.prefix}stop`)) {
        stop(message, serverQueue);
        return;
    } else if (message.content.startsWith(`${cfg.prefix}queue`)) {
        displayQueue(message, serverQueue);
        return;
    } else if (message.content.startsWith(`${cfg.prefix}clear`)) {
        clearQueue(message, serverQueue);
        return;
    }
});

async function execute(message, serverQueue) {
    
    var match = message.content.match(/(!play\s)(https:\/\/.+)/);
    var isPlaylist = ytpl.validateURL(match[2]);
    if (match === null) {
        return message.channel.send("Couldn't parse URL - check for extra whitespaces ¯\\_(ツ)_/¯");
    }

    const voiceChannel = message.member.voiceChannel;
    if (!voiceChannel) {
        return message.channel.send('You need to be in a voice channel to play music ¯\\_(ツ)_/¯');
    }

    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
        return message.channel.send('Missing permissions to join the voicechannel & play music ¯\\_(ツ)_/¯');
    }

    let playlistSongs = [];
    let song;
    if (isPlaylist) {
        let id = message.content.match(/(.+list=)([^&]+)/)[2];
        const playlistInfo = await ytpl(id);
        const playlistItems = playlistInfo['items'];
        playlistItems.forEach(item => playlistSongs.push({ title: item.title, url: item.url_simple }));
    } else {
        const songInfo = await ytdl.getInfo(match[2]);
        song = { title: songInfo.title, url: songInfo.video_url }
    }
    
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

        if (isPlaylist) { 
            playlistSongs.forEach(playlistSong => queueConstruct.songs.push(playlistSong));
            message.channel.send(`${playlistSongs.length} songs have been added to the queue ⏳`);
        } else { 
            queueConstruct.songs.push(song); 
        }

        try {

            var connection = await voiceChannel.join();
            
            voiceChannel.members.get(client.user.id).setDeaf(true);

            queueConstruct.connection = connection;
            play(message, queueConstruct.songs[0]);
        } catch (e) {
            console.log(e);
            queue.delete(message.guild.id);
            return message.channel.send(e);
        }
    } else {
        if (isPlaylist) {
            playlistSongs.forEach(playlistSong => serverQueue.songs.push(playlistSong));
            return message.channel.send(`${playlistSongs.length} songs have been added to the queue ⏳`);
        } else {
            serverQueue.songs.push(song);
            console.log(serverQueue.songs);
            return message.channel.send(`${song.title} has been added to the queue ⏳`);
        } 
    }
}

function play(message, song) {

    const serverQueue = queue.get(message.guild.id);
    if (!song) {

        client.user.setPresence({ game: { name: `🎵 Tendency` }, status: 'idle' });

        message.member.voiceChannel.leave();
        queue.delete(message.guild.id);
        return ; 
    }

    message.channel.send(`Now playing ${song.title} ▶`);

    client.user.setPresence({ game: { name: `🎵 ${song.title}` }, status: 'online' });

    let dlOptions = {quality: "highestaudio", filter: "audioonly"};
    let streamOptions = {bitrate: 256000};

    const dispatcher = serverQueue.connection.playStream(ytdl(song.url, dlOptions), streamOptions)
        .on('error', (error) => {
            console.error(error);
        })
        .on('end', () => { 
            console.log('Music ended');
            serverQueue.songs.shift();
            play(message, serverQueue.songs[0]);
        });
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 10);
}

function skip(message, serverQueue) {
    if (!serverQueue) return message.channel.send("There is no song to skip ¯\\_(ツ)_/¯");
    if (!message.member.voiceChannel) return message.channel.send('You have to be in a voice channel to skip a song ¯\\_(ツ)_/¯');
    serverQueue.connection.dispatcher.end();
    return message.channel.send("Skipped song ⏭");
}

function stop(message, serverQueue) {
    if (!serverQueue) return message.channel.send("There is no music to stop ¯\\_(ツ)_/¯");
    if (!message.member.voiceChannel) return message.channel.send('You have to be in a voice channel to stop the music ¯\\_(ツ)_/¯');
    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
    return message.channel.send("Stopped playing ⏹");
}

function displayQueue(message, serverQueue) {
    if (!serverQueue || serverQueue.songs.length == 0) return message.channel.send("The queue is currently empty ¯\\_(ツ)_/¯");
    if (!message.member.voiceChannel) return message.channel.send('You have to be in a voice channel to display the queue ¯\\_(ツ)_/¯');

    let queue = "Coming up next ⏳\n";
    queue += "--------------------------\n";
    for(var i = 0; i < 10 && serverQueue.songs[i]; ++i) {
        queue += (i == 0) ? "▶ " : (i+1)+") ";
        queue += serverQueue.songs[i].title+"\n";
    }
    let rest = serverQueue.songs.length - i;
    if (rest > 0) {
        queue += "--------------------------\n";
        queue += "... and "+rest+" more 🦀🎶";
    }
    return message.channel.send(queue);
}

function clearQueue(message, serverQueue) {
    if (!serverQueue || serverQueue.songs.length == 0) return message.channel.send("The queue is currently empty ¯\\_(ツ)_/¯");
    if (!message.member.voiceChannel) return message.channel.send('You have to be in a voice channel to clear the queue ¯\\_(ツ)_/¯');
    serverQueue.songs = [];
    return message.channel.send("Cleared the queue 🗑️");
}

client.login(token);