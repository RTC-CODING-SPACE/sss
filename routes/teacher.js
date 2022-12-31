const path = require('path');
const md5 = require("md5");

module.exports = {
    getTeacherPage: async(req, res) => {
        sess = req.session
        const teacher = await getAccountDetail(sess.userID, 1);
        const students = await databaseQuery("SELECT * FROM student INNER JOIN department ON student.departmentID = department.departmentID");
        
        const getStudentsBalance = async(students) => {
            const studentsBalance = {};
            for (const student of students) {
                const transactionDetail = await getTransactionDetail(student.studentID);
                studentsBalance[student.studentID] = transactionDetail.balance
                // studentsBalance.push(test);
            }
            return studentsBalance;
        }
        const studentsBalance = await getStudentsBalance(students);
        res.render("teacher_index.ejs", { webTitle: "หน้าหลัก | อาจารย์", account: teacher, students: students, studentsBalance: studentsBalance, role: "teacher" })
    },

    getTeacherQueryPage: async(req, res) => {
        sess = req.session
        const teacher = await getAccountDetail(sess.userID, 1);
        const students = await databaseQuery(`SELECT * FROM student INNER JOIN department ON student.departmentID = department.departmentID WHERE student.name like '${req.params.query}%'`);
        
        const getStudentsBalance = async(students) => {
            const studentsBalance = {};
            for (const student of students) {
                const transactionDetail = await getTransactionDetail(student.studentID);
                studentsBalance[student.studentID] = transactionDetail.balance
                // studentsBalance.push(test);
            }
            return studentsBalance;
        }
        const studentsBalance = await getStudentsBalance(students);
        res.render("teacher_index.ejs", { webTitle: "หน้าหลัก | อาจารย์", account: teacher, students: students, studentsBalance: studentsBalance, role: "teacher", query: `${req.params.query}` })
    },

    addStudent: async(req, res) => {
        sess = req.session;

        pictureParams = "";
        if( req.files) {
            const picture = req.files.picture;
            const fileEXT = picture.name.split('.');
            const fileName = `${req.body.studentID}.${fileEXT[fileEXT.length - 1]}`;
            const filePath = (path.join(__dirname, "..", `public/assets/img/profile/${fileName}`));

            picture.mv(filePath);
            pictureParams = `, picture='${fileName}'`;
        }
        req.body.password = md5(req.body.password)

        await databaseQuery(`INSERT INTO student SET studentID="${req.body.studentID}",password="${req.body.password}", name="${req.body.name}", dob="${req.body.dob}", phone="${req.body.phone}",level="${req.body.level}", departmentID=${req.body.departmentID}, email="${req.body.email}", address="${req.body.address}", gender="${req.body.gender}", teacherName="${req.body.teacherName}" ${pictureParams}`);
        sess.status = {status: "success", text: "ADDED NEW STUDENT TO SYSTEM."}
        res.redirect('/studentProfile/add/0');
    },

    getEditProfilePage2: async(req, res) => {
        sess = req.session;
        if(req.params.mode == "edit"){
            const account = await getAccountDetail(sess.userID, sess.role);
            const teacher = await getAccountDetail(req.params.IDcard, 1);
            const departments = await databaseQuery("SELECT * FROM department");

            statusParams = "";
            if (typeof sess.status !== "undefined"){
                statusParams = sess.status;
                delete sess.status;
            } 

            res.render('teacher_profile.ejs', {webTitle: "โปรไฟล์ | อาจารย์",account:account, teacher: teacher,departments: departments, mode: "edit", role: roleIdToRoleName(sess.role), status: statusParams});
        }

        if(req.params.mode == "add") {
            const account = await getAccountDetail(sess.userID, sess.role);
            const departments = await databaseQuery("SELECT * FROM department");

            statusParams = "";
            if (typeof sess.status !== "undefined"){
                statusParams = sess.status;
                delete sess.status;
            }

            res.render('teacher_profile.ejs', {webTitle: "โปรไฟล์ | อาจารย์",account:account,departments: departments, mode: "add", role: roleIdToRoleName(sess.role), status: statusParams});
        }
    },

    editStudentProfile2: async(req, res) => {
        sess = req.session;

        pictureParams = "";
        if( req.files) {
            const picture = req.files.picture;
            const fileEXT = picture.name.split('.');
            const fileName = `${req.params.IDcard}.${fileEXT[fileEXT.length - 1]}`;
            const filePath = (path.join(__dirname, "..", `public/assets/img/profile/${fileName}`));

            picture.mv(filePath);
            pictureParams = `, picture='${fileName}'`;
        }

        (req.body.password == "") ? passwordParams = "" : passwordParams = `, password = "${md5(req.body.password)}"`;

        await databaseQuery(`UPDATE teacher SET IDcard="${req.body.IDcard}", name="${req.body.name}", dob="${req.body.dob}", phone="${req.body.phone}", email="${req.body.email}", address="${req.body.address}", departmentID=${req.body.departmentID}, gender="${req.body.gender}" ${passwordParams} ${pictureParams} WHERE IDcard="${req.params.IDcard}"`);
        sess.status = {status: "success", text: "UPDATED PROFILE SUCCESSFULLY"}
        res.redirect(`/teacherProfile/edit/${req.params.IDcard}`);
    },

    getStudentsListPage: async(req, res) => {
        sess = req.session;

        const teacher = await getAccountDetail(sess.userID, sess.role);
        const students = await databaseQuery("SELECT * FROM student INNER JOIN department ON student.departmentID = department.departmentID");
        
        const getStudentsBalance = async(students) => {
            const studentsBalance = {};
            for (const student of students) {
                const transactionDetail = await getTransactionDetail(student.studentID);
                studentsBalance[student.studentID] = transactionDetail.balance
                // studentsBalance.push(test);
            }
            return studentsBalance;
        }
        const studentsBalance = await getStudentsBalance(students);
        res.render("teacher_students.ejs", { webTitle: "จัดการทุนนักศึกษา", account: teacher, students: students, studentsBalance: studentsBalance, role: roleIdToRoleName(sess.role) })
    },

    getStudentsListQueryPage: async(req, res) => {
        sess = req.session;

        const teacher = await getAccountDetail(sess.userID, sess.role);
        const students = await databaseQuery(`SELECT * FROM student INNER JOIN department ON student.departmentID = department.departmentID WHERE student.name like '${req.params.query}%'`);
        
        const getStudentsBalance = async(students) => {
            const studentsBalance = {};
            for (const student of students) {
                const transactionDetail = await getTransactionDetail(student.studentID);
                studentsBalance[student.studentID] = transactionDetail.balance
            }
            return studentsBalance;
        }
        const studentsBalance = await getStudentsBalance(students);
        res.render("teacher_students.ejs", { webTitle: "จัดการทุนนักศึกษา", account: teacher, students: students, studentsBalance: studentsBalance, role: roleIdToRoleName(sess.role), query: req.params.query })
    },

    getAddScholarshipPage: async(req, res) => {
        sess = req.session;
        const teacher = await getAccountDetail(sess.userID, sess.role);

        statusParams = "";
        if (typeof sess.status !== "undefined"){
            statusParams = sess.status;
            delete sess.status;
        }

        res.render("teacher_addScholarship.ejs", { webTitle: "จัดการทุนนักศึกษา", account: teacher, role: roleIdToRoleName(sess.role), status: statusParams, studentID: req.params.studentID })
    },
    
    addFund: async(req, res) => {
        sess = req.session;

        console.log(req.body);

        await databaseQuery(`INSERT INTO scholarshiplists SET amount=${req.body.amount}, tag="${req.body.tag}", scholarshipID=1, studentID="${req.params.studentID}"`);
        sess.status = {status: "success", text: "ADDED SCHOLARSHIP SUCCESSFULLY"};
        res.redirect(`/addScholarship/${req.params.studentID}`);
    }
}