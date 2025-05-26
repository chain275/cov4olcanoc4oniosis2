#!/usr/bin/env python3
"""
Security Scanner for TCAS Prep Website
This script scans the website for common security vulnerabilities
"""

import os
import re
import sys
import argparse
import logging
from datetime import datetime
from urllib.parse import urlparse

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(os.path.join('logs', 'security_scan.log')),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('security_scanner')

class SecurityScanner:
    def __init__(self, base_dir='.'):
        self.base_dir = base_dir
        self.issues_found = 0
        self.files_scanned = 0
        self.vulnerabilities = {
            'xss': 0,
            'csrf': 0,
            'sql_injection': 0,
            'file_inclusion': 0,
            'insecure_config': 0,
            'insecure_headers': 0,
            'sensitive_data': 0
        }
        
        # Patterns to search for
        self.patterns = {
            'xss': [
                r'<\s*script.*?>',
                r'javascript:',
                r'eval\s*\(',
                r'document\.write\s*\(',
                r'innerHTML\s*=',
                r'outerHTML\s*=',
                r'document\.cookie',
                r'window\.location'
            ],
            'csrf': [
                r'<\s*form.*?>(?!.*csrf)',
                r'fetch\s*\(\s*[\'"]POST',
                r'XMLHttpRequest.*?\.open\s*\(\s*[\'"]POST'
            ],
            'sql_injection': [
                r'SELECT.*FROM',
                r'INSERT\s+INTO',
                r'UPDATE.*SET',
                r'DELETE\s+FROM',
                r'mysql_query',
                r'mysqli_query',
                r'execute\s*\('
            ],
            'file_inclusion': [
                r'include\s*\(',
                r'require\s*\(',
                r'include_once\s*\(',
                r'require_once\s*\(',
                r'file_get_contents\s*\(',
                r'readfile\s*\(',
                r'fopen\s*\('
            ],
            'insecure_config': [
                r'debug\s*=\s*true',
                r'display_errors\s*=\s*on',
                r'error_reporting\s*\(\s*E_ALL',
                r'password\s*=\s*[\'"].+?[\'"]',
                r'api_key\s*=\s*[\'"].+?[\'"]',
                r'secret_key\s*=\s*[\'"].+?[\'"]'
            ],
            'sensitive_data': [
                r'password',
                r'api_key',
                r'secret',
                r'token',
                r'auth',
                r'credentials',
                r'private_key'
            ]
        }
        
        # File extensions to check
        self.extensions = [
            '.html', '.htm', '.php', '.js', '.py', '.css', 
            '.xml', '.json', '.ini', '.config', '.htaccess'
        ]
    
    def scan(self):
        """Start the security scan"""
        logger.info("Starting security scan of %s", self.base_dir)
        start_time = datetime.now()
        
        try:
            for root, dirs, files in os.walk(self.base_dir):
                # Skip .git directory
                if '.git' in dirs:
                    dirs.remove('.git')
                
                # Skip logs directory
                if 'logs' in dirs:
                    dirs.remove('logs')
                
                # Skip node_modules directory if exists
                if 'node_modules' in dirs:
                    dirs.remove('node_modules')
                
                # Check files
                for file in files:
                    file_path = os.path.join(root, file)
                    _, ext = os.path.splitext(file)
                    
                    if ext.lower() in self.extensions:
                        self.scan_file(file_path)
            
            # Check .htaccess for security headers
            self.check_htaccess()
            
            # Check for secure forms
            self.check_forms()
            
            # Check for secure cookie settings
            self.check_cookies()
            
            # Check for Content Security Policy
            self.check_csp()
            
            # Generate report
            self.generate_report()
            
        except KeyboardInterrupt:
            logger.info("Scan interrupted by user")
        except Exception as e:
            logger.error("An error occurred during scanning: %s", str(e))
        
        end_time = datetime.now()
        duration = end_time - start_time
        logger.info("Scan completed in %s seconds", duration.total_seconds())
    
    def scan_file(self, file_path):
        """Scan a single file for vulnerabilities"""
        try:
            rel_path = os.path.relpath(file_path, self.base_dir)
            self.files_scanned += 1
            
            if self.files_scanned % 50 == 0:
                logger.info("Scanned %d files...", self.files_scanned)
            
            # Skip binary files
            if self.is_binary(file_path):
                return
            
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                
                for vuln_type, patterns in self.patterns.items():
                    for pattern in patterns:
                        matches = re.findall(pattern, content, re.IGNORECASE)
                        if matches:
                            self.vulnerabilities[vuln_type] += len(matches)
                            self.issues_found += len(matches)
                            
                            for match in matches[:3]:  # Limit to first 3 matches
                                logger.warning(
                                    "Potential %s vulnerability in %s: %s", 
                                    vuln_type, 
                                    rel_path, 
                                    match[:50] + '...' if len(match) > 50 else match
                                )
        except Exception as e:
            logger.error("Error scanning file %s: %s", file_path, str(e))
    
    def is_binary(self, file_path):
        """Check if a file is binary"""
        try:
            with open(file_path, 'rb') as f:
                chunk = f.read(1024)
                return b'\0' in chunk
        except Exception:
            return True
    
    def check_htaccess(self):
        """Check .htaccess for security headers"""
        htaccess_path = os.path.join(self.base_dir, '.htaccess')
        
        if not os.path.exists(htaccess_path):
            logger.warning("No .htaccess file found")
            self.issues_found += 1
            self.vulnerabilities['insecure_headers'] += 1
            return
        
        try:
            with open(htaccess_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                
                # Check for security headers
                headers_to_check = [
                    'Strict-Transport-Security',
                    'X-Frame-Options',
                    'X-Content-Type-Options',
                    'X-XSS-Protection',
                    'Content-Security-Policy',
                    'Referrer-Policy'
                ]
                
                for header in headers_to_check:
                    if header not in content:
                        logger.warning("Security header %s not found in .htaccess", header)
                        self.issues_found += 1
                        self.vulnerabilities['insecure_headers'] += 1
                
                # Check for HTTPS enforcement
                if 'RewriteCond %{HTTPS} off' not in content or 'RewriteRule ^(.*)$ https://' not in content:
                    logger.warning("HTTPS enforcement not found in .htaccess")
                    self.issues_found += 1
                    self.vulnerabilities['insecure_headers'] += 1
        except Exception as e:
            logger.error("Error checking .htaccess: %s", str(e))
    
    def check_forms(self):
        """Check HTML forms for CSRF protection"""
        form_count = 0
        protected_form_count = 0
        
        for root, _, files in os.walk(self.base_dir):
            for file in files:
                if file.endswith('.html') or file.endswith('.php'):
                    file_path = os.path.join(root, file)
                    rel_path = os.path.relpath(file_path, self.base_dir)
                    
                    try:
                        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                            content = f.read()
                            
                            # Find all forms
                            forms = re.findall(r'<form.*?>.*?</form>', content, re.DOTALL | re.IGNORECASE)
                            form_count += len(forms)
                            
                            for form in forms:
                                # Check for CSRF token input
                                if 'csrf_token' in form:
                                    protected_form_count += 1
                                else:
                                    logger.warning("Form without CSRF protection in %s", rel_path)
                                    self.issues_found += 1
                                    self.vulnerabilities['csrf'] += 1
                    except Exception as e:
                        logger.error("Error checking forms in %s: %s", file_path, str(e))
        
        logger.info("Found %d forms, %d with CSRF protection", form_count, protected_form_count)
    
    def check_cookies(self):
        """Check for secure cookie settings"""
        cookie_settings_found = False
        
        # Check PHP files for cookie settings
        for root, _, files in os.walk(self.base_dir):
            for file in files:
                if file.endswith('.php'):
                    file_path = os.path.join(root, file)
                    
                    try:
                        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                            content = f.read()
                            
                            # Check for setcookie() calls
                            cookie_calls = re.findall(r'setcookie\s*\(.*?\)', content, re.DOTALL)
                            
                            for call in cookie_calls:
                                cookie_settings_found = True
                                
                                # Check for secure flag
                                if 'secure' not in call.lower():
                                    logger.warning("Cookie without secure flag in %s", file_path)
                                    self.issues_found += 1
                                    self.vulnerabilities['insecure_config'] += 1
                                
                                # Check for httponly flag
                                if 'httponly' not in call.lower():
                                    logger.warning("Cookie without HttpOnly flag in %s", file_path)
                                    self.issues_found += 1
                                    self.vulnerabilities['insecure_config'] += 1
                                
                                # Check for SameSite attribute
                                if 'samesite' not in call.lower():
                                    logger.warning("Cookie without SameSite attribute in %s", file_path)
                                    self.issues_found += 1
                                    self.vulnerabilities['insecure_config'] += 1
                    except Exception as e:
                        logger.error("Error checking cookies in %s: %s", file_path, str(e))
        
        # Check JavaScript files for cookie settings
        for root, _, files in os.walk(self.base_dir):
            for file in files:
                if file.endswith('.js'):
                    file_path = os.path.join(root, file)
                    
                    try:
                        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                            content = f.read()
                            
                            # Check for document.cookie assignments
                            cookie_assigns = re.findall(r'document\.cookie\s*=', content)
                            
                            if cookie_assigns:
                                cookie_settings_found = True
                                
                                # Check for secure flag
                                if 'secure' not in content.lower():
                                    logger.warning("JavaScript cookie without secure flag in %s", file_path)
                                    self.issues_found += 1
                                    self.vulnerabilities['insecure_config'] += 1
                                
                                # Check for HttpOnly flag (though JS can't set this)
                                # Check for SameSite attribute
                                if 'samesite' not in content.lower():
                                    logger.warning("JavaScript cookie without SameSite attribute in %s", file_path)
                                    self.issues_found += 1
                                    self.vulnerabilities['insecure_config'] += 1
                    except Exception as e:
                        logger.error("Error checking JavaScript cookies in %s: %s", file_path, str(e))
        
        if not cookie_settings_found:
            logger.info("No cookie settings found in the codebase")
    
    def check_csp(self):
        """Check for Content Security Policy"""
        csp_found = False
        
        # Check HTML files for CSP meta tag
        for root, _, files in os.walk(self.base_dir):
            for file in files:
                if file.endswith('.html') or file.endswith('.php'):
                    file_path = os.path.join(root, file)
                    
                    try:
                        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                            content = f.read()
                            
                            # Check for CSP meta tag
                            csp_meta = re.search(r'<meta\s+http-equiv=["\']Content-Security-Policy["\']', content)
                            
                            if csp_meta:
                                csp_found = True
                                logger.info("CSP meta tag found in %s", file_path)
                                
                                # Check for unsafe-inline or unsafe-eval
                                if 'unsafe-inline' in content or 'unsafe-eval' in content:
                                    logger.warning("CSP uses unsafe-inline or unsafe-eval in %s", file_path)
                                    self.issues_found += 1
                                    self.vulnerabilities['insecure_headers'] += 1
                    except Exception as e:
                        logger.error("Error checking CSP in %s: %s", file_path, str(e))
        
        # Already checked .htaccess for CSP header
        
        if not csp_found:
            logger.warning("No Content Security Policy found in HTML meta tags")
            self.issues_found += 1
            self.vulnerabilities['insecure_headers'] += 1
    
    def generate_report(self):
        """Generate a security report"""
        logger.info("\n--- Security Scan Report ---")
        logger.info("Files scanned: %d", self.files_scanned)
        logger.info("Issues found: %d", self.issues_found)
        logger.info("\nVulnerability summary:")
        
        for vuln_type, count in self.vulnerabilities.items():
            logger.info("  %s: %d", vuln_type.replace('_', ' ').title(), count)
        
        logger.info("\nRecommendations:")
        
        if self.vulnerabilities['xss'] > 0:
            logger.info("- Implement proper output escaping to prevent XSS attacks")
            logger.info("- Use a Content Security Policy to mitigate XSS impact")
        
        if self.vulnerabilities['csrf'] > 0:
            logger.info("- Add CSRF tokens to all forms")
            logger.info("- Validate CSRF tokens on the server-side")
        
        if self.vulnerabilities['sql_injection'] > 0:
            logger.info("- Use parameterized queries or prepared statements")
            logger.info("- Apply input validation and sanitization")
        
        if self.vulnerabilities['file_inclusion'] > 0:
            logger.info("- Validate and sanitize file paths")
            logger.info("- Use whitelisting for included files")
        
        if self.vulnerabilities['insecure_config'] > 0:
            logger.info("- Review and secure configuration settings")
            logger.info("- Move sensitive configuration to environment variables")
        
        if self.vulnerabilities['insecure_headers'] > 0:
            logger.info("- Implement all recommended security headers")
            logger.info("- Enforce HTTPS with HSTS")
        
        if self.vulnerabilities['sensitive_data'] > 0:
            logger.info("- Encrypt sensitive data")
            logger.info("- Review code for hardcoded credentials")
        
        logger.info("\nScan completed at %s", datetime.now().strftime('%Y-%m-%d %H:%M:%S'))

def main():
    parser = argparse.ArgumentParser(description='Security Scanner for TCAS Prep Website')
    parser.add_argument('--dir', default='.', help='Directory to scan (default: current directory)')
    args = parser.parse_args()
    
    if not os.path.isdir(args.dir):
        print(f"Error: Directory '{args.dir}' does not exist")
        sys.exit(1)
    
    # Create logs directory if it doesn't exist
    os.makedirs(os.path.join('logs'), exist_ok=True)
    
    scanner = SecurityScanner(args.dir)
    scanner.scan()

if __name__ == '__main__':
    main() 