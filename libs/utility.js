// ROLE CONVERT
const roleIdToRoleName = (roleID) => {
    let role = ""
    switch (roleID) {
        case 0:
            role = "admin";
            break;
        case 1:
            role = "teacher";
            break;
        case 2:
            role = "student";
            break;
    }
    return role
}

// MD5
const md5 = require("md5");

// PATH
const path = require('path');

// CONFIG
const config = require(path.join(__dirname, '..','/config.json'))

// FILE UPLOAD
const uploadToServer = (itemID, file, folder) => {
    if (folder == "profile") {
        const fileEXT = file.name.split('.');
        const fileName = `${itemID}.${fileEXT[fileEXT.length - 1]}`;
        const filePath = (path.join(__dirname, "..", `public/assets/img/profile/${fileName}`));
        file.mv(filePath);
        return fileName
    }

    if (folder == "transactions") {
        const date = new Date();
        let fileEXT = file.name.split(".")
        let fileName = `${itemID}-${date.getDate()}-${date.getMonth()+1}-${date.getFullYear()}.${fileEXT[fileEXT.length - 1]}`;
        let filePath = (path.join(__dirname, "..", `/public/assets/img/transactions/${fileName}`));
        file.mv(filePath);
        return fileName
    }

    if (folder == "applicationForm") {
        const date = new Date();
        let fileEXT = file.name.split(".")
        let fileName = `${itemID}-${date.getDate()}-${date.getMonth()+1}-${date.getFullYear()}.${fileEXT[fileEXT.length - 1]}`;
        let filePath = (path.join(__dirname, "..", `/public/files/application/applicationForms/${fileName}`));
        file.mv(filePath);
        return fileName
    }

    if (folder == "activity") {
        const fileEXT = file.name.split('.');
        const fileName = `${itemID}.${fileEXT[fileEXT.length - 1]}`;
        const filePath = (path.join(__dirname, "..", `public/assets/img/activities/${fileName}`));
        file.mv(filePath);
        return fileName
    }

    if (folder == "achievement") {
        const fileEXT = file.name.split('.');
        const fileName = `${itemID}.${fileEXT[fileEXT.length - 1]}`;
        const filePath = (path.join(__dirname, "..", `public/assets/img/achievements/${fileName}`));
        file.mv(filePath);
        return fileName
    }
}

// time subtract mtf
const timeSubtract = (timeStart, timeEnd) => {
    const timeStartSplit = timeStart.split(':');
    const timeEndtSplit = timeEnd.split(':');
    
    let secTimestart = 0;
    let secTimeEnd = 0;

    let secMulti = 3600;
    timeStartSplit.forEach(unit => {
        secTimestart += parseInt(unit) * secMulti;
        secMulti = secMulti/60
    })

    secMulti = 3600;
    timeEndtSplit.forEach(unit => {
        secTimeEnd += parseInt(unit) * secMulti;
        secMulti = secMulti/60
    })

    return secTimeEnd - secTimestart
}

// TIME FORMAT
const timeFormatFromSec = (sec) => {
    hours = Math.floor(sec/3600);
    minutes = Math.floor((sec % 3600) / 60);
    sec = Math.floor((sec % 3600) % 60);

    return {
        hours: hours,
        minutes: minutes,
        sec: sec
    }
}

// GLOBAL VARIABLES
global.roleIdToRoleName = roleIdToRoleName
global.md5 = md5
global.path = path
global.config = config
global.uploadToServer = uploadToServer
global.timeSubtract = timeSubtract
global.timeFormatFromSec = timeFormatFromSec