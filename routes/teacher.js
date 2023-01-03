const path = require('path');
const md5 = require("md5");

module.exports = {
    teacherIndexPage: async(req, res) => {
        sess = req.session

        if (sess.role != 1) {
            return res.redirect(`/${roleIdToRoleName(sess.role)}`);
        } else if (typeof sess.role == "undefined") {
            return res.redirect('/');
        }

        const teacher = await getAccountDetail(sess.userID, 1);
        const students = await getStudentInResponsibility(sess.userID, req.query.query);
        
        const notifications = await getNotifications(students);
        sess.notifications = notifications.unread;

        const getStudentsBalance = async(students) => {
            const studentsBalance = {};
            for (const student of students) {
                const transactionDetail = await getTransactionDetail(student.studentID);
                studentsBalance[student.studentID] = transactionDetail.balance
            }
            return studentsBalance;
        }
        const studentsBalance = await getStudentsBalance(students);

        res.render("teacher/teacher_index.ejs", { webTitle: "หน้าหลัก | อาจารย์", account: teacher, students: students, studentsBalance: studentsBalance, role: "teacher", getParams: req.query.query })
    },

    teacherNotificationPage: async(req, res) => {
        sess = req.session

        if (sess.role != 1) {
            return res.redirect(`/${roleIdToRoleName(sess.role)}`);
        } else if (typeof sess.role == "undefined") {
            return res.redirect('/');
        }

        const teacher = await getAccountDetail(sess.userID, 1);
        const students = await getStudentInResponsibility(sess.userID, req.query.query);
        
        const notifications = await getNotifications(students, {month: req.query.month, year: req.query.year});

        await updateUnReadToRead(notifications.notifyDetail);
        sess.notifications = 0;

        res.render("teacher/teacher_notifications.ejs", { webTitle: "แจ้งเตือน", account: teacher, students: students, notifications: notifications, role: "teacher", getParams: req.query })
    },

    teacherStudentsListPage: async(req, res) => {
        sess = req.session;

        if (sess.role != 1) {
            return res.redirect(`/${roleIdToRoleName(sess.role)}`);
        } else if (typeof sess.role == "undefined") {
            return res.redirect('/');
        }

        const teacher = await getAccountDetail(sess.userID, sess.role);
        const students = await getStudentInResponsibility(sess.userID, req.query.query);
        
        const getStudentsBalance = async(students) => {
            const studentsBalance = {};
            for (const student of students) {
                const transactionDetail = await getTransactionDetail(student.studentID);
                studentsBalance[student.studentID] = transactionDetail.balance
            }
            return studentsBalance;
        }
        const studentsBalance = await getStudentsBalance(students);
        res.render("teacher/teacher_students.ejs", { webTitle: "จัดการทุนนักศึกษา", account: teacher, students: students, studentsBalance: studentsBalance, role: roleIdToRoleName(sess.role) })
    },

    teacherScholarshipPage: async(req, res) => {
        sess = req.session;

        if (sess.role != 1) {
            return res.redirect(`/${roleIdToRoleName(sess.role)}`);
        } else if (typeof sess.role == "undefined") {
            return res.redirect('/');
        }

        const teacher = await getAccountDetail(sess.userID, sess.role);
        const scholarships = await getScholarshipsInResponsibility(sess.userID);

        statusParams = "";
        if (typeof sess.status !== "undefined"){
            statusParams = sess.status;
            delete sess.status;
        }

        res.render("teacher/teacher_addScholarship.ejs", { webTitle: "จัดการทุนนักศึกษา", account: teacher, role: roleIdToRoleName(sess.role),scholarships: scholarships, status: statusParams, studentID: req.params.studentID })
    },

    teacherApplicationUsersPage: async(req, res) => {
        sess = req.session
        
        if (sess.role != 1) {
            return res.redirect(`/${roleIdToRoleName(sess.role)}`);
        } else if (typeof sess.role == "undefined") {
            return res.redirect('/');
        }

        const teacher = await getAccountDetail(sess.userID, sess.role);
        const applicationUsers = await getApplicationUserInResponsibility(sess.userID, req.query.query);

        res.render('teacher/teacher_applyScholarship.ejs', {webTitle: "ผู้สมัครขอทุน", account: teacher, role: roleIdToRoleName(sess.role), applicationUsers: applicationUsers, getParams: req.query.query })
    }
}