const md5 = require("md5");
const path = require('path');

module.exports = {
    adminIndexPage: async(req, res) => {
        sess = req.session

        if (sess.role != 0) {
            return res.redirect(`/${roleIdToRoleName(sess.role)}`);
        } else if (typeof sess.role == "undefined") {
            return res.redirect('/');
        }

        const account = await getAccountDetail(sess.userID, sess.role);
        const students = await getStudentsByName(req.query.query);
        const teachers = await getTeachersByName(req.query.query);

        const users = [...students, ...teachers];
        res.render('admin/admin_index.ejs', { webTitle: "หน้าหลัก | ผู้ดูแลระบบ", account: account, users: users, role: roleIdToRoleName(sess.role), queryParams: req.query.query })
    }, 

    adminCreateScholarshipPage: async(req, res) => {
        sess = req.session;

        if (sess.role != 0) {
            return res.redirect(`/${roleIdToRoleName(sess.role)}`);
        } else if (typeof sess.role == "undefined") {
            return res.redirect('/');
        }

        if(req.params.mode == "add") {
            const account = await getAccountDetail(sess.userID, sess.role);
            const teachers = await getTeachersByName(req.query.query);

            statusParams = "";
            if (typeof sess.status !== "undefined"){
                statusParams = sess.status;
                delete sess.status;
            }

            res.render('admin/admin_scholarship.ejs', { webTitle: "สร้างทุนการศึกษา", account: account,teachers: teachers, role: roleIdToRoleName(sess.role), mode: "add", status: statusParams });
        }
    },

    createFund: async(req, res) => {
        sess = req.session;

        if (sess.role != 0) {
            return res.redirect(`/${roleIdToRoleName(sess.role)}`);
        } else if (typeof sess.role == "undefined") {
            return res.redirect('/');
        }

        await databaseQuery(`INSERT INTO scholarship SET name="${req.body.name}", prize="${req.body.prize}", detail="${req.body.detail}"`);
        sess.status = {status: "success", text: "CREATED NEW SCHOLARSHIP SUCCESSFULLY"};
        res.redirect('/createScholarship/add/0');
    },

    adminUsersListPage: async(req, res) => {
        sess = req.session

        if (sess.role != 0) {
            return res.redirect(`/${roleIdToRoleName(sess.role)}`);
        } else if (typeof sess.role == "undefined") {
            return res.redirect('/');
        }
        
        const account = await getAccountDetail(sess.userID, sess.role);
        const students = await getStudentsByName(req.query.query);
        const teachers = await getTeachersByName(req.query.query);

        const users = [...students, ...teachers];
        res.render('admin/admin_usersList.ejs', { webTitle: "ผู้ใช้งานทั้งหมด", account: account, users: users, role: roleIdToRoleName(sess.role), queryParams: req.query.query  })
    },
}