# KDocs Data Extractor - Quick Start Guide

## 🎯 Overview

This project provides tools to extract data from KDocs (金山文档) shared links using browser automation. Since KDocs doesn't provide a public API for shared links, we use Puppeteer (JavaScript) or Selenium (Python) to automate browser interactions.

---

## ⚠️ Important Prerequisites

### 1. You MUST have:
- Valid KDocs account credentials (phone/email + password)
- Permission to access the shared document
- Node.js 16+ (for JavaScript version) OR Python 3.7+ (for Python version)

### 2. The shared link requires authentication:
The URL `https://www.kdocs.cn/l/cvbs6aq4axHu` redirects to a login page, so anonymous access is not possible.

---

## 🚀 Quick Start

### Option A: JavaScript (Puppeteer) - Recommended

#### Step 1: Install Dependencies
```bash
npm install
```

#### Step 2: Set Your Credentials
Edit `kdocs-puppeteer-example.js` or use environment variables:

**Option 1: Environment Variables (Secure)**
```bash
# Windows PowerShell
$env:KDOCS_USERNAME="your_phone_or_email"
$env:KDOCS_PASSWORD="your_password"
node kdocs-puppeteer-example.js

# Windows CMD
set KDOCS_USERNAME=your_phone_or_email
set KDOCS_PASSWORD=your_password
node kdocs-puppeteer-example.js

# Linux/Mac
export KDOCS_USERNAME="your_phone_or_email"
export KDOCS_PASSWORD="your_password"
node kdocs-puppeteer-example.js
```

**Option 2: Edit Config in File**
Open `kdocs-puppeteer-example.js` and modify:
```javascript
const CONFIG = {
  shareUrl: 'https://www.kdocs.cn/l/cvbs6aq4axHu',
  credentials: {
    username: 'YOUR_PHONE_OR_EMAIL',  // <-- Change this
    password: 'YOUR_PASSWORD'          // <-- Change this
  },
  // ...
};
```

#### Step 3: Run the Extractor
```bash
npm run extract
```

#### Step 4: Check Results
- Extracted data: `kdocs-data.csv`
- Screenshots: `step1-initial.png`, `step2-loaded.png`
- API calls: `api-calls.json` (if any found)

---

### Option B: Python (Selenium)

#### Step 1: Install Dependencies
```bash
pip install selenium webdriver-manager
```

#### Step 2: Set Your Credentials
Edit `kdocs-selenium-example.py` or use environment variables:

**Option 1: Environment Variables**
```bash
# Windows PowerShell
$env:KDOCS_USERNAME="your_phone_or_email"
$env:KDOCS_PASSWORD="your_password"
python kdocs-selenium-example.py

# Windows CMD
set KDOCS_USERNAME=your_phone_or_email
set KDOCS_PASSWORD=your_password
python kdocs-selenium-example.py

# Linux/Mac
export KDOCS_USERNAME="your_phone_or_email"
export KDOCS_PASSWORD="your_password"
python kdocs-selenium-example.py
```

**Option 2: Edit Config in File**
Open `kdocs-selenium-example.py` and modify:
```python
CONFIG = {
    'share_url': 'https://www.kdocs.cn/l/cvbs6aq4axHu',
    'credentials': {
        'username': 'YOUR_PHONE_OR_EMAIL',  # <-- Change this
        'password': 'YOUR_PASSWORD'          # <-- Change this
    },
    # ...
}
```

#### Step 3: Run the Extractor
```bash
python kdocs-selenium-example.py
```

#### Step 4: Check Results
- Extracted data: `kdocs-data.csv`
- Screenshots: `screenshots/` folder
- API calls: `api_calls.json` (if any found)

---

## 🔍 What the Scripts Do

### Automated Steps:
1. **Opens browser** (Chrome) with the KDocs shared link
2. **Detects login requirement** and handles authentication
3. **Waits for document** to fully load
4. **Takes screenshots** at each step for verification
5. **Extracts table data** from the spreadsheet
6. **Monitors network calls** to find API endpoints
7. **Saves data to CSV** file
8. **Logs all actions** for debugging

### Output Files:
- `kdocs-data.csv` - Extracted spreadsheet data
- `step1-initial.png` - Screenshot before login
- `step2-loaded.png` - Screenshot after document loads
- `api-calls.json` - List of API endpoints discovered
- `screenshots/` - All screenshots (Python version)

---

## 🛠️ Troubleshooting

### Problem: Login Fails
**Solution:**
1. Check credentials are correct
2. Verify account has access to the shared document
3. Look at `login-error.png` screenshot to see what went wrong
4. KDocs may require CAPTCHA or SMS verification - handle manually in non-headless mode

### Problem: No Table Data Found
**Solution:**
1. Check `step2-loaded.png` to see if document loaded
2. The document might use a different DOM structure - inspect page and update selectors
3. Try running with `headless: false` to see what's happening

### Problem: Export Button Not Found
**Solution:**
1. The web interface might not have an export button for shared links
2. Focus on DOM extraction method instead
3. Manually export once through browser to see if it's possible

### Problem: Rate Limiting
**Solution:**
1. Add delays between requests: `await page.waitForTimeout(5000);`
2. Don't run the script too frequently
3. Use different IP if possible

---

## 📝 Customization

### Change Target URL
Edit the `shareUrl` in CONFIG:
```javascript
const CONFIG = {
  shareUrl: 'https://www.kdocs.cn/l/YOUR_LINK_HERE',
  // ...
};
```

### Run in Headless Mode (No Browser Window)
For production/automated runs:
```javascript
const CONFIG = {
  headless: true,  // Change from false to true
  // ...
};
```

### Adjust Timeout
If document loads slowly:
```javascript
const CONFIG = {
  timeout: 60000,  // 60 seconds instead of 30
  // ...
};
```

---

## 🔒 Security Best Practices

### DO:
✅ Use environment variables for credentials  
✅ Add credentials to `.gitignore` if hardcoded  
✅ Rotate passwords regularly  
✅ Use read-only account if possible  

### DON'T:
❌ Commit credentials to git  
❌ Share scripts with hardcoded passwords  
❌ Run on untrusted machines  
❌ Violate KDocs Terms of Service  

---

## 📚 Additional Resources

- **Full Research Report:** `kdocs-research-report.md`
- **Puppeteer Docs:** https://pptr.dev/
- **Selenium Docs:** https://www.selenium.dev/
- **KDocs Help:** https://help.kdocs.cn/ (requires login)

---

## 🆘 Still Not Working?

### Alternative Approaches:

1. **Ask Document Owner for Export**
   - Request CSV/Excel export directly
   - Much simpler and more reliable

2. **Manual Export**
   - Log in to KDocs through browser
   - Use File → Download → CSV/Excel
   - Automate file processing instead

3. **Use Google Sheets**
   - Ask owner to share via Google Sheets instead
   - Google Sheets has excellent API support

4. **Contact WPS Support**
   - Request official API access
   - Enterprise accounts may have API options

---

## 📄 License

MIT License - Use at your own risk. Ensure compliance with KDocs Terms of Service.

---

## ⚡ Quick Test

Test if the script can reach the page (without login):

```javascript
// test.js
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  await page.goto('https://www.kdocs.cn/l/cvbs6aq4axHu');
  await page.screenshot({ path: 'test.png' });
  
  console.log('Title:', await page.title());
  console.log('URL:', page.url());
  console.log('Screenshot saved to test.png');
  
  await browser.close();
})();
```

Run: `node test.js`

This will show you the current state of the page without attempting login.
