//const { Client, Events, GatewayIntentBits } = require('discord.js');
//const { token } = require('./config.json');
//const { settingTime } = require('./lib/settingTime.js');
//const { checkRemindTime } = require('./lib/checkRemindTime.js');
//const { buttonInteraction } = require('./lib/buttonInteraction.js');
import { Client, Events, GatewayIntentBits } from 'discord.js';
import config from './config.json' assert { type: 'json'};
import param from './param.json' assert { type: 'json'};
import { settingTime } from './lib/settingTime.js';
import { checkRemindTime } from './lib/checkRemindTime.js';
import { buttonInteraction } from './lib/buttonInteraction.js';
import { promises as fs } from 'fs';
const token = config.token;
const filePath = param.filePath;


// Create a new client instance
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
    ] 
});

client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});


//setting reminder time
const configMessage = "!setting"
client.on(Events.MessageCreate, async argmessage => {
    const message = argmessage.content;
    const senderID = argmessage.author.id;
    if(message.startsWith(configMessage)){
        const messageid = await argmessage.channel.send("processing...");
        settingTime(senderID, argmessage, messageid);
    }
});

//collecting button interaction
client.on(Events.InteractionCreate, async interaction => {
    interaction.deleteReply();
    buttonInteraction(interaction, client);
})

//55s
const interval = 1000 * 55;

//loop function
function loopActions(){
    checkRemindTime(client);
	setTimeout(loopActions, interval);
}

(async () => {
    await client.login(token);

    //if datafile not exist, create it.
    try{
        const fileContent = await fs.readFile(filePath, "utf8");

        //if file is empty, write empty array
        if(fileContent.length == 0){
            await fs.writeFile(filePath, "[]");
        }
    }catch(error){
        if(error.code === 'ENOENT'){
            //file not exist
            await fs.writeFile(filePath, "[]");
        }else{
            console.error("Error:\n", error);
        }
    }

    loopActions();
})();