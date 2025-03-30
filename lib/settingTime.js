import { promises as fs } from 'fs';
import param from '../param.json' assert { type: 'json'};
const filePath = param.filePath;

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

    let isExist = false;
    for(let i = 0; i < data.length; i++){
        const personalData = data[i];
        if(personalData.id == senderID){
            personalData.hour = inthour;
            personalData.minute = intminute;
            personalData.repeat = false;
            personalData.nexthour = inthour;
            personalData.nextminute = intminute;
            isExist = true;
            break;
        }
    }

    if(!isExist){
        const newData = {
            id: senderID,
            hour: inthour,
            minute: intminute,
            repeat: false,
            nexthour: inthour,
            nextminute: intminute,
            continuity: 0,
            messagedata: null,
        }

        data.push(newData);
    }

    // write data
    const writeData = JSON.stringify(data, null, 4);
    await fs.writeFile(filePath, writeData)

    // send message
    await messageid.edit(`Reminder set for ${hour}:${minute}`);
}