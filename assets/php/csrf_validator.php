<?php
/**
 * CSRF Validator
 * Server-side validation for CSRF tokens
 */

class CSRFValidator {
    /**
     * Validate the CSRF token
     * 
     * @return bool True if token is valid, false otherwise
     */
    public static function validate() {
        // Check if the token exists in the request
        $token = self::getTokenFromRequest();
        if (!$token) {
            return false;
        }

        // Check if the token matches the one in the session
        return self::validateToken($token);
    }

    /**
     * Get the token from the request (POST, GET, or header)
     * 
     * @return string|null The token or null if not found
     */
    private static function getTokenFromRequest() {
        // Check POST data
        if (isset($_POST['csrf_token'])) {
            return $_POST['csrf_token'];
        }

        // Check GET data
        if (isset($_GET['csrf_token'])) {
            return $_GET['csrf_token'];
        }

        // Check headers
        $headers = self::getRequestHeaders();
        if (isset($headers['X-CSRF-Token'])) {
            return $headers['X-CSRF-Token'];
        }

        return null;
    }

    /**
     * Get all request headers
     * 
     * @return array The request headers
     */
    private static function getRequestHeaders() {
        $headers = [];
        
        if (function_exists('getallheaders')) {
            return getallheaders();
        }
        
        foreach ($_SERVER as $name => $value) {
            if (substr($name, 0, 5) == 'HTTP_') {
                $headers[str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($name, 5)))))] = $value;
            }
        }
        
        return $headers;
    }

    /**
     * Validate the token against the cookie
     * 
     * @param string $token The token to validate
     * @return bool True if token is valid, false otherwise
     */
    private static function validateToken($token) {
        if (!isset($_COOKIE['csrf_token'])) {
            return false;
        }
        
        return hash_equals($_COOKIE['csrf_token'], $token);
    }

    /**
     * Handle invalid CSRF token
     * 
     * @param string $redirectUrl Optional URL to redirect to
     */
    public static function handleInvalid($redirectUrl = null) {
        // Set the HTTP response code
        http_response_code(403);
        
        // Log the attempt
        self::logCSRFAttempt();
        
        // Either redirect or display an error
        if ($redirectUrl) {
            header("Location: $redirectUrl");
            exit;
        } else {
            echo "Invalid request detected. If you believe this is an error, please contact the administrator.";
            exit;
        }
    }

    /**
     * Log the CSRF attempt
     */
    private static function logCSRFAttempt() {
        $logFile = __DIR__ . '/../../logs/csrf_attempts.log';
        $logDir = dirname($logFile);
        
        // Create logs directory if it doesn't exist
        if (!file_exists($logDir)) {
            mkdir($logDir, 0755, true);
        }
        
        // Format log entry
        $timestamp = date('Y-m-d H:i:s');
        $ip = $_SERVER['REMOTE_ADDR'];
        $userAgent = isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : 'Unknown';
        $referer = isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : 'Unknown';
        $requestUri = $_SERVER['REQUEST_URI'];
        
        $logEntry = "[$timestamp] IP: $ip | UA: $userAgent | Referer: $referer | URI: $requestUri\n";
        
        // Write to log file
        file_put_contents($logFile, $logEntry, FILE_APPEND);
    }
}

/**
 * Example usage:
 * 
 * require_once 'csrf_validator.php';
 * 
 * if ($_SERVER['REQUEST_METHOD'] === 'POST') {
 *     if (!CSRFValidator::validate()) {
 *         CSRFValidator::handleInvalid('error.php');
 *     }
 *     
 *     // Process the form data
 *     // ...
 * }
 */
?> 