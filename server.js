const express = require('express');
import routes from './routes';
const port = process.env.PORT || '5000'

const app = express();
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

routes(app);
