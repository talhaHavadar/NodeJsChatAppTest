var mongoose = require("mongoose"),
    bcrypt = require("bcrypt-nodejs"),
    Schema = mongoose.Schema;

var UserSchema = Schema({
    name: String,
    chat_name: String,
    username: { type: String, required: true, index: { unique: true } },
    password: { type: String, required: true, select: false }
});

UserSchema.pre('save', function(next) {
    var user = this;
    
    if (!user.isModified('password')) {
        next();
    }
    
    bcrypt.hash(user.password, null, null, function(err, hash) {
        if (err)
            return next(err);
        user.password = hash;
        next();
    });
});

UserSchema.methods.comparePassword = function(password) {
    if (!password) {
        return false;
    }
    var user = this;
    return bcrypt.compareSync(password, user.password);
};

module.exports = mongoose.model('User', UserSchema);