getTransactionByID = async(transactionID) => {
    return await databaseQuery(`SELECT * FROM expenselists WHERE listID=${transactionID}`)
}

module.exports = {
    studentIndexPage: async(req, res) => {
        sess = req.session;

        const student = await getAccountDetail(sess.userID, sess.role);
        const transactions = await getTransactionDetail(sess.userID);

        res.render("student/student_index.ejs", { webTitle: "หน้าหลัก | นักเรียน", account: student, transactionsDetail: transactions, role: roleIdToRoleName(sess.role) });
    },

    studentScholarshipPage: async(req, res) => {
        sess = req.session;

        const student = await getAccountDetail(sess.userID, 2);
        const scholarships = await getScholarships(req.query.query);
        
        res.render("student/student_scholarship.ejs", { webTitle: "ทุนการศึกษา", account: student, role: roleIdToRoleName(sess.role), scholarships: scholarships })
    },

    studentGraphPage: async(req, res) => {
        sess = req.session;

        const student = await getAccountDetail(req.params.studentID, 2);
        const transactions = await getTransactionDetail(req.params.studentID, {month: req.query.month, year: req.query.year});

        if (typeof req.query.print == "undefined") return res.render("student/student_graph.ejs", { webTitle: "สรุุปค่าใช้จ่าย", account: student, role: "student", transactionsDetail: transactions, getParams: req.query });
        return res.render("student/student_graphPrint.ejs", { webTitle: "สรุุปค่าใช้จ่าย", account: student, role: "student", transactionsDetail: transactions, getParams: req.query });
        
    },

    studentTransactionsPage: async(req, res) => {
        sess = req.session;

        const account = await getAccountDetail(sess.userID, sess.role);
        const student = await getAccountDetail(req.params.studentID, 2);
        const transactions = await getTransactionDetail(req.params.studentID, {month: req.query.month, year: req.query.year});

        res.render("student/student_transactions.ejs", { webTitle: "ประวัติการใช้จ่าย", account: account, student: student, role: roleIdToRoleName(sess.role), transactionsDetail: transactions, getParams: req.query });
    },

    studentExpensePage: async(req, res) => {
        sess = req.session;

        statusParams = "";
        if (typeof sess.status !== "undefined"){
            statusParams = sess.status;
            delete sess.status;
        } 

        if(req.query.mode == "add"){
            const student = await getAccountDetail(sess.userID, 2);
            const transactions = await getTransactionDetail(sess.userID);

            res.render("student/student_expense.ejs", { webTitle: "เพิ่มค่าใช้จ่าย", account: student, role: "student", mode: "add", transactionsDetail: transactions, status: statusParams});
        }

        if(req.query.mode == "edit"){
            const student = await getAccountDetail(sess.userID, 2);
            const transactions = await getTransactionDetail(sess.userID);
            const transaction = await getTransactionByID(req.params.transactionID);

            res.render("student/student_expense.ejs", { webTitle: "แก้ไขค่าใช้จ่าย", account: student, role: "student", mode: "edit", transactionsDetail: transactions, transaction: transaction[0], status: statusParams});
        }
    },
}