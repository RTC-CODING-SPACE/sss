const puppeteer = require('puppeteer');

module.exports = {
    searchScholarships: async(req, res) => {
        sess = req.session;
        res.redirect(`/studentScholarship/${req.body.query}`);
    },
    searchTransaction: async(req, res) => {
        sess = req.session;
        res.redirect(`/studentGraph/${req.params.studentID}/${req.body.month}/${req.body.year}`);
    },
    searchTransaction2: async(req, res) => {
        sess = req.session;
        res.redirect(`/transactions2/${req.params.studentID}/${req.body.month}/${req.body.year}`);
    },
    searchTransactionPrint: async(req, res) => {
        sess = req.session;
        res.redirect(`/studentGraphPrint/${req.params.studentID}/${req.body.month}/${req.body.year}`);
    },

    searchStudent: async(req, res) => {
        sess.req.session
        res.redirect(`/teacher/${req.body.query}`);
    },

    searchStudent2: async(req, res) => {
        sess.req.session
        res.redirect(`/students_list/${req.body.query}`);
    },

    searchUser: async(req, res) => {
        sess.req.session
        res.redirect(`/admin/${req.body.query}`);
    },

    searchUsers2: async(req, res) => {
        sess.req.session
        res.redirect(`/users_list/${req.body.query}`);
    }
}