const path = require('path');
const md5 = require("md5");

module.exports = {
    teacherIndexPage: async(req, res) => {
        sess = req.session

        const teacher = await getAccountDetail(sess.userID, 1);
        const students = await getStudentsByName(req.query.query);
        
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

    teacherStudentsListPage: async(req, res) => {
        sess = req.session;

        const teacher = await getAccountDetail(sess.userID, sess.role);
        const students = await getStudentsByName(req.query.query);
        
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
        const teacher = await getAccountDetail(sess.userID, sess.role);
        const scholarships = await getScholarships();

        statusParams = "";
        if (typeof sess.status !== "undefined"){
            statusParams = sess.status;
            delete sess.status;
        }

        res.render("teacher/teacher_addScholarship.ejs", { webTitle: "จัดการทุนนักศึกษา", account: teacher, role: roleIdToRoleName(sess.role),scholarships: scholarships, status: statusParams, studentID: req.params.studentID })
    },
    
    addFund: async(req, res) => {
        sess = req.session;

        console.log(req.body);

        await databaseQuery(`INSERT INTO scholarshiplists SET amount=${req.body.amount}, tag="${req.body.tag}", scholarshipID=1, studentID="${req.params.studentID}"`);
        sess.status = {status: "success", text: "ADDED SCHOLARSHIP SUCCESSFULLY"};
        res.redirect(`/addScholarship/${req.params.studentID}`);
    }
}