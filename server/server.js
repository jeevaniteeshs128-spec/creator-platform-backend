const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
	res.json({ message: 'Creator Platform API is running' });
});

app.use('/api/users', userRoutes);

const startServer = async () => {
	await connectDB();

	app.listen(port, () => {
		console.log(`Server running on port ${port}`);
	});
};

startServer();

module.exports = app;
