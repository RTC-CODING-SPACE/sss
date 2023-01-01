module.exports = {
    indexPage: (req, res) => {
        sess = req.session;
        res.render('index/index.ejs', { webTitle: "หน้าหลัก" });
    },

    indexScholarshipsPage: async(req, res) => {
        sess = req.session;

        const scholarships = await databaseQuery("SELECT * FROM scholarship")
        res.render('index/index_scholarship.ejs', {webTitle: "ทุนการศึกษา", scholarships: scholarships});
    },

    indexContactPage: (req, res) => {
        sess = req.session;
        res.render('index/index_contact.ejs', { webTitle: "ติดต่อสอบถาม" });
    },

    indexAboutPage: (req, res) => {
        sess = req.session;
        res.render('index/index_about.ejs', { webTitle: "เกี่ยวกับเรา" });
    },

    indexLoginPage: (req, res) => {
        sess = req.session;

        statusParams = "";
        if (typeof sess.status !== "undefined"){
            statusParams = sess.status;
            delete sess.status;
        };

        if (req.params.role == "student") res.render('index/student_login.ejs', { webTitle: "เข้าสู่ระบบ | นักเรียน", status: statusParams });
        if (req.params.role == "teacher") res.render('index/teacher_login.ejs', { webTitle: "เข้าสู่ระบบ | อาจารย์", status: statusParams });
    },
}