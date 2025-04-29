const express = require('express');
const app = express();
const port = 3000;
const path = require('path');

// support for encoded URLs and static files
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send('User-agent: *\nDisallow:');
});

// Serve the HTML page for the instructions
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Vulnerable endpoint: it accepts a parameter and injects it in an HTML response, without prior sanitization
app.get('/greet', (req, res) => {
    // gets a parameter called "name" from the URL. If not provided, it falls back to Guest
    const name = req.query.name || 'Guest';
    const responseHtml = 
    `<html>
      <body>
        <h1>Welcome, ${name}!</h1>
        <p>This page is vulnerable to Cross-Site Scripting (XSS).</p>
      </body>
    </html>`;
    res.send(responseHtml);
});

// Vulnerable endpoint: code injection is provided by the bad function eval
app.get('/calculate', (req, res) => {
    const expression = req.query.expr;
    if (!expression) {
        return res.send("Please provide an expression, e.g.: /calculate?expr=2%2B2");
    }
    try {
        let result = eval(expression);
        const responseHtml = 
        `<html>
          <body>
            <h1>Welcome! The result of your expression is: ${result}!</h1>
            <p>This page is vulnerable, but not limited to, Code Injection.</p>
          </body>
        </html>`;
        res.send(responseHtml);
    } catch (error) {
        res.send(`Error in evaluating expression: ${error.message}`);
    }
});

app.listen(port, () => {
    console.log(`Bad microservice running on port ${port}`);
});
