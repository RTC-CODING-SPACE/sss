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
const { searchScholarships, searchTransaction, searchTransactionPrint, searchTransaction2 } = require('./routes/search');


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
            if (err) return reject(err);
            if (result.length == 0) resolve(result);
            resolve(result);
        })
    })
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

// App listen
app.listen(port, () => {
    console.log(`App is listening at port ${port}`);
})