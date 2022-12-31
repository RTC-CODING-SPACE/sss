const md5 = require("md5");

module.exports = {
    login: async(req, res) => {
        sess = req.session;
        check_login = async() => {
            if (account = await databaseQuery(`SELECT * FROM student INNER JOIN department ON student.departmentID = department.departmentID WHERE studentID=${req.body.userID} AND password="${md5(req.body.password)}"`)) {
                if(account.length !== 0){
                    sess.userID = account[0].studentID;
                    sess.role = 2;
                    res.redirect('/student');
                }
            }

            if (account = await databaseQuery(`SELECT * FROM teacher INNER JOIN department ON teacher.departmentID = department.departmentID WHERE IDcard=${req.body.userID} AND password="${md5(req.body.password)}"`)) {
                if(account.length !== 0){
                    sess.userID = account[0].IDcard;
                    sess.role = 1;
                    res.redirect("/teacher");
                }
            }

            if (account = await databaseQuery(`SELECT * FROM admin WHERE username=${req.body.userID} AND password="${md5(req.body.password)}"`)) {
                if(account.length !== 0){
                    sess.name = account.name;
                    sess.role = 0;
                    res.render("admin_index.ejs");
                }
            }
            
            return false;
        }

        await check_login();
    }
}