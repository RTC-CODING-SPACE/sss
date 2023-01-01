const path = require('path');
const md5 = require('md5');
const mysql = require('mysql');
const config = require(path.join(__dirname, '..','/config.json'))

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

// DATABASE QUERY
const databaseQuery = (cmd, data = []) => {
    return new Promise((resolve, reject) => {
        if(config.develope.sql_debug_log) console.log(cmd);
        db.query(cmd, data, (err, result) => {
            if (err) console.log("MYSQLI ERROR: ", err);
            if (result.length == 0) resolve(result);
            resolve(result);
        })
    })
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
    if (queryName !== "") queryParam = `WHERE name like '${queryName}%'`;
    console.log(`SELECT * FROM scholarship ${queryParam}`)
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

    let incomeLists = await databaseQuery(`SELECT listID, studentID, scholarship.name as detail, tag, amount, type, date FROM scholarshiplists INNER JOIN scholarship ON scholarshiplists.scholarshipID = scholarship.scholarshipID WHERE studentID=${userID} ${queryDateParam}`);
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
    return await databaseQuery(cmd, params);
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

global.db = db;
global.databaseQuery = databaseQuery
global.login = login
global.getAccountDetail = getAccountDetail
global.getTransactionDetail = getTransactionDetail
global.getScholarships = getScholarships
global.insertDB = insertDB
global.updateDB = updateDB
global.deleteDB = deleteDB
global.getStudentsByName = getStudentsByName
global.getTeachersByName = getTeachersByName

module.exports = {
}
