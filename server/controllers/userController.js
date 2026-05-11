const mongoose = require('mongoose');
const User = require('../models/User');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const registerUser = async (req, res) => {
	try {
		const { name, email, password } = req.body;

		if (!name || !email || !password) {
			return res.status(400).json({ message: 'Name, email, and password are required' });
		}

		const existingUser = await User.findOne({ email: email.toLowerCase() });

		if (existingUser) {
			return res.status(409).json({ message: 'Email already exists' });
		}

		const user = await User.create({ name, email, password });

		return res.status(201).json(user);
	} catch (error) {
		if (error.code === 11000) {
			return res.status(409).json({ message: 'Email already exists' });
		}

		return res.status(400).json({ message: error.message });
	}
};

const getAllUsers = async (req, res) => {
	try {
		const users = await User.find().sort({ createdAt: -1 });
		return res.status(200).json(users);
	} catch (error) {
		return res.status(500).json({ message: 'Failed to fetch users' });
	}
};

const getUserById = async (req, res) => {
	try {
		const { id } = req.params;

		if (!isValidObjectId(id)) {
			return res.status(400).json({ message: 'Invalid user ID' });
		}

		const user = await User.findById(id);

		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		return res.status(200).json(user);
	} catch (error) {
		return res.status(500).json({ message: 'Failed to fetch user' });
	}
};

const updateUser = async (req, res) => {
	try {
		const { id } = req.params;
		const { name, email, password } = req.body;

		if (!isValidObjectId(id)) {
			return res.status(400).json({ message: 'Invalid user ID' });
		}

		const user = await User.findById(id).select('+password');

		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		if (email && email.toLowerCase() !== user.email) {
			const duplicateEmail = await User.findOne({ email: email.toLowerCase(), _id: { $ne: id } });

			if (duplicateEmail) {
				return res.status(409).json({ message: 'Email already exists' });
			}

			user.email = email.toLowerCase();
		}

		if (name) {
			user.name = name;
		}

		if (password) {
			user.password = password;
		}

		await user.save();

		return res.status(200).json(user);
	} catch (error) {
		if (error.code === 11000) {
			return res.status(409).json({ message: 'Email already exists' });
		}

		return res.status(400).json({ message: error.message });
	}
};

const deleteUser = async (req, res) => {
	try {
		const { id } = req.params;

		if (!isValidObjectId(id)) {
			return res.status(400).json({ message: 'Invalid user ID' });
		}

		const user = await User.findByIdAndDelete(id);

		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		return res.status(200).json({ message: 'User deleted successfully' });
	} catch (error) {
		return res.status(500).json({ message: 'Failed to delete user' });
	}
};

module.exports = {
	registerUser,
	getAllUsers,
	getUserById,
	updateUser,
	deleteUser,
};
