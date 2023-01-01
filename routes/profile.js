module.exports = {
    profilePage: async(req, res) => {
        req.sess

        switch (req.params.role) {
            case "student": roleID = 2; webTitle = "โปรไฟล์ | นักเรียน"; break;
            case "teacher": roleID = 1;  webTitle = "โปรไฟล์ | อาจารย์";break;
            case "admin": roleID = 0;  webTitle = "โปรไฟล์ | ผู้ดูแลระบบ";break;
        }

        if (req.query.mode == "edit") {

            const account = await getAccountDetail(sess.userID, sess.role);
            const target = await getAccountDetail(req.params.userID, roleID);
            const departments = await databaseQuery("SELECT * FROM department");
            console.log(target)
            statusParams = "";
            if (typeof sess.status !== "undefined"){
                statusParams = sess.status;
                delete sess.status;
            }

            return res.render(`${req.params.role}/${req.params.role}_profile.ejs`, {webTitle: webTitle,account:account, target: target,departments: departments, mode: "edit", role: roleIdToRoleName(sess.role), status: statusParams});
        }
        
        if (req.query.mode == "add") {
            const account = await getAccountDetail(sess.userID, sess.role);
            const departments = await databaseQuery("SELECT * FROM department");

            statusParams = "";
            if (typeof sess.status !== "undefined"){
                statusParams = sess.status;
                delete sess.status;
            }
            return res.render(`${req.params.role}/${req.params.role}_profile.ejs`, {webTitle: webTitle,account:account,departments: departments, mode: "add", role: roleIdToRoleName(sess.role), status: statusParams});
        }
    }
}