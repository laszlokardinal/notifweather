const mongoose = require('../../common/services/mongoose.service').mongoose;
const Schema = mongoose.Schema;
const functions = require('./functions');
mongoose.set('useFindAndModify', false);

const userSchema = new Schema({
    email: String,
    password: String,
    number: String,
    time: String,
    city: String,
    state: Boolean
});

userSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

// Ensure virtual fields are serialised.
userSchema.set('toJSON', {
    virtuals: true
});

userSchema.findById = function (cb) {
    return this.model('Users').find({id: this.id}, cb);
};

const User = mongoose.model('Users', userSchema);

exports.findById = (id) => {
    return User.findById(id)
        .then((result) => {
            result = result.toJSON();
            delete result._id;
            delete result.__v;
            return result;
        });
};

exports.createUser = (userData) => {
    const user = new User(userData);
    return user.save();
};

exports.list = (perPage, page) => {
    return new Promise((resolve, reject) => {
        User.find()
            .limit(perPage)
            .skip(perPage * page)
            .exec(function (err, users) {
                if (err) {
                    reject(err);
                } else {
                    resolve(users);
                }
            })
    });
};

exports.patchUser = (email, userData) => {
    return User.findOneAndUpdate({
        _email: email
    }, userData);
};

exports.removeById = (userId) => {
    return new Promise((resolve, reject) => {
        User.deleteMany({_id: userId}, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(err);
            }
        });
    });
};

exports.check = async (city) => {
    city = city.toLowerCase();
    let temp = await functions.getData(city);
    return(temp);
};

exports.findByEmail = async (email) => {
    return User.find({email: email});
};

exports.subscribe = async (city, number, email, time, state) => {
    functions.subscribeTextNotifs(city, number, time, state);
    functions.subscribeEmailNotifs(city, email, time, state);
};

exports.verifyCity = async (city) => {
    let state = await functions.verifyCity(city);
    return(state);
};