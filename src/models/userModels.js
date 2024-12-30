const crypto = require('crypto')
const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs');
const { type } = require('os');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'User must have name.']
        
    },
    email: {
        type: String,
        required: [true, 'User must have Email'],
        unique: [true, 'User Email must have Unique.'],
        lowercase: true,
        validate: [validator.isEmail, 'Please provide the validate Email']

    },
    photo: {
        type: String
    },
    role: {
        type: String,
        enum: ['admin', 'user', 'guide', 'lead-guide'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'User must have password.'],
        minlength: 8,
        select: false
    },
    passwordConform: {
        type: String,
        validate: {
            /*      This only work on CREATE and SAVE    */
            validator: function(el){
                return el === this.password;
            },
            message: 'password is not same'
        }
    }, 
    passwordChange: {
        type: Date
    },
    passwordResetToken: String,
    passwordResetExpire: Date,
    active:{
        type: Boolean,
        default: true,
        select: false
    }
});

userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12)

    this.passwordConform = undefined;
    next();
});

userSchema.pre('save', function(next){
    if(!this.isModified('password') || this.isNew){
        return next();
    }
    this.passwordChange = Date.now() - 1000;
    next()
});


/* /^find/  regular expression  */ 
userSchema.pre(/^find/, function(next){
    this.find({ active: true });
    next()
});

userSchema.methods.correctPassword = async function(candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword, userPassword)
}

userSchema.methods.changePasswordAfter = function(JWTTimestamp){
    if(this.passwordChange){
        const changeTimeStamp = parseInt(this.passwordChange.getTime()/1000, 10)
        console.log( changeTimeStamp, JWTTimestamp );
        return JWTTimestamp < changeTimeStamp /*  */
    }
    /*  False means NOT Change. */
    return false;
}

userSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex');
    /*  we don't save the plain reset token in database for the we hash the token */
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex')
        
    this.passwordResetExpire = Date.now() + 10 * 60 * 1000
    console.log('Plain reset token stored in DB:', resetToken);
    console.log('crypto password : ', this.passwordResetToken);
    
    return resetToken
}

const user = mongoose.model('user', userSchema);

module.exports = user;