const md5 = require("md5");
const path = require('path');

module.exports = {
    getStudentLoginPage: async(req, res) => {
        sess = req.session

        statusParams = "";
        if (typeof sess.status !== "undefined"){
            statusParams = sess.status;
            delete sess.status;
        } 

        res.render('student_login.ejs', { webTitle: "เข้าสู่ระบบ | นักเรียน", status: statusParams });
    },
    getTeacherLoginPage: async(req, res) => {
        sess = req.session

        statusParams = "";
        if (typeof sess.status !== "undefined"){
            statusParams = sess.status;
            delete sess.status;
        } 

        res.render('teacher_login.ejs', { webTitle: "เข้าสู่ระบบ | นักเรียน", status: statusParams });
    },

    login: async(req, res) => {
        sess = req.session;
        check_login = async() => {
            if (account = await databaseQuery(`SELECT * FROM student INNER JOIN department ON student.departmentID = department.departmentID WHERE studentID="${req.body.userID}" AND password="${md5(req.body.password)}"`)) {
                if(account.length !== 0){
                    sess.userID = account[0].studentID;
                    sess.role = 2;
                    return res.redirect('/student');
                }
            }

            if (account = await databaseQuery(`SELECT * FROM teacher INNER JOIN department ON teacher.departmentID = department.departmentID WHERE IDcard="${req.body.userID}" AND password="${md5(req.body.password)}"`)) {
                if(account.length !== 0){
                    sess.userID = account[0].IDcard;
                    sess.role = 1;
                    return res.redirect("/teacher");
                }
            }

            if (account = await databaseQuery(`SELECT * FROM admin WHERE username="${req.body.userID}" AND password="${md5(req.body.password)}"`)) {
                if(account.length !== 0){
                    sess.userID = account[0].username;
                    sess.role = 0;
                    return res.redirect("/admin");
                }
            }
            
            sess.status = {stauts: "failed", text: "ID / PASSWORD IS INCORRECT."}
            return res.redirect(`/${req.params.role}Login`)
        }

        await check_login();
    }
}