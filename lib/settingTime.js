//const fs = require('fs').promises;
import { promises as fs } from 'fs';
//const { filePath } = require('../config.json');
import config from '../config.json' assert { type: 'json'};
const filePath = config.filePath;

//module.exports.settingTime = async function (senderID, message, messageid) {
export const settingTime = async function (senderID, message, messageid) {
    let data;
    try{
        const readData = await fs.readFile(filePath, "utf8");
        data = JSON.parse(readData);
    }catch(error){
        console.error("Error:\n", error);
        return;
    }

    const [_, hour, minute] = message.content.split(/[\s:]+/);
    const inthour = parseInt(hour, 10);
    const intminute = parseInt(minute, 10);
    if(inthour < 0 || inthour > 23 || intminute < 0 || intminute > 59){
        await messageid.edit("Invalid time format. Please use !setting HH:MM");
        return;
    }
    const newData = {
        id: senderID,
        hour: inthour,
        minute: intminute,
        repeat: false,
        nexthour: inthour,
        nextminute: intminute,
        continuity: 0,
        messageid: null,
    }

    data.push(newData);

    // write data
    const writeData = JSON.stringify(data, null, 4);
    await fs.writeFile(filePath, writeData)

    // send message
    await messageid.edit(`Reminder set for ${hour}:${minute}`);
}