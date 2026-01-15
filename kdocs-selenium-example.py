"""
KDocs Data Extractor using Selenium (Python)

This script automates accessing a KDocs shared link and extracting spreadsheet data.

Installation:
    pip install selenium webdriver-manager

Usage:
    python kdocs-selenium-example.py
"""

import os
import json
import csv
import time
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from webdriver_manager.chrome import ChromeDriverManager

# Configuration
CONFIG = {
    'share_url': 'https://www.kdocs.cn/l/cvbs6aq4axHu',
    'credentials': {
        'username': os.environ.get('KDOCS_USERNAME', 'your_phone_or_email'),
        'password': os.environ.get('KDOCS_PASSWORD', 'your_password')
    },
    'headless': False,  # Set to True for production
    'timeout': 30,
    'output_file': 'kdocs-data.csv',
    'screenshot_dir': 'screenshots'
}


class KDocsExtractor:
    """Extract data from KDocs shared links"""
    
    def __init__(self, config=None):
        self.config = config or CONFIG
        self.driver = None
        self.api_calls = []
        
        # Create screenshot directory
        os.makedirs(self.config['screenshot_dir'], exist_ok=True)
    
    def setup_driver(self):
        """Setup Chrome WebDriver with options"""
        print('🔧 Setting up Chrome WebDriver...')
        
        chrome_options = Options()
        
        if self.config['headless']:
            chrome_options.add_argument('--headless')
        
        # Additional options for stability
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-blink-features=AutomationControlled')
        chrome_options.add_argument('--window-size=1920,1080')
        
        # Set user agent
        chrome_options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
        
        # Enable network logging
        chrome_options.set_capability('goog:loggingPrefs', {'performance': 'ALL'})
        
        service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=service, options=chrome_options)
        self.driver.set_page_load_timeout(self.config['timeout'])
        
        print('✅ WebDriver ready')
    
    def take_screenshot(self, name):
        """Take a screenshot and save it"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = os.path.join(self.config['screenshot_dir'], f'{name}_{timestamp}.png')
        self.driver.save_screenshot(filename)
        print(f'📸 Screenshot saved: {filename}')
        return filename
    
    def check_login_required(self):
        """Check if login is required"""
        selectors = [
            (By.CSS_SELECTOR, 'input[type="password"]'),
            (By.NAME, 'account'),
            (By.CSS_SELECTOR, 'input[placeholder*="手机"]'),
            (By.CSS_SELECTOR, 'input[placeholder*="邮箱"]'),
            (By.CLASS_NAME, 'login-form'),
            (By.ID, 'login')
        ]
        
        for by, selector in selectors:
            try:
                self.driver.find_element(by, selector)
                return True
            except NoSuchElementException:
                continue
        
        return False
    
    def handle_login(self):
        """Handle the login process"""
        print('🔐 Handling login...')
        
        try:
            # Wait for and enter account
            wait = WebDriverWait(self.driver, 10)
            
            account_input = wait.until(
                EC.presence_of_element_located((By.CSS_SELECTOR, 'input[name="account"], input[type="text"]'))
            )
            account_input.clear()
            account_input.send_keys(self.config['credentials']['username'])
            print('✏️  Entered username')
            
            time.sleep(1)
            
            # Click submit/next button
            try:
                submit_btn = self.driver.find_element(By.CSS_SELECTOR, 'button[type="submit"], button.submit')
                submit_btn.click()
                time.sleep(2)
            except NoSuchElementException:
                pass
            
            # Wait for and enter password
            password_input = wait.until(
                EC.presence_of_element_located((By.CSS_SELECTOR, 'input[type="password"]'))
            )
            password_input.clear()
            password_input.send_keys(self.config['credentials']['password'])
            print('✏️  Entered password')
            
            time.sleep(1)
            
            # Click login button
            login_btn = self.driver.find_element(By.CSS_SELECTOR, 'button[type="submit"], button.login')
            login_btn.click()
            print('🔄 Submitted login form')
            
            # Wait for page to load
            time.sleep(5)
            
            print('✅ Login completed')
            self.take_screenshot('after_login')
            
        except TimeoutException:
            print('❌ Login timeout')
            self.take_screenshot('login_error')
            raise Exception('Login failed due to timeout')
        except Exception as e:
            print(f'❌ Login error: {str(e)}')
            self.take_screenshot('login_error')
            raise
    
    def try_export_button(self):
        """Try to find and click export/download button"""
        export_selectors = [
            'button[class*="export"]',
            'button[class*="download"]',
            'a[class*="export"]',
            'a[class*="download"]',
            '[aria-label*="导出"]',
            '[aria-label*="下载"]',
            '.export-btn',
            '.download-btn'
        ]
        
        for selector in export_selectors:
            try:
                button = self.driver.find_element(By.CSS_SELECTOR, selector)
                print(f'🔘 Found export button: {selector}')
                button.click()
                time.sleep(2)
                return True
            except NoSuchElementException:
                continue
        
        print('ℹ️  No export button found')
        return False
    
    def extract_table_data(self):
        """Extract table data from DOM"""
        print('📊 Extracting table data...')
        
        table_selectors = [
            'table',
            '.spreadsheet table',
            '.data-table',
            '[role="grid"]',
            '.sheet-container table'
        ]
        
        for selector in table_selectors:
            try:
                table = self.driver.find_element(By.CSS_SELECTOR, selector)
                rows = table.find_elements(By.TAG_NAME, 'tr')
                
                data = []
                for row in rows:
                    cells = row.find_elements(By.TAG_NAME, 'td')
                    if not cells:
                        cells = row.find_elements(By.TAG_NAME, 'th')
                    
                    row_data = [cell.text.strip() for cell in cells]
                    if any(row_data):  # Skip empty rows
                        data.append(row_data)
                
                if data:
                    print(f'✅ Extracted {len(data)} rows from table')
                    return data
                
            except NoSuchElementException:
                continue
        
        # Try alternative: extract grid cells
        try:
            cells = self.driver.find_elements(By.CSS_SELECTOR, '[role="gridcell"], .cell, .data-cell')
            if cells:
                print(f'ℹ️  Found {len(cells)} grid cells, attempting to structure...')
                # This would need custom logic based on the actual DOM structure
                return None
        except NoSuchElementException:
            pass
        
        print('⚠️  No table data found')
        return None
    
    def monitor_network_requests(self):
        """Monitor network requests for API calls"""
        print('📡 Monitoring network requests...')
        
        try:
            logs = self.driver.get_log('performance')
            api_calls = []
            
            for entry in logs:
                log = json.loads(entry['message'])['message']
                
                if log['method'] == 'Network.responseReceived':
                    response = log['params']['response']
                    url = response['url']
                    
                    if '/api/' in url or '/export' in url or '/download' in url:
                        api_calls.append({
                            'url': url,
                            'status': response['status'],
                            'method': response.get('requestHeaders', {}).get('method', 'GET')
                        })
                        print(f'📥 API Call: {url}')
            
            if api_calls:
                with open('api_calls.json', 'w') as f:
                    json.dump(api_calls, f, indent=2)
                print(f'✅ Saved {len(api_calls)} API calls to api_calls.json')
            
            return api_calls
            
        except Exception as e:
            print(f'⚠️  Could not monitor network: {str(e)}')
            return []
    
    def save_to_csv(self, data, filename):
        """Save data to CSV file"""
        with open(filename, 'w', newline='', encoding='utf-8-sig') as f:
            writer = csv.writer(f)
            writer.writerows(data)
        print(f'✅ Data saved to {filename}')
    
    def extract(self):
        """Main extraction method"""
        print('🚀 Starting KDocs data extraction...')
        
        try:
            self.setup_driver()
            
            # Navigate to shared link
            print(f'📄 Opening: {self.config["share_url"]}')
            self.driver.get(self.config['share_url'])
            time.sleep(3)
            
            self.take_screenshot('initial')
            
            # Check if login is required
            if self.check_login_required():
                print('🔐 Login required')
                self.handle_login()
            else:
                print('✅ No login required or already authenticated')
            
            # Wait for document to load
            print('⏳ Waiting for document to load...')
            time.sleep(5)
            
            self.take_screenshot('loaded')
            
            # Try export button
            self.try_export_button()
            
            # Extract table data
            table_data = self.extract_table_data()
            
            # Monitor network
            api_calls = self.monitor_network_requests()
            
            # Save results
            if table_data:
                self.save_to_csv(table_data, self.config['output_file'])
                print(f'✨ Extraction complete! Found {len(table_data)} rows')
                return table_data
            else:
                print('⚠️  No data extracted. Check screenshots for manual verification.')
                return None
            
        except Exception as e:
            print(f'❌ Error: {str(e)}')
            self.take_screenshot('error')
            raise
        
        finally:
            if self.driver:
                self.driver.quit()
                print('🏁 Browser closed')


def main():
    """Main entry point"""
    extractor = KDocsExtractor()
    
    try:
        data = extractor.extract()
        
        if data:
            print(f'\n✅ Success! Extracted {len(data)} rows')
            print(f'📊 Data saved to: {CONFIG["output_file"]}')
            
            # Print preview
            print('\n📋 Preview (first 5 rows):')
            for i, row in enumerate(data[:5], 1):
                print(f'  Row {i}: {row}')
        else:
            print('\n⚠️  No data extracted')
            print('Check screenshots in the "screenshots" folder for more information')
        
        return 0
        
    except Exception as e:
        print(f'\n💥 Extraction failed: {str(e)}')
        return 1


if __name__ == '__main__':
    exit(main())
