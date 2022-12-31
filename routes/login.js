const md5 = require("md5");

module.exports = {
    login: (req, res) => {
        sess = req.session;
        check_login = async() => {
            if (account = await databaseQuery(`SELECT * FROM student INNER JOIN department ON student.departmentID = department.departmentID WHERE studentID=${req.body.userID} AND password="${md5(req.body.password)}"`)) {
                sess.userID = account[0].studentID;
                sess.role = 2;
                res.redirect('/student');
            } else if (account = await databaseQuery(`SELECT * FROM teacher WHERE IDcard=${req.body.userID} AND password="${md5(req.body.password)}"`)) {
                sess.name = account.name;
                sess.role = 1;
                res.render("teacher_index.ejs");
            } else if (account = await databaseQuery(`SELECT * FROM admin WHERE username=${req.body.userID} AND password="${md5(req.body.password)}"`)) {
                sess.name = account.name;
                sess.role = 0;
                res.render("admin_index.ejs");
            } else {
                return false;
            }
        }

        check_login();
    }
}