const path = require('path');
const md5 = require("md5");

getTransactionByID = async(transactionID) => {
    return await databaseQuery(`SELECT * FROM expenselists WHERE listID=${transactionID}`)
}

getScholarships = async(queryName = "") => {
    queryParam = "";
    if (queryName !== "") queryParam = `WHERE name like '${queryName}%'`;
    return await databaseQuery(`SELECT * FROM scholarship ${queryParam}`);
}

module.exports = {
    getStudentHome: async(req, res) => {
        sess = req.session;
        const student = await getAccountDetail(sess.userID, 2);
        const transactions = await getTransactionDetail(sess.userID);
        res.render("student_index.ejs", { webTitle: "หน้าหลัก | นักเรียน", account: student, transactionsDetail: transactions, role: "student" });
    },

    getScholarshipPage: async(req, res) => {
        sess = req.session;
        const student = await getAccountDetail(sess.userID, 2);
        const scholarships = await getScholarships();
        res.render("student_scholarship.ejs", { webTitle: "ทุนการศึกษา", account: student, role: "student", scholarships: scholarships })
    },

    getScholarshipQueryPage: async(req, res) => {
        sess = req.session;
        const student = await getAccountDetail(sess.userID, 2);
        const scholarships = await getScholarships(req.params.query);
        res.render("student_scholarship.ejs", { webTitle: "ทุนการศึกษา", account: student, role: "student", scholarships: scholarships })
    },

    getGraphPage: async(req, res) => {
        sess = req.session;
        const student = await getAccountDetail(req.params.studentID, 2);
        const transactions = await getTransactionDetail(req.params.studentID);
        res.render("student_graph.ejs", { webTitle: "สรุุปค่าใช้จ่าย", account: student, role: "student", transactionsDetail: transactions });
    },

    getGraphQueryPage: async(req, res) => {
        sess = req.session;
        const student = await getAccountDetail(req.params.studentID, 2);
        const transactions = await getTransactionDetail(req.params.studentID, {month: req.params.month, year: req.params.year});
        res.render("student_graph.ejs", { webTitle: "สรุุปค่าใช้จ่าย", account: student, role: "student", transactionsDetail: transactions , getParams: req.params});
    },

    getPrintGraphQueryPage: async(req, res) => {
        sess = req.session;
        const student = await getAccountDetail(req.params.studentID, 2);
        const transactions = await getTransactionDetail(req.params.studentID, {month: req.params.month, year: req.params.year});
        res.render("student_graphPrint.ejs", { webTitle: "สรุุปค่าใช้จ่าย", account: student, role: "student", transactionsDetail: transactions , getParams: req.params});
    },

    getTransactionsPage: async(req, res) => {
        sess = req.session;
        const account = await getAccountDetail(sess.userID, sess.role);
        const student = await getAccountDetail(req.params.studentID, 2);
        const transactions = await getTransactionDetail(req.params.studentID);
        res.render("student_transactions.ejs", { webTitle: "ประวัติการใช้จ่าย", account: account, student: student, role: roleIdToRoleName(sess.role), transactionsDetail: transactions });
    },

    getTransactionsQueryPage: async(req, res) => {
        sess = req.session;
        const account = await getAccountDetail(sess.userID, sess.role);
        const student = await getAccountDetail(req.params.studentID, 2);
        const transactions = await getTransactionDetail(req.params.studentID, {month: req.params.month, year: req.params.year});
        res.render("student_transactions.ejs", { webTitle: "ประวัติการใช้จ่าย", account: account, student: student, role: roleIdToRoleName(sess.role), transactionsDetail: transactions });
    },

    getAddExpensePage: async(req, res) => {
        sess = req.session;
        if(req.params.mode == "add"){
            const student = await getAccountDetail(sess.userID, 2);
            const transactions = await getTransactionDetail(sess.userID);
            res.render("student_expense.ejs", { webTitle: "เพิ่มค่าใช้จ่าย", account: student, role: "student", mode: "add", transactionsDetail: transactions, formAction: `/addExpense/${sess.UserID}`});
        }
        if(req.params.mode == "edit"){
            const student = await getAccountDetail(sess.userID, 2);
            const transactions = await getTransactionDetail(sess.userID);
            const transaction = await getTransactionByID(req.params.transactionID);
            res.render("student_expense.ejs", { webTitle: "เพิ่มค่าใช้จ่าย", account: student, role: "student", mode: "edit", transactionsDetail: transactions, transaction: transaction[0], formAction: `/addExpense/${sess.UserID}`});
        }
    },

    addExpense: async(req, res) => {
        sess = req.session;
        const date = new Date();
        let picture = req.files.picture
        let fileEXT = picture.name.split(".")
        let fileName = `${req.params.studentID}-${date.getDate()}-${date.getMonth()}-${date.getFullYear()}.${fileEXT[fileEXT.length - 1]}`;
        let filePath = (path.join(__dirname, "..", `/public/assets/img/transactions/${fileName}`));

        picture.mv(filePath);
        await databaseQuery(`INSERT INTO expenselists SET studentID='${req.params.studentID}', tag='${req.body.tag}', amount=${req.body.amount}, detail='${req.body.detail}', picture='${fileName}'`);
        
        const student = await getAccountDetail(req.params.studentID, 2);
        const transactions = await getTransactionDetail(req.params.studentID);
        
        res.render("student_expense.ejs", { webTitle: "เพิ่มค่าใช้จ่าย", account: student, role: "student", mode: "add", transactionsDetail: transactions, formAction: `/addExpense/${sess.UserID}`, status: {status: "success", text: "ADDED SUCCESFULLY"}});
    },

    editExpense: async(req, res) => {
        sess = req.session;
        pictureParams = "";
        if (req.files) {
            const date = new Date();
            let picture = req.files.picture;
            let fileEXT = picture.name.split(".");
            let fileName = `${req.params.studentID}-${date.getDate()}-${date.getMonth()}-${date.getFullYear()}.${fileEXT[fileEXT.length - 1]}`;
            let filePath = (path.join(__dirname, "..", `/public/assets/img/transactions/${fileName}`));

            picture.mv(filePath);
            pictureParams = `, picture='${fileName}'`;
        }

        await databaseQuery(`UPDATE expenselists SET tag='${req.body.tag}', amount=${req.body.amount}, detail='${req.body.detail}' ${pictureParams} WHERE listID=${req.params.listID}`);
        res.redirect(`/expense/edit/${req.params.listID}`)
    },

    getEditProfilePage: async(req, res) => {
        sess = req.session;
        if(req.params.mode == "edit"){
            const account = await getAccountDetail(sess.userID, sess.role);
            const student = await getAccountDetail(req.params.studentID, 2);
            const departments = await databaseQuery("SELECT * FROM department");

            statusParams = "";
            if (typeof sess.status !== "undefined"){
                statusParams = sess.status;
                delete sess.status;
            } 

            res.render('student_profile.ejs', {webTitle: "โปรไฟล์ | นักเรียน",account:account, student: student,departments: departments, mode: "edit", role: roleIdToRoleName(sess.role), status: statusParams});
        }

        if(req.params.mode == "add") {
            const account = await getAccountDetail(sess.userID, sess.role);
            const departments = await databaseQuery("SELECT * FROM department");

            statusParams = "";
            if (typeof sess.status !== "undefined"){
                statusParams = sess.status;
                delete sess.status;
            }

            res.render('student_profile.ejs', {webTitle: "โปรไฟล์ | นักเรียน",account:account,departments: departments, mode: "add", role: roleIdToRoleName(sess.role), status: statusParams});
        }
    },

    editStudentProfile: async(req, res) => {
        sess = req.session;
        pictureParams = "";
        if( req.files) {
            const picture = req.files.picture;
            const fileEXT = picture.name.split('.');
            const fileName = `${req.params.studentID}.${fileEXT[fileEXT.length - 1]}`;
            const filePath = (path.join(__dirname, "..", `public/assets/img/profile/${fileName}`));

            picture.mv(filePath);
            pictureParams = `, picture='${fileName}'`;
        }

        (req.body.password == "") ? passwordParams = "" : passwordParams = `, password = "${md5(req.body.password)}"`;

        await databaseQuery(`UPDATE student SET studentID="${req.body.studentID}", name="${req.body.name}", dob="${req.body.dob}", phone="${req.body.phone}",level="${req.body.level}", departmentID=${req.body.departmentID}, email="${req.body.email}", address="${req.body.address}", teacherName="${req.body.teacherName}", gender="${req.body.gender}" ${passwordParams} ${pictureParams} WHERE studentID="${req.params.studentID}"`);
        sess.status = {status: "success", text: "UPDATED PROFILE SUCCESSFULLY"}
        res.redirect(`/studentProfile/edit/${req.params.studentID}`);
    }
}