import { promises as fs } from 'fs';
import { ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import param from '../param.json' assert { type: 'json' };
const filePath = param.filePath;
const remindMessage = "Time!"
let hour = 0;
let minute = 0;


//module.exports.checkRemindTime = async function (client) {
export const checkRemindTime = async function (client) {
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

    if(minute == currentMinute)return;
    // time update
    hour = currentHour;
    minute = currentMinute;

    let data;
    try{
        const readData = await fs.readFile(filePath, "utf8");
        data = JSON.parse(readData);
    }catch(error){
        console.error("Error:\n", error);
        return;
    }

    for(let i = 0; i < data.length; i++){
        const personalData = data[i];
        const recipient = await client.users.fetch(personalData.id);
        if(personalData.hour == hour && personalData.minute == minute){
            const message = await recipient.send({content: remindMessage, components: [row]});
            personalData.messagedata = {channelId: message.channelId, id: message.id}
        }else if(personalData.repeat == true && personalData.nexthour == hour && personalData.nextminute == minute){
            const message = await recipient.send({content: remindMessage, components: [row]});
            personalData.messagedata = {channelId: message.channelId, id: message.id}
        }
    }

    // write data
    const writeData = JSON.stringify(data, null, 4);
    await fs.writeFile(filePath, writeData)
}

const done = new ButtonBuilder()
			.setCustomId('done')
			.setLabel('Done!')
			.setStyle(ButtonStyle.Success);
const later = new ButtonBuilder()
            .setCustomId('later')
            .setLabel('Later')
            .setStyle(ButtonStyle.Secondary);
const cancel = new ButtonBuilder()
            .setCustomId('cancel')
            .setLabel('Cancel')
            .setStyle(ButtonStyle.Danger);
const row = new ActionRowBuilder()
            .addComponents(done, later, cancel);