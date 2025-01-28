import app from './index.js';

const PORT = process.env.NODE_ENV === "test" ? 5502 : process.env.PORT || 5500;

app.listen(PORT, () => {
 console.log(`Server is running on port ${PORT}`);
});
