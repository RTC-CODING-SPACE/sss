getTransactionByID = async(transactionID) => {
    return await databaseQuery(`SELECT * FROM expenselists WHERE listID=${transactionID}`)
}

module.exports = {
    studentIndexPage: async(req, res) => {
        sess = req.session;

        if (sess.role != 2) {
            return res.redirect(`/${roleIdToRoleName(sess.role)}`);
        } else if (typeof sess.role == "undefined") {
            return res.redirect('/');
        }

        const student = await getAccountDetail(sess.userID, sess.role);
        const transactions = await getTransactionDetail(sess.userID);

        return res.render("student/student_index.ejs", { webTitle: "หน้าหลัก | นักเรียน", account: student, transactionsDetail: transactions, role: roleIdToRoleName(sess.role) });
    },

    studentScholarshipPage: async(req, res) => {
        sess = req.session;

        if (sess.role != 2) {
            return res.redirect(`/${roleIdToRoleName(sess.role)}`);
        } else if (typeof sess.role == "undefined") {
            return res.redirect('/');
        }

        const student = await getAccountDetail(sess.userID, 2);
        const scholarships = await getScholarships(req.query.query);
        const appliedScholarships = await getAppliedScholarships(sess.userID);
        
        res.render(
            "student/student_scholarship.ejs",
            { webTitle: "ทุนการศึกษา",
            account: student,
            role: roleIdToRoleName(sess.role),
            scholarships: scholarships,
            queryParams: req.query.query,
            appliedScholarships: appliedScholarships})
    },

    studentGraphPage: async(req, res) => {
        sess = req.session;

        if (sess.role != 2) {
            return res.redirect(`/${roleIdToRoleName(sess.role)}`);
        } else if (typeof sess.role == "undefined") {
            return res.redirect('/');
        }
        
        const student = await getAccountDetail(req.params.studentID, 2);
        const transactions = await getTransactionDetail(req.params.studentID, {month: req.query.month, year: req.query.year});

        if (typeof req.query.print == "undefined") return res.render("student/student_graph.ejs", { webTitle: "สรุุปค่าใช้จ่าย", account: student, role: "student", transactionsDetail: transactions, getParams: req.query });
        return res.render("student/student_graphPrint.ejs", { webTitle: "สรุุปค่าใช้จ่าย", account: student, role: "student", transactionsDetail: transactions, getParams: req.query });
        
    },

    studentTransactionsPage: async(req, res) => {
        sess = req.session;

        if (sess.role != 2 && sess.role != 1) {
            return res.redirect(`/${roleIdToRoleName(sess.role)}`);
        } else if (typeof sess.role == "undefined") {
            return res.redirect('/');
        }

        const account = await getAccountDetail(sess.userID, sess.role);
        const student = await getAccountDetail(req.params.studentID, 2);
        const transactions = await getTransactionDetail(req.params.studentID, {month: req.query.month, year: req.query.year});

        res.render("student/student_transactions.ejs", { webTitle: "ประวัติการใช้จ่าย", account: account, student: student, role: roleIdToRoleName(sess.role), transactionsDetail: transactions, getParams: req.query });
    },

    studentExpensePage: async(req, res) => {
        sess = req.session;

        if (sess.role != 2) {
            return res.redirect(`/${roleIdToRoleName(sess.role)}`);
        } else if (typeof sess.role == "undefined") {
            return res.redirect('/');
        }

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

    studentActivitiesPage: async(req, res) => {
        sess = req.session;

        if (sess.role != 2) {
            return res.redirect(`/${roleIdToRoleName(sess.role)}`);
        } else if (typeof sess.role == "undefined") {
            return res.redirect('/');
        }

        const student = await getAccountDetail(sess.userID, sess.role);
        const activities = await getActivities(sess.userID, {month: req.query.month, year: req.query.year});

        if (req.query.print) return res.render("student/student_activitiesPrint.ejs", { webTitle: "กิจกรรม", account: student, role: roleIdToRoleName(sess.role), getParams: req.query, activities: activities });
        return res.render("student/student_activities.ejs", { webTitle: "กิจกรรม", account: student, role: roleIdToRoleName(sess.role), getParams: req.query, activities: activities });
    },

    studentActivityPage: async(req, res) => {
        sess = req.session;

        if (sess.role != 2) {
            return res.redirect(`/${roleIdToRoleName(sess.role)}`);
        } else if (typeof sess.role == "undefined") {
            return res.redirect('/');
        }

        statusParams = "";
        if (typeof sess.status !== "undefined"){
            statusParams = sess.status;
            delete sess.status;
        } 

        if (req.query.mode == 'add') {
            const student = await getAccountDetail(sess.userID, 2);
            res.render("student/student_addActivity.ejs", { webTitle: "เพิ่มกิจกรรม", account: student, role: "student", mode: "add", status: statusParams})
        }

        if (req.query.mode == "edit") {
            const student = await getAccountDetail(sess.userID, 2);
            const activity = await getActivityByID(req.params.activityID);

            res.render("student/student_addActivity.ejs", { webTitle: "แก้ไขกิจกรรม", account: student, role: "student", mode: "edit", status: statusParams, activity: activity})
        }
    },

    studentAchievementsPage: async(req, res) => {
        sess = req.session;

        if (sess.role != 2) {
            return res.redirect(`/${roleIdToRoleName(sess.role)}`);
        } else if (typeof sess.role == "undefined") {
            return res.redirect('/');
        }
        
        const student = await getAccountDetail(sess.userID, sess.role);
        const achievements = await getAchievements(sess.userID, {month: req.query.month, year: req.query.year});
        if (req.query.print) return res.render("student/student_achievementsPrint.ejs", { webTitle: "ผลงาน", account: student, role: roleIdToRoleName(sess.role), getParams: req.query, achievements: achievements });
        res.render("student/student_achievements.ejs", { webTitle: "ผลงาน", account: student, role: roleIdToRoleName(sess.role), getParams: req.query, achievements: achievements });
    },

    studentAchievementPage: async(req, res) => {
        sess = req.session;

        if (sess.role != 2) {
            return res.redirect(`/${roleIdToRoleName(sess.role)}`);
        } else if (typeof sess.role == "undefined") {
            return res.redirect('/');
        }

        statusParams = "";
        if (typeof sess.status !== "undefined"){
            statusParams = sess.status;
            delete sess.status;
        } 

        if (req.query.mode == 'add') {
            const student = await getAccountDetail(sess.userID, 2);
            res.render("student/student_Addachievement.ejs", { webTitle: "เพิ่มผลงาน", account: student, role: "student", mode: "add", status: statusParams})
        }

        if (req.query.mode == "edit") {
            const student = await getAccountDetail(sess.userID, 2);
            const achievement = await getAchievementByID(req.params.achievementID);

            res.render("student/student_Addachievement.ejs", { webTitle: "แก้ไขผลงาน", account: student, role: "student", mode: "edit", status: statusParams, achievement: achievement})
        }
    }
}