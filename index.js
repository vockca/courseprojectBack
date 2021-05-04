const express = require('express');
const app = express();
const port = process.env.port || 3000;

app.get('/', (req, res) => {
    res.set('Access-Control-Allow-Origin', '*')
    res.send(JSON.stringify('Hello World!'));
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});