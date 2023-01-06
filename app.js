// IMPORTS MY LIBS
require('./libs/utility');
require('./libs/database');

// IMPORTS EXPRESS
const express = require('express');

// IMPORTS MIDDLEWARE
const sessions = require('express-session');
const bodyParser = require("body-parser");
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser')

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
app.use(bodyParser.urlencoded({ 
    extended: true 
}));
app.use(sessions({
    secret: "shhhhhh",
    resave: false,
    saveUninitialized: true
}));
app.use(cookieParser());
app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : path.join(__dirname, "/tmp/")
}));

// ROUTERS HOMEPAGE
const { indexPage, indexScholarshipsPage, indexContactPage, indexAboutPage, indexLoginPage, indexApplicationPage } = require('./routes/homepage');
const { login, logout } = require('./routes/authen');
const { profilePage } = require('./routes/profile');
const { studentIndexPage, studentScholarshipPage, studentGraphPage, studentTransactionsPage, studentExpensePage, studentActivitiesPage, studentActivityPage, studentAchievementsPage, studentAchievementPage } = require('./routes/student');
const { teacherIndexPage, teacherStudentsListPage, teacherScholarshipPage, teacherApplicationUsersPage, teacherNotificationPage } = require('./routes/teacher')
const { adminIndexPage, adminCreateScholarshipPage, adminUsersListPage } = require('./routes/admin')
const { searchScholarships, searchTransaction, searchStudent, searchUser, searchNotifications } = require('./routes/search');
const { addData, editData, deleteData, reportData, approveData } = require('./routes/dataManagement');

// App Get
app.get('/test', (req, res) => {
    sess = req.session;
    res.clearCookie('auth_token')
    res.render('test.ejs', { webTitle: "ทดสอบระบบ" });
})

app.get('/logout', logout) // LOGOUT

// HOMEPAGE
app.get('/', indexPage); // INDEX MAIN
app.get('/scholarships', indexScholarshipsPage); // INDEX SCHOLARSHIP
app.get('/contact', indexContactPage); // INDEX CONTACT
app.get('/about', indexAboutPage); // INDEX ABOUT
app.get('/scholarships/application', indexApplicationPage)
app.route('/login/:role') 
    .get(indexLoginPage) // LOGIN PAGE
    .post(login); // LOGGED IN

// STUDENT PAGES
app.get('/student', studentIndexPage); // STUDENT HOME
app.get('/studentScholarship', studentScholarshipPage); // STUDENT SCHOLARSHIP
app.get('/studentGraph/:studentID', studentGraphPage); // STUDENT GRAPH
app.get('/transactions/:studentID', studentTransactionsPage); // STUDENT TRANSACTIONS
app.get('/expense/:transactionID', studentExpensePage); // STUDENT EXPENSE PAGE
app.get('/activities/:studentID', studentActivitiesPage) // STUDENT ACTIVITIES PAGE
app.get('/activity/:activityID', studentActivityPage) // STUDENT ACTIVITY PAGE
app.get('/achievements/:studentID', studentAchievementsPage) // STUDENT ACHIEVEMENTS PAGE
app.get('/achievement/:achievementID', studentAchievementPage) // STUDENT ACHIEVEMENT PAGE

app.post('/seachScholarship', searchScholarships); // STUDENT SCHOLARSHIP SEARCH
app.post('/searchTransactionDate/:page/:studentID', searchTransaction); // STUDENT TRANSACTIONS SEARCH

// ALL USER PAGES
app.get('/profile/:role/:userID', profilePage) // ALL PROFILE PAGE
app.get('/approve/:dataType', approveData);
app.get('/report/:dataType', reportData);

app.post('/add/:dataType', addData); // ALL ADD DATA
app.post('/edit/:dataType', editData); // ALL EDIT DATA
app.route('/delete/:dataType') // ALL DELETE DATA
    .get(deleteData) 

// TEACHER PAGES
app.get('/teacher', teacherIndexPage); // TEACHER INDEX
app.get('/students_list', teacherStudentsListPage); // TEACHER STUDENT LISTS
app.get('/AddScholarShip/:studentID', teacherScholarshipPage); // TEACHER SCHOLARSHIP
app.get('/application_users', teacherApplicationUsersPage); // TEACHER SCHOLARSHIP
app.get('/notifications', teacherNotificationPage); // TEACHER SCHOLARSHIP

app.post('/searchStudent/:page', searchStudent); // TEACHER STUDENT SEARCH
app.post('/searchNotifications/:page', searchNotifications); // TEACHER STUDENT SEARCH

// ADMIN PAGES
app.get('/admin', adminIndexPage); // ADMIN INDEX
app.get('/createScholarship/:mode/:transactionID', adminCreateScholarshipPage); // ADMIN CREATE SCHOLARSHIP
app.get('/users_list', adminUsersListPage) // ADMIN USERS LIST

app.post('/searchUsers/:page', searchUser) // ADMIN SEARCH USER

// App listen
app.listen(port, () => {
    console.log(`App is listening at port ${port}`);
})