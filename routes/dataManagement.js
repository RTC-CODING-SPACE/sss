const md5 = require("md5");

module.exports = {
    addData: async(req, res) => {
        sess = req.session;
        
        // ADD EXPENSE
        if (req.params.dataType == "expense") {
            const fileName = uploadToServer(req.query.studentID, req.files.picture, "transactions");
            req.body.studentID = req.query.studentID;
            req.body.picture = fileName;
            
            await insertDB("expenselists", req.body);

            const student = await getAccountDetail(req.query.studentID, 2);
            const transactions = await getTransactionDetail(req.query.studentID);
            sess.status = {status: "success", text: "ADDED TRANSACTION SUCCESSFULLY."}

            res.render(
                "student/student_expense.ejs",
                {
                    webTitle: "เพิ่มค่าใช้จ่าย",
                    account: student,
                    role: "student",
                    mode:"add",
                    transactionsDetail: transactions,
                    formAction: `/add/expense/?studentID=${sess.UserID}`,
                    status: {status: "success",
                    text: "ADDED SUCCESFULLY"
                }}
            );
        }

        if (req.params.dataType == "profile") {
            req.body.password = md5(req.body.password);

            const userID = req.body.studentID || req.body.IDcard || req.body.username

            if (req.files) {
                const fileName = uploadToServer(userID, req.files.picture, "profile");
                req.body.picture = fileName;
            }

            await insertDB(req.query.role, req.body);

            sess.status = {status: "success", text: "ADDED NEW STUDENT TO SYSTEM."}
            return res.redirect(`/profile/${req.query.role}/0/?mode=add`);
        }

        if (req.params.dataType == "scholarshipFund") {

            req.body.studentID = req.query.studentID
            await insertDB("scholarshiplists", req.body);
            sess.status = {status: "success", text: "ADDED SCHOLARSHIP SUCCESSFULLY"};
            return res.redirect(`/AddScholarShip/${req.query.studentID}`);
        }

        if (req.params.dataType == "scholarship") {
            await insertDB("scholarship", req.body);
            sess.status = {status: "success", text: "ADDED SCHOLARSHIP SUCCESSFULLY"};
            return res.redirect('/createScholarship/add/0');
        }
    },

    editData: async(req, res) => {
        sess = req.session;
        
        if (req.params.dataType == "expense") {
            if (req.files) {
                const fileName = uploadToServer(sess.userID, req.files.picture, "transactions");
                req.body.picture = fileName;
            }

            await updateDB("expenselists", req.body, `listID="${req.query.listID}"`)
            sess.status = {status: "success", text: "EDITED TRANSACTION SUCCESSFULLY."}

            res.redirect(`/expense/${req.query.listID}/?mode=edit`)
        }

        if (req.params.dataType == "profile") {
            const userID = req.query.studentID || req.query.IDcard || req.query.username

            if (req.query.studentID) role = "student";
            if (req.query.IDcard) role = "teacher";
            if (req.query.username) role = "admin";
            
            if (req.files) {
                const fileName = uploadToServer(userID, req.files.picture, "profile");
                req.body.picture = fileName;
            }

            (req.body.password == "") ? delete req.body.password : md5(req.body.password);
            await updateDB(role, req.body, `${Object.keys(req.query)[0]}= "${userID}"`)
            sess.status = {status: "success", text: "UPDATED PROFILE SUCCESSFULLY"}

            return res.redirect(`/profile/${role}/${userID}/?mode=edit`);
        }
    },

    deleteData:async(req, res) => {
        sess = req.session;
        
        if (req.params.dataType == "expense") {
            await deleteDB("expenselists", `listID=${req.query.listID}`);

            res.redirect(`/transactions/${sess.userID}`);
        }

        if (req.params.dataType == "user") {
            await deleteDB(req.query.role, `${Object.keys(req.query)[0]}=${Object.values(req.query)[0]}`);

            res.redirect(`/${req.query.page}`);
        }
    },
}