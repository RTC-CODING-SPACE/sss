module.exports = {
    indexPage: (req, res) => {
        sess = req.session;

        const authToken = req.cookies.auth_token
        if (authToken) {
            const authTokenDecoded = jwt.verify(authToken, "rtcsss");
            sess.userID = authTokenDecoded.userID;
            sess.role = authTokenDecoded.role;
        }
        
        if (sess.userID) {
            return res.redirect(`/${roleIdToRoleName(sess.role)}`);
        }

        return res.render('index/index.ejs', { webTitle: "หน้าหลัก" });
    },

    indexScholarshipsPage: async(req, res) => {
        sess = req.session;

        if (sess.userID) {
            return res.redirect(`/${roleIdToRoleName(sess.role)}`);
        }

        const scholarships = await databaseQuery("SELECT * FROM scholarship")
        res.render('index/index_scholarship.ejs', {webTitle: "ทุนการศึกษา", scholarships: scholarships});
    },

    indexContactPage: (req, res) => {
        sess = req.session;

        if (sess.userID) {
            return res.redirect(`/${roleIdToRoleName(sess.role)}`);
        }

        res.render('index/index_contact.ejs', { webTitle: "ติดต่อสอบถาม" });
    },

    indexAboutPage: (req, res) => {
        sess = req.session;

        if (sess.userID) {
            return res.redirect(`/${roleIdToRoleName(sess.role)}`);
        }

        res.render('index/index_about.ejs', { webTitle: "เกี่ยวกับเรา" });
    },

    indexLoginPage: (req, res) => {
        sess = req.session;

        if (sess.userID) {
            return res.redirect(`/${roleIdToRoleName(sess.role)}`);
        }

        statusParams = "";
        if (typeof sess.status !== "undefined"){
            statusParams = sess.status;
            delete sess.status;
        };

        if (req.params.role == "student") res.render('index/student_login.ejs', { webTitle: "เข้าสู่ระบบ | นักเรียน", status: statusParams });
        if (req.params.role == "teacher") res.render('index/teacher_login.ejs', { webTitle: "เข้าสู่ระบบ | อาจารย์", status: statusParams });
    },

    indexApplicationPage: async(req, res) => {
        sess = req.session;

        if (sess.userID) {
            return res.redirect(`/${roleIdToRoleName(sess.role)}`);
        }
        
        const departments = await databaseQuery("SELECT * FROM department");
        const scholarships = await databaseQuery("SELECT * FROM scholarship")

        statusParams = "";
        if (typeof sess.status !== "undefined"){
            statusParams = sess.status;
            delete sess.status;
        };

        res.render('index/index_application', {webTitle: "สมัครขอทุนการศึกษา", departments: departments,scholarships: scholarships,step: req.query.step, status: statusParams })
    }
}