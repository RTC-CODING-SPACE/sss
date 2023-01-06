const path = require('path');
const md5 = require('md5');
const mysql = require('mysql');
const config = require(path.join(__dirname, '..','/config.json'))
const util = require('util')
require('./utility');

// CONNECT MYSQL
const db = mysql.createConnection({
    host: config.database.host,
    user: config.database.username,
    password: config.database.password,
    database: config.database.databaseName
});

// MYSQL ERROR
db.connect((err) => {
    if (err) console.log("MYSQLI ERROR: ", err)
    console.log("Connected to database successfully");
})

db.query = util.promisify(db.query)

const databaseQuery =  async (cmd, data = []) => {
    if(config.develope.sql_debug_log) console.log(cmd);
    try {
        const resultFetch = await db.query(cmd, data)
        return resultFetch;
    } catch (e) {
        return {status: "failed", errno: e.errno};
    }
}

// LOGIN
const login = async(userID, password, role) => {
    if (typeof role == "undefined") return {status: "failed", text: "no role selected"};

    password = md5(password);
    if (role == "student"){
        var cmd = `SELECT studentID FROM student INNER JOIN department ON student.departmentID = department.departmentID WHERE studentID=? AND password=?`
        var account = await databaseQuery(cmd, [userID, password])
        if (account.length !== 0) return {userID: account[0].studentID, role: 2};
        return false
    }

    if (role == "teacher") {
        var cmd = `SELECT IDcard FROM teacher INNER JOIN department ON teacher.departmentID = department.departmentID WHERE IDcard=? AND password=?`;
        var account = await databaseQuery(cmd, [userID, password])

        if (account.length !== 0) return {userID: account[0].IDcard, role: 1};

        var cmd = `SELECT username FROM admin WHERE username=? AND password=?`;
        var account = await databaseQuery(cmd, [userID, password])

        if (account.length !== 0) return {userID: account[0].username, role: 0};
        return false
    }
}

// GET ACCOUNT DETAIL
const getAccountDetail = async(userID, roleID) => {
    let accountDetail;
    switch (roleID) {
        case 0:
            accountDetail = await databaseQuery(`SELECT * FROM admin WHERE username="${userID}"`);
            break;
        case 1:
            accountDetail = await databaseQuery(`SELECT * FROM teacher INNER JOIN department ON teacher.departmentID = department.departmentID WHERE IDcard="${userID}"`);
            break;
        case 2:
            accountDetail = await databaseQuery(`SELECT * FROM student INNER JOIN department ON student.departmentID = department.departmentID WHERE studentID="${userID}"`);
            break;
    }
    return accountDetail[0];
}

// GET SCHOLARSHIPS
const getScholarships = async(queryName = "") => {
    queryParam = "";
    if (queryName !== "") queryParam = `WHERE scholarshipName like '%${queryName}%'`;

    return await databaseQuery(`SELECT * FROM scholarship ${queryParam}`);
}

// GET INCOME EXPENSE BALANCE
const getTransactionDetail = async(userID, querydate = {}) => {
    let income_total = 0;
    let expense_total = 0;
    let balance = 0;
    
    queryDateParam = "";
    if (Object.keys(querydate).length !== 0) {
        if (querydate.month !== '0' && typeof querydate.month !== "undefined") queryDateParam = queryDateParam + ` AND MONTH(date)=${querydate.month}`;
        if (querydate.year !== '0' && typeof querydate.year  !== "undefined") queryDateParam = queryDateParam + ` AND YEAR(date)=${querydate.year}`;
    };

    let incomeLists = await databaseQuery(`SELECT listID, studentID, scholarship.scholarshipName as detail, tag, amount, type, date FROM scholarshiplists INNER JOIN scholarship ON scholarshiplists.scholarshipID = scholarship.scholarshipID WHERE studentID=${userID} ${queryDateParam}`);
    let expenseLists = await databaseQuery(`SELECT * FROM expenselists WHERE studentID=${userID} ${queryDateParam}`);
    let AllLists = [...incomeLists, ...expenseLists];

    AllLists.sort(function(a, b) {
        return new Date(b.date) - new Date(a.date);
    })

    incomeLists.forEach(list => {
        income_total += list.amount;
    })

    expenseLists.forEach(list => {
        expense_total += list.amount;
    })

    balance = income_total - expense_total;
    if(balance < 0) balance = 0;

    return {
        balance: balance,
        income: income_total,
        expense: expense_total,
        transactions: AllLists
    }
}

// ADD DATA
const insertDB = async(database_table, data = {}) => {
    cmd = `INSERT INTO ${database_table} SET `;
    first = true;
    params = [];
    for (const [key, value] of Object.entries(data)) {
        cmd += first ? `${key}=?` : `, ${key}=?`;
        first = false;
        params.push(value);
    }

    return await databaseQuery(cmd, params);
}
// UPDATE DATA
const updateDB = async(database_table, data = {}, condition) => {
    cmd = `UPDATE ${database_table} SET `;
    first = true;
    params = [];
    for (const [key, value] of Object.entries(data)) {
        cmd += first ? `${key}=?` : `, ${key}=?`;
        first = false;
        params.push(value);
    }
    cmd += ` WHERE ${condition}`
    const result = await databaseQuery(cmd, params);
    if (typeof result.status == "undefined") {
        return {
            status: "success",
        };
    } else {
        return result;
    }

}

// DELETE DATA
const deleteDB = async(database_table, condition) => {
    return await databaseQuery(`DELETE FROM ${database_table} WHERE ${condition} LIMIT 1`); 
}

// GET STUDENT BY NAME
const getStudentsByName = async(name) => {
    if (typeof name == "undefined") name = ""
    return await databaseQuery(`SELECT * FROM student INNER JOIN department ON student.departmentID = department.departmentID WHERE name like '${name}%'`)
}

// GET STUDENT BY NAME
const getTeachersByName = async(name) => {
    if (typeof name == "undefined") name = ""
    return await databaseQuery(`SELECT * FROM teacher INNER JOIN department ON teacher.departmentID = department.departmentID WHERE name like '${name}%'`)
}

// GET STUDENT ACTIVITES
const getActivities = async(userID, querydate = {}) => {
    let hours = 0;

    queryDateParam = "";
    if (Object.keys(querydate).length !== 0) {
        if (querydate.month !== '0' && typeof querydate.month !== "undefined") queryDateParam = queryDateParam + ` AND MONTH(date)=${querydate.month}`;
        if (querydate.year !== '0' && typeof querydate.year  !== "undefined") queryDateParam = queryDateParam + ` AND YEAR(date)=${querydate.year}`;
    };

    const activities = await databaseQuery(`SELECT * FROM activity WHERE studentID="${userID}" ${queryDateParam}`)

    activities.forEach(activity => {
        let totalTime = timeSubtract(activity.startHour, activity.endHour);
        hours += totalTime;
    })


    return {
        total: activities.length,
        TotalTime: timeFormatFromSec(hours),
        activities: activities
    }
}

// GET STUDENT ACTIVITY BY ID
const getActivityByID = async(activityID) => {
    cmd = "SELECT * FROM activity WHERE activityID= ?"
    const activity = await databaseQuery(cmd, [activityID]);
    return activity[0];
}

// GET STUDENT ACHIEVEMENTS
const getAchievements = async(userID, querydate = {}) => {
    queryDateParam = "";
    if (Object.keys(querydate).length !== 0) {
        if (querydate.month !== '0' && typeof querydate.month !== "undefined") queryDateParam = queryDateParam + ` AND MONTH(date)=${querydate.month}`;
        if (querydate.year !== '0' && typeof querydate.year  !== "undefined") queryDateParam = queryDateParam + ` AND YEAR(date)=${querydate.year}`;
    };

    const achievements = await databaseQuery(`SELECT * FROM achievement WHERE studentID="${userID}" ${queryDateParam}`)

    return {
        total: achievements.length,
        achievements: achievements
    }
}

// GET STUDENT ACHIEVEMENT BY ID
const getAchievementByID = async(activityID) => {
    cmd = "SELECT * FROM achievement WHERE achievementID= ?"
    const achievement = await databaseQuery(cmd, [activityID]);
    return achievement[0];
}

// GET STUDENTS IN RESPONSIBILITY
const getStudentInResponsibility = async(teacher, studentName) => {
    if (typeof studentName == "undefined") studentName = ""

    const scholarships = await getScholarshipsInResponsibility(teacher)

    let students = []
    let studentIDs = []

    for (let scholarship of scholarships) {
        cmd = `SELECT DISTINCT studentID FROM scholarshiplists WHERE scholarshipID=?`;
        const studentIDsFetch = await databaseQuery(cmd, [scholarship.scholarshipID]);
        studentIDs = [...studentIDs, ...studentIDsFetch];
    }

    for (let studentID of studentIDs) {
        cmd = `SELECT * FROM student INNER JOIN department ON student.departmentID = department.departmentID WHERE studentID=? and name like '${studentName}%'`;
        const studentFetch = await databaseQuery(cmd, [studentID.studentID])
        students= [...students, ...studentFetch];
    }

    return students;
}

// GET SCHOLARSHIP IN RESPONSIBILITY
const getScholarshipsInResponsibility = async(teacher) => {
    return await databaseQuery("SELECT * FROM scholarship WHERE teacherID=?", [teacher]);
}

// GET APPLICATION USER IN RESPONSIBILITY
const getApplicationUserInResponsibility = async(teacher, applicationUserName) => {
    if (typeof applicationUserName == "undefined") applicationUserName = ""

    const scholarships = await getScholarshipsInResponsibility(teacher)
    let applicationUsers = []

    for (let scholarship of scholarships) {
        cmd = `SELECT * FROM applicationform INNER JOIN scholarship ON scholarship.scholarshipID = applicationform.scholarshipID INNER JOIN department ON department.departmentID = applicationform.departmentID WHERE applicationform.scholarshipID=? and applicationform.name like '${applicationUserName}%'`;
        const applicationUsersFetch = await databaseQuery(cmd, [scholarship.scholarshipID]);
        applicationUsers = [...applicationUsers, ...applicationUsersFetch];
    }

    return applicationUsers;
}

// GET APPLIED SCHOLARSHIP
const getAppliedScholarships = async(studentID) => {
    const scholarsipIDs = await databaseQuery("SELECT DISTINCT scholarshipID FROM scholarshiplists WHERE studentID=?", [studentID]);
    
    let scholarship = []

    for (let scholarsipID of scholarsipIDs) {
        const scholarshipFetch = await databaseQuery("SELECT * FROM scholarship WHERE scholarshipID=? LIMIT 1", [scholarsipID]);
        scholarship = [...scholarship, ...scholarshipFetch];
    }
    return scholarship;
}

const getNotifications = async(students = [], querydate = {}) => {
    queryDateParam = "";
    if (Object.keys(querydate).length !== 0) {
        if (querydate.month !== '0' && typeof querydate.month !== "undefined") queryDateParam = queryDateParam + ` AND MONTH(date)=${querydate.month}`;
        if (querydate.year !== '0' && typeof querydate.year  !== "undefined") queryDateParam = queryDateParam + ` AND YEAR(date)=${querydate.year}`;
    };

    let notifications = 0;
    
    let notiFetchs = []
    let notifyDetail = []
    for (let student of students) {
        const notify = await databaseQuery("SELECT COUNT(notifyStatus) as notifications FROM `expenselists` WHERE studentID=? AND notifyStatus=0;", [student.studentID]);
        const notifyDetailFetch = await databaseQuery(`SELECT expenselists.listID, student.studentID, student.name, expenselists.amount, expenselists.tag, expenselists.date FROM expenselists INNER JOIN student ON student.studentID = expenselists.studentID WHERE student.studentID=? ${queryDateParam}`, [student.studentID]);
        notiFetchs = [...notiFetchs, ...notify];
        notifyDetail = [...notifyDetail, ...notifyDetailFetch];
    }

    for (noti of notiFetchs) {
        notifications += noti.notifications
    }

    notifyDetail.sort(function(a, b) {
        return new Date(b.date) - new Date(a.date);
    })

    return {
        unread: notifications,
        notifyDetail: notifyDetail
    }
}

const updateUnReadToRead = async(notifications = []) => {
    for (let notification of notifications) {
        await updateDB("expenselists", {notifyStatus: 1}, `listID= ${notification.listID}`)
    }
}

global.db = db;

// all user tool
global.login = login
global.getAccountDetail = getAccountDetail

// data manage
global.databaseQuery = databaseQuery
global.insertDB = insertDB
global.updateDB = updateDB
global.deleteDB = deleteDB

// student tool
global.getTransactionDetail = getTransactionDetail
global.getScholarships = getScholarships
global.getActivities = getActivities
global.getActivityByID = getActivityByID
global.getAchievements = getAchievements
global.getAchievementByID = getAchievementByID
global.getAppliedScholarships = getAppliedScholarships

// teacher & admin tool
global.getStudentsByName = getStudentsByName
global.getTeachersByName = getTeachersByName
global.getStudentInResponsibility = getStudentInResponsibility
global.getApplicationUserInResponsibility = getApplicationUserInResponsibility
global.getScholarshipsInResponsibility = getScholarshipsInResponsibility
global.getNotifications = getNotifications
global.updateUnReadToRead = updateUnReadToRead

module.exports = {
}
