# KDocs API Research Report
**Date:** January 15, 2026  
**Target URL:** https://www.kdocs.cn/l/cvbs6aq4axHu

## Executive Summary

After extensive research on accessing KDocs (金山文档/Kingsoft Docs) shared links programmatically, I found that **direct public API access to shared KDocs documents is severely restricted and requires authentication**. The shared link redirects to a login page, making it impossible to access data without proper credentials.

---

## 🔍 Research Findings

### 1. **Authentication Requirements**
- **Shared links require login:** The URL `https://www.kdocs.cn/l/cvbs6aq4axHu` redirects to:
  ```
  https://account.kdocs.cn/passport/singlesign?cb=https://www.kdocs.cn/l/cvbs6aq4axHu&appid=375024576&f=c
  ```
- This is a **WPS/Kingsoft authentication gateway** that requires:
  - Phone number or email login
  - WeChat/QQ/Alipay authentication
  - Corporate account login

### 2. **No Public API for Shared Links**
- **Official API documentation is restricted:**
  - `https://open.kdocs.cn/` - Requires authentication to access
  - `https://developers.kdocs.cn/` - Redirects to SSO login
  - `https://help.kdocs.cn/` - Redirects to authentication

- **No public REST API endpoints found** for:
  - Anonymous access to shared documents
  - Direct CSV/JSON export from shared links
  - Embed API without authentication

### 3. **Authentication System (PKCE Flow)**
The page uses **OAuth 2.0 PKCE (Proof Key for Code Exchange)** authentication:
```javascript
// From page source
function generatePKCEParam(){
  ksoAccount.generatePKCEParam().then(function(a){
    var b=a.code_verifier,c=a.code_challenge
    // Stores challenge and redirects to SSO
  })
}
```

This indicates enterprise-grade security with no bypass options.

---

## 🚫 Why Direct Access Fails

### Technical Barriers:
1. **Session-based authentication** - Requires cookies and session tokens
2. **CSRF protection** - X-CSRFToken headers required for API calls
3. **Device fingerprinting** - Device ID tracking mentioned in error messages
4. **No public export URLs** - No direct CSV/Excel/JSON export endpoints found

### Security Features Found in Code:
- `X-Pop-Token` header verification
- `code_challenge` and `code_verifier` for PKCE
- Device ID tracking: `DeviceID`, `DeviceNum`, `DeviceOs`
- Rate limiting: `apiRateLimit`, `apiRateLimitExceede`

---

## 🔧 Alternative Approaches

### Option 1: **Manual Browser Export (Most Reliable)**
**Steps:**
1. Open the shared link in a browser
2. Log in with valid credentials
3. Use the web interface to export:
   - Click "File" → "Download as" → Select format (Excel, CSV, PDF)
4. Automate browser interaction using:
   - **Selenium** (Python/JavaScript)
   - **Puppeteer** (Node.js)
   - **Playwright** (Multi-language)

**Example with Puppeteer:**
```javascript
const puppeteer = require('puppeteer');

async function exportKDocs() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  // Navigate to shared link
  await page.goto('https://www.kdocs.cn/l/cvbs6aq4axHu');
  
  // Wait for login page and handle authentication
  // (You'll need to implement login logic here)
  
  // After login, look for export/download button
  await page.waitForSelector('[download-button-selector]');
  await page.click('[download-button-selector]');
  
  // Handle download
  await browser.close();
}
```

### Option 2: **Reverse Engineer Web App API (Advanced)**
**Approach:**
1. Open browser developer tools (F12)
2. Log in and access the shared document
3. Monitor Network tab for API calls
4. Look for endpoints like:
   - `/api/v1/office/[docId]/export`
   - `/api/sheet/export?fileId=xxx&format=csv`
   - `/drive/download?id=xxx`

**Example API pattern (hypothetical):**
```javascript
// Potential API structure (needs verification)
const apiEndpoint = 'https://www.kdocs.cn/api/v3/office/export';
const headers = {
  'Authorization': 'Bearer YOUR_TOKEN',
  'X-CSRFToken': 'CSRF_TOKEN',
  'Cookie': 'wps_sid=SESSION_ID'
};

fetch(apiEndpoint, {
  method: 'POST',
  headers: headers,
  body: JSON.stringify({
    fileId: 'cvbs6aq4axHu',
    format: 'csv'
  })
});
```

### Option 3: **WPS Official API Integration**
**Requirements:**
- Register as WPS developer at `https://open.wps.cn/`
- Obtain API credentials (App ID, Secret Key)
- Use official SDK if available

**Limitations:**
- Requires document owner's permission
- May require upgrading to enterprise account
- API quota limits likely apply

### Option 4: **Google Sheets Integration (If Owner Allows)**
If the document owner can export and share via Google Sheets:
```javascript
// Google Sheets has a simple export API
const sheetId = 'YOUR_SHEET_ID';
const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;

fetch(csvUrl)
  .then(response => response.text())
  .then(csv => console.log(csv));
```

---

## 💡 Recommended Implementation

### **Best Approach: Selenium/Puppeteer Automation**

Here's a complete implementation strategy:

#### **Step 1: Setup (Node.js + Puppeteer)**
```bash
npm install puppeteer
```

#### **Step 2: Implementation**
```javascript
const puppeteer = require('puppeteer');
const fs = require('fs');

async function extractKDocsData(shareUrl, credentials) {
  const browser = await puppeteer.launch({
    headless: false, // Set to true for production
    defaultViewport: null
  });
  
  try {
    const page = await browser.newPage();
    
    // Navigate to shared link
    console.log('Opening KDocs shared link...');
    await page.goto(shareUrl, { waitUntil: 'networkidle2' });
    
    // Check if login is required
    const loginRequired = await page.$('input[type="password"]');
    
    if (loginRequired) {
      console.log('Login required, authenticating...');
      
      // Handle phone/email login
      await page.type('input[name="account"]', credentials.username);
      await page.click('button[type="submit"]');
      
      // Wait for password field
      await page.waitForSelector('input[type="password"]');
      await page.type('input[type="password"]', credentials.password);
      await page.click('button[type="submit"]');
      
      // Wait for document to load
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
    }
    
    // Document is now loaded - extract data
    console.log('Document loaded, extracting data...');
    
    // Option A: Screenshot the spreadsheet
    await page.screenshot({ path: 'kdocs-data.png', fullPage: true });
    
    // Option B: Try to find and click export button
    const exportButton = await page.$('[class*="export"], [class*="download"]');
    if (exportButton) {
      await exportButton.click();
      // Handle file download
    }
    
    // Option C: Extract table data from DOM
    const tableData = await page.evaluate(() => {
      const rows = document.querySelectorAll('table tr');
      return Array.from(rows).map(row => {
        const cells = row.querySelectorAll('td, th');
        return Array.from(cells).map(cell => cell.textContent.trim());
      });
    });
    
    console.log('Data extracted:', tableData);
    
    // Save to CSV
    const csv = tableData.map(row => row.join(',')).join('\n');
    fs.writeFileSync('kdocs-export.csv', csv);
    
    return tableData;
    
  } catch (error) {
    console.error('Error:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Usage
extractKDocsData('https://www.kdocs.cn/l/cvbs6aq4axHu', {
  username: 'your_phone_or_email',
  password: 'your_password'
});
```

#### **Step 3: Python Alternative (Selenium)**
```python
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import csv

def extract_kdocs_data(share_url, username, password):
    driver = webdriver.Chrome()
    
    try:
        # Navigate to shared link
        driver.get(share_url)
        
        # Wait for and handle login
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.NAME, "account"))
        )
        
        # Enter credentials
        driver.find_element(By.NAME, "account").send_keys(username)
        driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
        
        # Wait and enter password
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='password']"))
        )
        driver.find_element(By.CSS_SELECTOR, "input[type='password']").send_keys(password)
        driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
        
        # Wait for document to load
        WebDriverWait(driver, 20).until(
            EC.presence_of_element_located((By.TAG_NAME, "table"))
        )
        
        # Extract table data
        table = driver.find_element(By.TAG_NAME, "table")
        rows = table.find_elements(By.TAG_NAME, "tr")
        
        data = []
        for row in rows:
            cells = row.find_elements(By.TAG_NAME, "td") or row.find_elements(By.TAG_NAME, "th")
            data.append([cell.text for cell in cells])
        
        # Save to CSV
        with open('kdocs-export.csv', 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerows(data)
        
        return data
        
    finally:
        driver.quit()

# Usage
data = extract_kdocs_data(
    'https://www.kdocs.cn/l/cvbs6aq4axHu',
    'your_phone_or_email',
    'your_password'
)
```

---

## ⚠️ Important Considerations

### 1. **Authentication Credentials Required**
- You MUST have valid KDocs account credentials
- Cannot bypass authentication without account access
- Consider asking document owner for export or different sharing method

### 2. **Legal and Ethical**
- Ensure you have permission to access the data
- Respect document owner's sharing settings
- Don't violate Terms of Service by aggressive scraping

### 3. **Maintenance**
- Web scraping solutions are fragile
- KDocs UI changes will break selectors
- Consider asking for direct API access from document owner

### 4. **Rate Limiting**
- KDocs implements rate limiting: `apiRateLimit`, `apiRateLimitExceede`
- Add delays between requests
- Don't make excessive automated requests

---

## 📊 Summary Table

| Method | Difficulty | Reliability | Requires Auth | Best For |
|--------|-----------|-------------|---------------|----------|
| Manual Export | Easy | High | Yes | One-time export |
| Puppeteer/Selenium | Medium | Medium | Yes | Automated regular access |
| Reverse Engineer API | Hard | Low | Yes | Custom integrations |
| Official WPS API | Medium | High | Yes | Enterprise solutions |
| Request Owner Export | Easy | High | No | Simple data access |

---

## 🎯 Final Recommendations

### **For Your Specific Use Case:**

1. **Short-term solution:** Ask the document owner to:
   - Export the spreadsheet as CSV/Excel
   - Upload to a service with public API (Google Sheets, Pastebin)
   - Or change sharing settings to "anyone with link can download"

2. **Medium-term solution:** Implement Puppeteer/Selenium automation with:
   - Credentials storage in environment variables
   - Error handling for login failures
   - Scheduled runs with retry logic

3. **Long-term solution:** Contact WPS/KDocs to:
   - Request official API access
   - Explore enterprise API options
   - Discuss programmatic access requirements

### **Working Example to Start:**
```javascript
// Quick test: Check if document is accessible
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  await page.goto('https://www.kdocs.cn/l/cvbs6aq4axHu');
  
  // Take screenshot of current state
  await page.screenshot({ path: 'kdocs-current-state.png' });
  
  console.log('Page title:', await page.title());
  console.log('URL:', page.url());
  
  await browser.close();
})();
```

---

## 📚 Additional Resources

- **WPS Official Site:** https://www.wps.cn/
- **KDocs Help:** https://help.kdocs.cn/ (requires auth)
- **Puppeteer Docs:** https://pptr.dev/
- **Selenium Docs:** https://www.selenium.dev/documentation/

---

## 🔄 Next Steps

1. **Verify access:** Test if you have valid credentials for the shared document
2. **Choose method:** Select automation approach based on requirements
3. **Implement prototype:** Start with Puppeteer/Selenium POC
4. **Monitor changes:** Set up alerts for UI/API changes
5. **Document process:** Keep detailed logs of working solutions

---

*Note: This research was conducted on January 15, 2026. KDocs API and authentication may change over time. Always verify current documentation and terms of service before implementing automated access.*
