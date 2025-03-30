//const fetch = require("node-fetch");
import fetch from 'node-fetch';
//const fs = require("fs").promises;
import { promises as fs } from 'fs';
//const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
import { ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';

//const { filePath, timeurl } = require('../config.json');
import config from '../config.json' assert { type: 'json' };
const filePath = config.filePath;
const timeurl = config.timeurl;
const remindMessage = "Time!"
let hour = 0;
let minute = 0;

//module.exports.checkRemindTime = async function (client) {
export const checkRemindTime = async function (client) {

    let currentHour;
    let currentMinute;
    try{
        const response = await fetch(timeurl);
        if(!response.ok) {
            // This message is not immediately displayed. This message will be displayed in the console.error().
            throw new Error(`cannot fetch current time. status: ${response.status}`);//goto catch(error)
        }
        const timeData = await response.json();
        currentHour = timeData.hour;
        currentMinute = timeData.minute;
    }catch(error){
        console.error("Error:\n", error);
        return;
    }
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
            const messageid = recipient.send({content: remindMessage, components: [row]});
            personalData.messageid = messageid;
        }else if(personalData.repeat == true && personalData.nexthour == hour && personalData.nextminute == minute){
            const messageid = recipient.send({content: remindMessage, components: [row]});
            personalData.messageid = messageid;
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