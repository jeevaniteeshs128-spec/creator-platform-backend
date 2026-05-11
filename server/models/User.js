const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Name is required'],
			minlength: [2, 'Name must be at least 2 characters long'],
			trim: true,
		},
		email: {
			type: String,
			required: [true, 'Email is required'],
			unique: true,
			lowercase: true,
			trim: true,
			match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
		},
		password: {
			type: String,
			required: [true, 'Password is required'],
			minlength: [6, 'Password must be at least 6 characters long'],
			select: false,
		},
	},
	{
		timestamps: true,
	}
);

userSchema.pre('save', async function hashPassword(next) {
	if (!this.isModified('password')) {
		return next();
	}

	try {
		const salt = await bcrypt.genSalt(10);
		this.password = await bcrypt.hash(this.password, salt);
		return next();
	} catch (error) {
		return next(error);
	}
});

userSchema.set('toJSON', {
	transform(doc, ret) {
		delete ret.password;
		return ret;
	},
});

userSchema.set('toObject', {
	transform(doc, ret) {
		delete ret.password;
		return ret;
	},
});

module.exports = mongoose.model('User', userSchema);
