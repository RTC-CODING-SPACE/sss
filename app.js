// IMPORTS
const config = require("./config.json");
const express = require('express');
const mysql = require('mysql');
const path = require('path');
const sessions = require('express-session');
const bodyParser = require("body-parser");
const fileUpload = require('express-fileupload');
// const multer  = require('multer')
// const upload = multer({ dest: './public/assets/uploads/' })

// PAGE FUNCTION
const { getScholarshipsPage } = require('./routes/scholarships');
const { login } = require('./routes/login');
const { 
        getStudentHome, 
        getScholarshipPage, 
        getScholarshipQueryPage, 
        getGraphPage, 
        getGraphQueryPage, 
        getPrintGraphQueryPage, 
        getTransactionsPage, 
        getTransactionsQueryPage, 
        getAddExpensePage,
        addExpense,
        editExpense,
        getEditProfilePage,
        editStudentProfile
    } = require('./routes/student');

const {
        getTeacherPage,
        getTeacherQueryPage,
        addStudent,
        getEditProfilePage2,
        editStudentProfile2,
        getStudentsListPage,
        getAddScholarshipPage,
        getStudentsListQueryPage,
        addFund
    } = require('./routes/teacher')
const {
        searchScholarships,
        searchTransaction,
        searchTransactionPrint,
        searchTransaction2,
        searchStudent,
        searchStudent2
    } = require('./routes/search');


// MYSQLI CONNECT
const db = mysql.createConnection({
    host: config.database.host,
    user: config.database.username,
    password: config.database.password,
    database: config.database.databaseName
});

db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log("Connected to database successfully");
})

global.databaseQuery = (query) => {
    return new Promise((resolve, reject) => {
        console.log(query);
        db.query(query, (err, result) => {
            if (err) resolve (false);
            if (result.length == 0) resolve(result);
            resolve(result);
        })
    })
}

global.getAccountDetail = async(userID, role) => {
    let accountDetail;
    switch (role) {
        case 0:
            accountDetail = await databaseQuery(`SELECT * FROM admin WHERE username=${userID}`);
            break;
        case 1:
            accountDetail = await databaseQuery(`SELECT * FROM teacher INNER JOIN department ON teacher.departmentID = department.departmentID WHERE IDcard=${userID}`);
            break;
        case 2:
            accountDetail = await databaseQuery(`SELECT * FROM student INNER JOIN department ON student.departmentID = department.departmentID WHERE studentID=${userID}`);
            break;
    }
    return accountDetail[0];
}

global.getTransactionDetail = async(userID, querydate = {}) => {
    let income_total = 0;
    let expense_total = 0;
    let balance = 0;

    queryDateParam = "";
    if (Object.keys(querydate).length !== 0) {
        if (querydate.month !== '0') queryDateParam = queryDateParam + ` AND MONTH(date)=${querydate.month}`;
        if (querydate.year !== '0') queryDateParam = queryDateParam + ` AND YEAR(date)=${querydate.year}`;
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

global.roleIdToRoleName = (roleID) => {
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

global.db = db;

// App setup
const app = express();
const port = config.server.port;
var sess;

app.set('port', port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// App middlewares
app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(sessions({
    secret: "shhhhhh",
    resave: false,
    saveUninitialized: true
}));
app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : '/tmp/'
}));

// App Get
app.get('/test', (req, res) => {
    sess = req.session;
    res.render('test.ejs', { webTitle: "ทดสอบระบบ" });
})

// INDEX MAIN
app.get('/', (req, res) => {
    res.render('index.ejs', { webTitle: "หน้าหลัก" });
})

// INDEX SCHOLARSHIP
app.get('/scholarships', getScholarshipsPage)

// INDEX CONTACT
app.get('/contact', (req, res) => {
    res.render('index_contact.ejs', { webTitle: "ติดต่อพวกเรา" });
})

// INDEX ABOUT
app.get('/about', (req, res) => {
    res.render('index_about.ejs', { webTitle: "เกี่ยวกับเรา" });
})

// LOGOUT
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
})

// STUDENT LOGIN
app.get('/studentLogin', (req, res) => {
    res.render('student_login.ejs', { webTitle: "เข้าสู่ระบบ | นักเรียน" });
})

// STUDENT HOME
app.get('/student', getStudentHome);

// STUDENT SCHOLARSHIP
app.get('/studentScholarship', getScholarshipPage);

// STUDENT SCHOLARSHIP WITH QUERY
app.get('/studentScholarship/:query', getScholarshipQueryPage);

// STUDENT GRAPH
app.get('/studentGraph/:studentID', getGraphPage);

// STUDENT GRAPH WITH QUERY
app.get('/studentGraph/:studentID/:month/:year', getGraphQueryPage);

// 
app.get('/studentGraphPrint/:studentID/:month/:year', getPrintGraphQueryPage);

// STUDENT TRANSACTIONS
app.get('/transactions/:studentID', getTransactionsPage);

// STUDENT TRANSACTIONS WITH QUERY
app.get('/transactions2/:studentID/:month/:year', getTransactionsQueryPage);

// STUDENT EXPENSE MODE ADD
app.get('/expense/:mode', getAddExpensePage);

// STUDENT EXPENSE MODE EDIT
app.get('/expense/:mode/:transactionID', getAddExpensePage);

// STUDENT PROFILE
app.get('/studentProfile/:mode/:studentID', getEditProfilePage);

// TEACHER LOGIN
app.get("/teacherLogin", (req, res) => {
    res.render('teacher_login.ejs', {webTitle: "เข้าสู่ระบบ | อาจารย์"});
})

// TEACHER INDEX
app.get('/teacher', getTeacherPage)

// TEACHER INDEX SEARCH
app.get('/teacher/:query', getTeacherQueryPage);

// TEACHER ADD STUDENT
app.get('/studentProfile/:mode', getEditProfilePage)

// TEACHER EDIT PROFILE
app.get('/teacherProfile/:mode/:IDcard', getEditProfilePage2)

// TEACHER STUDENT LISTS
app.get('/students_list', getStudentsListPage)

// TEACHER ADD SCHOLARSHIP
app.get('/AddScholarShip/:studentID', getAddScholarshipPage)

// TEACHER STUDENT LISTS WITH QUERY
app.get('/students_list/:query', getStudentsListQueryPage)




// APP POST
// All login
app.post('/home', login);

// STUDENT SCHOLARSHIP SEARCH
app.post('/seachScholarship', searchScholarships);

// STUDENT TRANSACTION SEARCH
app.post('/searchTransactionDate/:studentID', searchTransaction);

// STUDENT TRANSACTION SEARCH
app.post('/searchTransaction2Date/:studentID', searchTransaction2);

// STUDENT TRANSACTION SEARCH FOR PRINT
app.post('/graphPrint/:studentID', searchTransactionPrint);

// STUDENT ADD EXPENSE
app.post('/addExpense/:studentID', addExpense);

// STUDENT EDIT EXPENSE
app.post('/editExpense/:listID', editExpense);

// STUDENT EDIT PROFILE
app.post('/editProfile/:studentID', editStudentProfile);

// TEACHER STUDENT SEARCH
app.post('/searchStudent', searchStudent);

// TEACHER ADD STUDENT
app.post('/addStudent', addStudent);

// TEACHER EDIT PROFILE
app.post('/editProfile2/:IDcard', editStudentProfile2);

// TEACHER ADD FUND
app.post('/addFund/:studentID', addFund);

app.post('/searchStudent2', searchStudent2)

// App listen
app.listen(port, () => {
    console.log(`App is listening at port ${port}`);
})