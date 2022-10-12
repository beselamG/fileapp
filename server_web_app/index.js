const app = require('./app.js');
//Test comment
require('dotenv').config();
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
