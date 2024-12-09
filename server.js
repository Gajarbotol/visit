const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware to parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the HTML form
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle form submission
app.post('/visit', async (req, res) => {
    const url = req.body.url;
    const visitCount = parseInt(req.body.count, 10);

    if (!url || isNaN(visitCount) || visitCount < 1) {
        return res.status(400).send('Valid URL and visit count are required');
    }

    let successfulVisits = 0;
    let errors = [];

    for (let i = 0; i < visitCount; i++) {
        let browser;
        try {
            browser = await puppeteer.launch({ headless: true });
            const page = await browser.newPage();
            await page.goto(url, { waitUntil: 'networkidle2' });

            const screenshotPath = `screenshot-${i + 1}-${Date.now()}.png`;
            await page.screenshot({ path: screenshotPath });
            successfulVisits++;
        } catch (error) {
            errors.push(`Visit ${i + 1} failed: ${error.message}`);
        } finally {
            if (browser) {
                await browser.close();
            }
        }
    }

    res.send(`Completed ${successfulVisits} out of ${visitCount} visits.<br>` +
             `Errors: ${errors.length ? errors.join('<br>') : 'None'}`);
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
