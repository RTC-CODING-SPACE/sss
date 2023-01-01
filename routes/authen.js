module.exports = {
    login: async(req, res) => {
        sess = req.session

        if (req.params.role == "student") {
            var account = await login(req.body.userID, req.body.password, "student");
            if (account) {
                sess.userID = account.userID;
                sess.role = account.role;
                return res.redirect('/student');
            }
        }

        if (req.params.role == "teacher") {
            var account = await login(req.body.userID, req.body.password, "teacher");
            if (account) {
                sess.userID = account.userID;
                sess.role = account.role;
                if (account.role == 1) return res.redirect('/teacher');
                return res.redirect('/admin');
            }
        }

        sess.status = {stauts: "failed", text: "ID / PASSWORD IS INCORRECT"};
        res.redirect(`/login/${req.params.role}`);
    },
    
    logout: (req, res) => {
        req.session.destroy();
        res.redirect('/');
    }
}