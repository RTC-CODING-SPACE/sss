const md5 = require("md5");
const path = require('path');

module.exports = {
    getAdminIndexPage: async(req, res) => {
        sess = req.session
        const account = await getAccountDetail(sess.userID, sess.role);
        const students = await databaseQuery("SELECT * FROM student INNER JOIN department ON student.departmentID = department.departmentID");
        const teachers = await databaseQuery("SELECT * FROM teacher INNER JOIN department ON teacher.departmentID = department.departmentID");

        const users = [...students, ...teachers];
        console.log(account)
        res.render('admin_index.ejs', { webTitle: "หน้าหลัก | ผู้ดูแลระบบ", account: account, users: users, role: roleIdToRoleName(sess.role) })
    },

    getAdminIndexQueryPage: async(req, res) => {
        sess = req.session
        const account = await getAccountDetail(sess.userID, sess.role);
        const students = await databaseQuery(`SELECT * FROM student INNER JOIN department ON student.departmentID = department.departmentID WHERE name like '${req.params.query}%'`);
        const teachers = await databaseQuery(`SELECT * FROM teacher INNER JOIN department ON teacher.departmentID = department.departmentID WHERE name like '${req.params.query}%'`);

        const users = [...students, ...teachers];
        res.render('admin_index.ejs', { webTitle: "หน้าหลัก | ผู้ดูแลระบบ", account: account, users: users, role: roleIdToRoleName(sess.role), query: req.params.query })
    },

    addTeacher: async(req, res) => {
        sess = req.session;

        pictureParams = "";
        if( req.files) {
            const picture = req.files.picture;
            const fileEXT = picture.name.split('.');
            const fileName = `${req.body.IDcard}.${fileEXT[fileEXT.length - 1]}`;
            const filePath = (path.join(__dirname, "..", `public/assets/img/profile/${fileName}`));

            picture.mv(filePath);
            pictureParams = `, picture='${fileName}'`;
        }
        req.body.password = md5(req.body.password)

        await databaseQuery(`INSERT INTO teacher SET IDcard="${req.body.IDcard}",password="${req.body.password}", name="${req.body.name}", dob="${req.body.dob}", phone="${req.body.phone}", departmentID=${req.body.departmentID}, email="${req.body.email}", address="${req.body.address}", gender="${req.body.gender}" ${pictureParams}`);
        sess.status = {status: "success", text: "ADDED NEW TEACHER TO SYSTEM."}
        res.redirect('/teacherProfile/add/0');
    },

    deleteUser: async(req, res) => {
        sess = req.session;

        (req.params.role == "student") ? sqlQuery = `DELETE FROM student WHERE studentID=${req.params.userID}` : sqlQuery = `DELETE FROM teacher WHERE IDcard=${req.params.userID}`;

        await databaseQuery(sqlQuery);
        res.redirect('/admin');
    },

    getEditProfilePage3: async(req, res) => {
        sess = req.session;
        if(req.params.mode == "edit"){
            const account = await getAccountDetail(sess.userID, sess.role);

            statusParams = "";
            if (typeof sess.status !== "undefined"){
                statusParams = sess.status;
                delete sess.status;
            } 

            res.render('admin_profile.ejs', {webTitle: "โปรไฟล์ | ผู้ดูแลระบบ",account:account, mode: "edit", role: roleIdToRoleName(sess.role), status: statusParams});
        }

        // if(req.params.mode == "add") {
        //     const account = await getAccountDetail(sess.userID, sess.role);
        //     const departments = await databaseQuery("SELECT * FROM department");

        //     statusParams = "";
        //     if (typeof sess.status !== "undefined"){
        //         statusParams = sess.status;
        //         delete sess.status;
        //     }

        //     res.render('teacher_profile.ejs', {webTitle: "โปรไฟล์ | อาจารย์",account:account,departments: departments, mode: "add", role: roleIdToRoleName(sess.role), status: statusParams});
        // }
    },

    editStudentProfile3: async(req, res) => {
        sess = req.session;

        pictureParams = "";
        if( req.files) {
            const picture = req.files.picture;
            const fileEXT = picture.name.split('.');
            const fileName = `${req.params.username}.${fileEXT[fileEXT.length - 1]}`;
            const filePath = (path.join(__dirname, "..", `public/assets/img/profile/${fileName}`));

            picture.mv(filePath);
            pictureParams = `, picture='${fileName}'`;
        }

        (req.body.password == "") ? passwordParams = "" : passwordParams = `, password = "${md5(req.body.password)}"`;

        await databaseQuery(`UPDATE admin SET username="${req.body.username}", name="${req.body.name}", dob="${req.body.dob}", phone="${req.body.phone}", email="${req.body.email}", gender="${req.body.gender}" ${passwordParams} ${pictureParams} WHERE username="${req.params.username}"`);
        sess.status = {status: "success", text: "UPDATED PROFILE SUCCESSFULLY"}
        res.redirect(`/adminProfile/edit/${req.params.username}`);
    },

    getCreateScholarshipPage: async(req, res) => {
        sess = req.session;

        if(req.params.mode == "add") {
            const account = await getAccountDetail(sess.userID, sess.role);

            statusParams = "";
            if (typeof sess.status !== "undefined"){
                statusParams = sess.status;
                delete sess.status;
            }

            res.render('admin_scholarship.ejs', { webTitle: "สร้างทุนการศึกษา", account: account, role: roleIdToRoleName(sess.role), mode: "add", status: statusParams });
        }
    },

    createFund: async(req, res) => {
        sess = req.session;

        await databaseQuery(`INSERT INTO scholarship SET name="${req.body.name}", prize="${req.body.prize}", detail="${req.body.detail}"`);
        sess.status = {status: "success", text: "CREATED NEW SCHOLARSHIP SUCCESSFULLY"};
        res.redirect('/createScholarship/add/0');
    },

    getUsersListPage: async(req, res) => {
        sess = req.session
        const account = await getAccountDetail(sess.userID, sess.role);
        const students = await databaseQuery("SELECT * FROM student INNER JOIN department ON student.departmentID = department.departmentID");
        const teachers = await databaseQuery("SELECT * FROM teacher INNER JOIN department ON teacher.departmentID = department.departmentID");

        const users = [...students, ...teachers];
        res.render('admin_usersList.ejs', { webTitle: "ผู้ใช้งานทั้งหมด", account: account, users: users, role: roleIdToRoleName(sess.role) })
    },

    getUsersListQueryPage: async(req, res) => {
        sess = req.session
        const account = await getAccountDetail(sess.userID, sess.role);
        const students = await databaseQuery(`SELECT * FROM student INNER JOIN department ON student.departmentID = department.departmentID WHERE name like '${req.params.query}%'`);
        const teachers = await databaseQuery(`SELECT * FROM teacher INNER JOIN department ON teacher.departmentID = department.departmentID WHERE name like '${req.params.query}%'`);

        const users = [...students, ...teachers];
        res.render('admin_usersList.ejs', { webTitle: "ผู้ใช้งานทั้งหมด", account: account, users: users, role: roleIdToRoleName(sess.role), query: req.params.query })
    },
}