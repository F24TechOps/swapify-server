import app from './index.js';

const PORT = process.env.NODE_ENV === "test" ? 5502 : process.env.PORT || 5501;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default server;
