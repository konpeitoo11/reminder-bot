//const fs = require("fs").promises;
import { promises as fs } from 'fs';
//const fetch = require("node-fetch");
import fetch from 'node-fetch';
//const { filePath, timeurl } = require('../config.json');
import config from '../config.json' assert { type: 'json'};

//those interpretations is in the current directory (= reminder-bot/)
const filePath = config.filePath;
const timeurl = config.timeurl;

//module.exports.buttonInteraction = async function (interaction, client) {
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

    switch(interactionID){
        case "done":
            userData.messageid.delete();
            userData.continuity++;
            userData.repeat = false;
            userData.nexthour = userData.hour;
            userData.nextminute = userData.minute;
            interaction.reply(`Done! ${userData.continuity} consecutive days!`);
            break;
        case "later":
            userData.messageid.delete();

            //get current time
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
            }

            userData.nexthour = currentHour + 1;
            userData.nextminute = currentMinute;
            
            if(userData.nexthour > 23){
                userData.repeat = false;
                userData.nexthour = userData.hour;
                userData.nextminute = userData.minute;
                userData.continuity = 0;
                interaction.reply("Today, I won't remind you enymore.\nLet's do your best next day!");
            }
            else{
                userData.repeat = true;
                interaction.reply("I'll remind you after an hour.")
            }
            break;
        case "cancel":
            userData.messageid.delete();
            userData.repeat = false;
            userData.nexthour = userData.hour;
            userData.nextminute = userData.minute;
            userData.continuity = 0;
            interaction.reply("Let's do your best next day!");
            break;
    }

    // write data
    const writeData = JSON.stringify(data, null, 4);
    await fs.writeFile(filePath, writeData)
};