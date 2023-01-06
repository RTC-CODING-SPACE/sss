module.exports = {
    searchScholarships: async(req, res) => {
        sess = req.session;
        res.redirect(`/studentScholarship/?query=${req.body.query}`);
    },
    searchTransaction: async(req, res) => {
        sess = req.session;
        
        printParam = ""
        if(typeof req.body.print !== "undefined") printParam = "&print=true";

        res.redirect(`/${req.params.page}/${req.params.studentID}/?month=${req.body.month}&year=${req.body.year}${printParam}`);
    },
    searchNotifications: async(req, res) => {
        sess = req.session;

        res.redirect(`/${req.params.page}/?month=${req.body.month}&year=${req.body.year}`);
    },

    searchStudent: async(req, res) => {
        sess.req.session
        res.redirect(`/${req.params.page}/?query=${req.body.query}`);
    },

    searchUser: async(req, res) => {
        sess.req.session
        res.redirect(`/${req.params.page}/?query=${req.body.query}`);
    },
}