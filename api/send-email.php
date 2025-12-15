<?php
/**
 * DVE Estate - Contact Form Email Handler
 * 
 * This script handles form submissions and sends emails
 * Usage: POST request to this endpoint with form data
 */

// Enable error reporting for debugging (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// CORS Headers (adjust origin for production)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed'
    ]);
    exit();
}

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

// Validate input data
$name = isset($data['name']) ? trim($data['name']) : '';
$email = isset($data['email']) ? trim($data['email']) : '';
$phone = isset($data['phone']) ? trim($data['phone']) : 'Не указан';
$message = isset($data['message']) ? trim($data['message']) : '';

// Validation
$errors = [];

if (empty($name) || strlen($name) < 2) {
    $errors[] = 'Имя должно содержать минимум 2 символа';
}

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Введите корректный email адрес';
}

if (empty($message) || strlen($message) < 10) {
    $errors[] = 'Сообщение должно содержать минимум 10 символов';
}

if (!empty($errors)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => implode(', ', $errors)
    ]);
    exit();
}

// ===== EMAIL CONFIGURATION =====
$to = 'dvegroupp@gmail.com';  // Recipient email
$subject = 'Новая заявка с сайта DVE от ' . $name;
$headers = [
    'From: DVE Estate Website <noreply@dve-estate.ru>',
    'Reply-To: ' . $email,
    'X-Mailer: PHP/' . phpversion(),
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8'
];

// Email body (HTML)
$emailBody = '
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f6ef; }
        .header { background-color: #142434; color: #fff; padding: 20px; text-align: center; }
        .content { background-color: #fff; padding: 30px; margin-top: 20px; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #142434; }
        .value { color: #666; margin-top: 5px; }
        .footer { text-align: center; margin-top: 20px; color: #999; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0; font-size: 24px;">DVE Estate</h1>
            <p style="margin: 10px 0 0 0;">Новая заявка с сайта</p>
        </div>
        
        <div class="content">
            <div class="field">
                <div class="label">Имя:</div>
                <div class="value">' . htmlspecialchars($name) . '</div>
            </div>
            
            <div class="field">
                <div class="label">Email:</div>
                <div class="value">' . htmlspecialchars($email) . '</div>
            </div>
            
            <div class="field">
                <div class="label">Телефон:</div>
                <div class="value">' . htmlspecialchars($phone) . '</div>
            </div>
            
            <div class="field">
                <div class="label">Сообщение:</div>
                <div class="value">' . nl2br(htmlspecialchars($message)) . '</div>
            </div>
        </div>
        
        <div class="footer">
            <p>Это автоматическое сообщение от формы обратной связи на сайте DVE Estate</p>
            <p>Дата: ' . date('d.m.Y H:i:s') . '</p>
        </div>
    </div>
</body>
</html>
';

// Send email
try {
    $mailSent = mail($to, $subject, $emailBody, implode("\r\n", $headers));
    
    if ($mailSent) {
        // Log successful submission (optional)
        logSubmission($name, $email, $phone, true);
        
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Ваше сообщение успешно отправлено'
        ]);
    } else {
        throw new Exception('Failed to send email');
    }
} catch (Exception $e) {
    // Log error
    error_log('Email sending error: ' . $e->getMessage());
    logSubmission($name, $email, $phone, false);
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Ошибка отправки сообщения. Пожалуйста, попробуйте позже.'
    ]);
}

/**
 * Log form submissions to a file (optional)
 */
function logSubmission($name, $email, $phone, $success) {
    $logFile = __DIR__ . '/submissions.log';
    $timestamp = date('Y-m-d H:i:s');
    $status = $success ? 'SUCCESS' : 'FAILED';
    $logEntry = "[$timestamp] $status - Name: $name, Email: $email, Phone: $phone\n";
    
    file_put_contents($logFile, $logEntry, FILE_APPEND);
}

/**
 * Alternative: Using PHPMailer for better email delivery
 * 
 * Uncomment and configure if you want to use SMTP instead of mail()
 * Download PHPMailer: https://github.com/PHPMailer/PHPMailer
 */

/*
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php';

function sendEmailWithPHPMailer($name, $email, $phone, $message) {
    $mail = new PHPMailer(true);
    
    try {
        // SMTP Configuration
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';  // Your SMTP host
        $mail->SMTPAuth = true;
        $mail->Username = 'your-email@gmail.com';  // Your email
        $mail->Password = 'your-app-password';      // Your app password
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 587;
        $mail->CharSet = 'UTF-8';
        
        // Recipients
        $mail->setFrom('noreply@dve-estate.ru', 'DVE Estate Website');
        $mail->addAddress('dvegroupp@gmail.com');
        $mail->addReplyTo($email, $name);
        
        // Content
        $mail->isHTML(true);
        $mail->Subject = 'Новая заявка с сайта DVE от ' . $name;
        $mail->Body = getEmailBody($name, $email, $phone, $message);
        
        $mail->send();
        return true;
    } catch (Exception $e) {
        error_log("PHPMailer Error: {$mail->ErrorInfo}");
        return false;
    }
}
*/

/**
 * Security: Rate Limiting (prevent spam)
 * 
 * Uncomment to enable simple rate limiting
 */

/*
function checkRateLimit($ip) {
    $limitFile = __DIR__ . '/rate_limit.json';
    $maxRequests = 5;  // Maximum requests per hour
    $timeWindow = 3600; // 1 hour in seconds
    
    $limits = [];
    if (file_exists($limitFile)) {
        $limits = json_decode(file_get_contents($limitFile), true);
    }
    
    $now = time();
    
    // Clean old entries
    $limits = array_filter($limits, function($timestamp) use ($now, $timeWindow) {
        return ($now - $timestamp) < $timeWindow;
    });
    
    // Check if IP exceeded limit
    $ipRequests = isset($limits[$ip]) ? count($limits[$ip]) : 0;
    
    if ($ipRequests >= $maxRequests) {
        http_response_code(429);
        echo json_encode([
            'success' => false,
            'message' => 'Слишком много запросов. Пожалуйста, попробуйте позже.'
        ]);
        exit();
    }
    
    // Record request
    if (!isset($limits[$ip])) {
        $limits[$ip] = [];
    }
    $limits[$ip][] = $now;
    
    file_put_contents($limitFile, json_encode($limits));
}

// Uncomment to enable
// checkRateLimit($_SERVER['REMOTE_ADDR']);
*/

?>
