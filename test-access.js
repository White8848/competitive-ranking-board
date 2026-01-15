/**
 * Simple Test Script - Check KDocs Page Accessibility
 * 
 * This script tests if the KDocs shared link is accessible
 * and captures the current state without attempting login.
 * 
 * Usage: node test-access.js
 */

const puppeteer = require('puppeteer');

async function testKDocsAccess() {
  console.log('🧪 Testing KDocs page accessibility...\n');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1920, height: 1080 }
  });
  
  try {
    const page = await browser.newPage();
    
    // Navigate to the shared link
    console.log('📄 Opening: https://www.kdocs.cn/l/cvbs6aq4axHu');
    await page.goto('https://www.kdocs.cn/l/cvbs6aq4axHu', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Get page info
    const url = page.url();
    const title = await page.title();
    
    console.log(`✅ Page loaded successfully`);
    console.log(`📍 Current URL: ${url}`);
    console.log(`📝 Page Title: ${title}`);
    
    // Check if redirected to login
    if (url.includes('passport') || url.includes('login') || url.includes('sign')) {
      console.log('🔐 Status: Login required (redirected to authentication page)');
      console.log('ℹ️  This confirms that the shared link requires authentication.');
    } else if (url.includes('/l/cvbs6aq4axHu')) {
      console.log('✅ Status: Direct access (no login required)');
    } else {
      console.log('⚠️  Status: Redirected to unknown page');
    }
    
    // Take screenshot
    await page.screenshot({ path: 'kdocs-test-screenshot.png', fullPage: true });
    console.log('📸 Screenshot saved: kdocs-test-screenshot.png');
    
    // Check for login elements
    const hasPasswordField = await page.$('input[type="password"]') !== null;
    const hasAccountField = await page.$('input[name="account"]') !== null;
    const hasLoginForm = await page.$('.login-form, #login') !== null;
    
    console.log('\n🔍 Page Analysis:');
    console.log(`   - Password field: ${hasPasswordField ? '✅ Found' : '❌ Not found'}`);
    console.log(`   - Account field: ${hasAccountField ? '✅ Found' : '❌ Not found'}`);
    console.log(`   - Login form: ${hasLoginForm ? '✅ Found' : '❌ Not found'}`);
    
    // Get page text content (first 500 chars)
    const bodyText = await page.evaluate(() => document.body.innerText);
    const textPreview = bodyText.substring(0, 500).trim();
    
    if (textPreview) {
      console.log('\n📄 Page Content Preview:');
      console.log('---');
      console.log(textPreview);
      console.log('---');
    }
    
    // Summary
    console.log('\n📊 Summary:');
    if (hasPasswordField || hasAccountField || hasLoginForm) {
      console.log('❌ The shared link requires authentication.');
      console.log('✅ You will need valid KDocs credentials to access the data.');
      console.log('💡 Use the kdocs-puppeteer-example.js script with your credentials.');
    } else {
      console.log('✅ The page loaded without requiring login.');
      console.log('💡 You may be able to access data directly.');
    }
    
    // Wait a moment for manual inspection
    console.log('\n⏳ Keeping browser open for 10 seconds for manual inspection...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await browser.close();
    console.log('\n🏁 Test complete. Browser closed.');
  }
}

// Run the test
if (require.main === module) {
  testKDocsAccess()
    .then(() => {
      console.log('\n✨ Test finished successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Test failed:', error.message);
      process.exit(1);
    });
}

module.exports = { testKDocsAccess };
