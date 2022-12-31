module.exports = {
    getScholarshipsPage: (req, res) => {
        let query = "SELECT * FROM scholarship";
        db.query(query, (err, result) => {
            if (err) {
                console.log(err);
                throw err;
            }
            // console.log(result);
            res.render('index_scholarships.ejs', {webTitle: "ทุนการศึกษา", scholarships: result});
        })
    }
}