const {databaseQuery, getAccountDetail, getTransactionDetail} = require('./database')

test_data = { "id": 1, "name": 'pat', "surname": 'tk' }

test = async() => {
    const students = await insertDB("test", test_data);
    console.log(students.affectedRows)
    return 0;
}

test()