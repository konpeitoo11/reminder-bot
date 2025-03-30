import { promises as fs } from 'fs';
import param from '../param.json' assert { type: 'json'};

//those interpretations is in the current directory (= reminder-bot/)
const filePath = param.filePath;

export const buttonInteraction = async function (interaction, client) {
    // read data
    let data;
    try{
        const readData = await fs.readFile(filePath, "utf8");
        data = JSON.parse(readData);
    }catch(error){
        console.error("Error:\n", error);
        return;
    }

    //analyze interaction
    const userID = interaction.user.id;
    const interactionID = interaction.customId;
    const userData = data.find(user => user.id == userID);
    // fetch channel
    const channel = await client.channels.fetch(userData.messagedata.channelId);
    // fetch message
    const messageToDelete = await channel.messages.fetch(userData.messagedata.id);
    // delete message
    await messageToDelete.delete();

    switch(interactionID){
        case "done":
            userData.continuity++;
            userData.repeat = false;
            userData.nexthour = userData.hour;
            userData.nextminute = userData.minute;
            interaction.editReply(`Done! ${userData.continuity} consecutive days!`);
            break;
        case "later":
            // get current time
            const now = new Date();
            const options = {
                timeZone: 'Asia/Tokyo',
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
            };
            const tokyoTime = new Intl.DateTimeFormat('ja-JP', options).format(now);
            const [currentHour, currentMinute] = tokyoTime.split(':').map(Number);

            userData.nexthour = currentHour + 1;
            userData.nextminute = currentMinute;
            
            if(userData.nexthour > 23){
                userData.repeat = false;
                userData.nexthour = userData.hour;
                userData.nextminute = userData.minute;
                userData.continuity = 0;
                interaction.editReply("Today, I won't remind you enymore.\nLet's do your best next day!");
            }
            else{
                userData.repeat = true;
                interaction.editReply("I'll remind you after an hour.")
            }
            break;
        case "cancel":
            userData.repeat = false;
            userData.nexthour = userData.hour;
            userData.nextminute = userData.minute;
            userData.continuity = 0;
            interaction.editReply("Let's do your best next day!");
            break;
    }

    // write data
    const writeData = JSON.stringify(data, null, 4);
    await fs.writeFile(filePath, writeData)
};