/**
 * KDocs Data Extractor using Puppeteer
 * 
 * This script automates accessing a KDocs shared link and extracting spreadsheet data.
 * 
 * Installation:
 *   npm install puppeteer
 * 
 * Usage:
 *   node kdocs-puppeteer-example.js
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

// Configuration
const CONFIG = {
  shareUrl: 'https://www.kdocs.cn/l/cvbs6aq4axHu',
  credentials: {
    // Replace with actual credentials or use environment variables
    username: process.env.KDOCS_USERNAME || 'your_phone_or_email',
    password: process.env.KDOCS_PASSWORD || 'your_password'
  },
  headless: false, // Set to true for production
  timeout: 30000,
  outputFile: 'kdocs-data.csv'
};

/**
 * Main function to extract data from KDocs
 */
async function extractKDocsData() {
  console.log('🚀 Starting KDocs data extraction...');
  
  const browser = await puppeteer.launch({
    headless: CONFIG.headless,
    defaultViewport: { width: 1920, height: 1080 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Set user agent to avoid detection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Enable request interception to monitor network
    await page.setRequestInterception(true);
    const apiCalls = [];
    
    page.on('request', request => {
      const url = request.url();
      if (url.includes('/api/') || url.includes('/export') || url.includes('/download')) {
        apiCalls.push({
          url: url,
          method: request.method(),
          headers: request.headers()
        });
        console.log('📡 API Call detected:', url);
      }
      request.continue();
    });
    
    // Navigate to shared link
    console.log('📄 Opening KDocs shared link...');
    await page.goto(CONFIG.shareUrl, { 
      waitUntil: 'networkidle2',
      timeout: CONFIG.timeout 
    });
    
    // Take screenshot of initial state
    await page.screenshot({ path: 'step1-initial.png' });
    console.log('📸 Screenshot saved: step1-initial.png');
    
    // Check if login is required
    const loginRequired = await checkLoginRequired(page);
    
    if (loginRequired) {
      console.log('🔐 Login required, authenticating...');
      await handleLogin(page, CONFIG.credentials);
    } else {
      console.log('✅ No login required or already authenticated');
    }
    
    // Wait for document to fully load
    console.log('⏳ Waiting for document to load...');
    await page.waitForTimeout(5000); // Wait 5 seconds for dynamic content
    
    // Take screenshot of loaded document
    await page.screenshot({ path: 'step2-loaded.png' });
    console.log('📸 Screenshot saved: step2-loaded.png');
    
    // Try different methods to extract data
    console.log('📊 Extracting data...');
    
    // Method 1: Look for export/download button
    const exportData = await tryExportButton(page);
    
    // Method 2: Extract table data from DOM
    const tableData = await extractTableData(page);
    
    // Method 3: Monitor API calls
    if (apiCalls.length > 0) {
      console.log('📡 Found API calls:', apiCalls);
      fs.writeFileSync('api-calls.json', JSON.stringify(apiCalls, null, 2));
    }
    
    // Save extracted data
    if (tableData && tableData.length > 0) {
      saveToCsv(tableData, CONFIG.outputFile);
      console.log(`✅ Data saved to ${CONFIG.outputFile}`);
      return tableData;
    } else {
      console.log('⚠️  No table data found. Check screenshots for manual verification.');
      return null;
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await browser.close();
    console.log('🏁 Browser closed');
  }
}

/**
 * Check if login is required
 */
async function checkLoginRequired(page) {
  const selectors = [
    'input[type="password"]',
    'input[name="account"]',
    'input[placeholder*="手机"]',
    'input[placeholder*="邮箱"]',
    '.login-form',
    '#login'
  ];
  
  for (const selector of selectors) {
    const element = await page.$(selector);
    if (element) {
      return true;
    }
  }
  
  return false;
}

/**
 * Handle login process
 */
async function handleLogin(page, credentials) {
  try {
    // Wait for account input
    await page.waitForSelector('input[name="account"], input[type="text"]', { timeout: 10000 });
    
    // Enter username/phone/email
    const accountInput = await page.$('input[name="account"], input[type="text"]');
    if (accountInput) {
      await accountInput.type(credentials.username, { delay: 100 });
      console.log('✏️  Entered username');
    }
    
    // Click next/submit button
    const submitButton = await page.$('button[type="submit"], button.submit, .btn-submit');
    if (submitButton) {
      await submitButton.click();
      await page.waitForTimeout(2000);
    }
    
    // Enter password
    await page.waitForSelector('input[type="password"]', { timeout: 10000 });
    const passwordInput = await page.$('input[type="password"]');
    if (passwordInput) {
      await passwordInput.type(credentials.password, { delay: 100 });
      console.log('✏️  Entered password');
    }
    
    // Click login button
    const loginButton = await page.$('button[type="submit"], button.login, .btn-login');
    if (loginButton) {
      await loginButton.click();
      console.log('🔄 Submitted login form');
    }
    
    // Wait for navigation or document load
    await page.waitForNavigation({ 
      waitUntil: 'networkidle2',
      timeout: CONFIG.timeout 
    }).catch(() => {
      console.log('⚠️  Navigation timeout, continuing anyway...');
    });
    
    console.log('✅ Login completed');
    
  } catch (error) {
    console.error('❌ Login failed:', error.message);
    await page.screenshot({ path: 'login-error.png' });
    throw new Error('Login failed. Check login-error.png for details.');
  }
}

/**
 * Try to find and click export/download button
 */
async function tryExportButton(page) {
  const exportSelectors = [
    'button[class*="export"]',
    'button[class*="download"]',
    'a[class*="export"]',
    'a[class*="download"]',
    '[aria-label*="导出"]',
    '[aria-label*="下载"]',
    '.export-btn',
    '.download-btn'
  ];
  
  for (const selector of exportSelectors) {
    const button = await page.$(selector);
    if (button) {
      console.log(`🔘 Found export button: ${selector}`);
      await button.click();
      await page.waitForTimeout(2000);
      return true;
    }
  }
  
  console.log('ℹ️  No export button found');
  return false;
}

/**
 * Extract table data from DOM
 */
async function extractTableData(page) {
  try {
    const data = await page.evaluate(() => {
      // Try different selectors for tables
      const selectors = [
        'table',
        '.spreadsheet table',
        '.data-table',
        '[role="grid"]',
        '.sheet-container table'
      ];
      
      for (const selector of selectors) {
        const table = document.querySelector(selector);
        if (table) {
          const rows = table.querySelectorAll('tr');
          return Array.from(rows).map(row => {
            const cells = row.querySelectorAll('td, th');
            return Array.from(cells).map(cell => cell.textContent.trim());
          });
        }
      }
      
      // If no table found, try to extract grid data
      const cells = document.querySelectorAll('[role="gridcell"], .cell, .data-cell');
      if (cells.length > 0) {
        // Group cells by row
        const rowMap = new Map();
        cells.forEach(cell => {
          const row = cell.getAttribute('data-row') || cell.getAttribute('aria-rowindex') || '0';
          if (!rowMap.has(row)) {
            rowMap.set(row, []);
          }
          rowMap.get(row).push(cell.textContent.trim());
        });
        
        return Array.from(rowMap.values());
      }
      
      return null;
    });
    
    if (data && data.length > 0) {
      console.log(`✅ Extracted ${data.length} rows`);
      return data;
    } else {
      console.log('⚠️  No table data found in DOM');
      return null;
    }
    
  } catch (error) {
    console.error('❌ Error extracting table data:', error.message);
    return null;
  }
}

/**
 * Save data to CSV file
 */
function saveToCsv(data, filename) {
  const csv = data.map(row => {
    // Escape quotes and wrap fields containing commas
    return row.map(cell => {
      const escaped = String(cell).replace(/"/g, '""');
      return escaped.includes(',') ? `"${escaped}"` : escaped;
    }).join(',');
  }).join('\n');
  
  fs.writeFileSync(filename, '\uFEFF' + csv, 'utf-8'); // Add BOM for Excel compatibility
}

/**
 * Alternative: Monitor network requests for API endpoints
 */
async function monitorNetworkForApi(page) {
  const apiEndpoints = [];
  
  page.on('response', async response => {
    const url = response.url();
    
    if (url.includes('/api/') || url.includes('kdocs.cn')) {
      try {
        const contentType = response.headers()['content-type'] || '';
        
        if (contentType.includes('application/json')) {
          const json = await response.json();
          apiEndpoints.push({
            url: url,
            status: response.status(),
            data: json
          });
          console.log('📥 JSON Response:', url);
        }
      } catch (e) {
        // Not JSON or couldn't parse
      }
    }
  });
  
  return apiEndpoints;
}

// Run the extractor
if (require.main === module) {
  extractKDocsData()
    .then(data => {
      console.log('\n✨ Extraction complete!');
      if (data) {
        console.log(`📊 Extracted ${data.length} rows with ${data[0]?.length || 0} columns`);
      }
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Extraction failed:', error.message);
      process.exit(1);
    });
}

module.exports = { extractKDocsData };
