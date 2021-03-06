const Discord = require("discord.js");
const config = require("./config.json");
const client = new Discord.Client();

const pathImports = {
    db: require(config.imports.db),
    log: require(config.imports.log)
};

let cmds = {};
for (let cmd in config.cmd)
    cmds[cmd] = require(config.cmd[cmd].path);

const log = new pathImports.log();
const DB = new pathImports.db(config.db, log);
const prefix = config.info.prefix;
DB.start()

client.login(config.sec.token);

client.on("message", (message) => {
    if (message.guild.id != config.info.active_server) return;

    if (message.author.bot) return;
    if (message.channel.type == "dm")
        return message.channel.send("Please use the guild chat.");
    if (message.content.indexOf(prefix) !== 0) return;

    let args = message.content.slice(prefix.length).split(/ +/g); // array of whitespace seperated
    let command = args.shift().toLowerCase();

    if (command == "ping")
        message.channel.send("Bot is alive");
    
    if (!config.cmd.hasOwnProperty(command)) return;
    
    // if user does not have roles for this command, return
    if (!message.member.roles.some(r => config.cmd[command].role.includes(r.id))) 
        return message.channel.send("You do not have the required roles for this command.");

    // restrict channel usage of commands
    if (!config.cmd[command].chan.includes(message.channel.id))
        return message.channel.send("This command is not usable in this channel.");
    
    let bot = {log, DB, config, client};
    cmds[command](message, args, bot);
})

/**
 * Commands: accept -> register -> verify
*/