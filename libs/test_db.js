const {databaseQuery, getAccountDetail, getTransactionDetail} = require('./database')

test_data = { "id": 1, "name": 'pat', "surname": 'tk' }

test = async() => {
    const students = await getNotifications([{studentID: 63209010016}]);
    console.log(students)
    return 0;
}

test()