<?php
// Disable display errors to prevent HTML output
ini_set('display_errors', '0');
ini_set('log_errors', '1');
ini_set('error_log', '/opt/homebrew/var/log/php_errors.log');
error_reporting(E_ALL & ~E_NOTICE & ~E_DEPRECATED);
header('Content-Type: application/json');

// Load PHPMailer
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
require 'vendor/autoload.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get form data with sanitization
    $firstName = filter_input(INPUT_POST, 'firstName', FILTER_SANITIZE_FULL_SPECIAL_CHARS);
    $lastName = filter_input(INPUT_POST, 'lastName', FILTER_SANITIZE_FULL_SPECIAL_CHARS);
    $email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
    $comments = filter_input(INPUT_POST, 'comments', FILTER_SANITIZE_FULL_SPECIAL_CHARS);
    
    // Initialize errors array
    $errors = [];
    
    // Validate data
    if (empty($firstName)) {
        $errors['firstName'] = 'First name is required';
    }
    
    if (empty($lastName)) {
        $errors['lastName'] = 'Last name is required';
    }
    
    if (empty($email)) {
        $errors['email'] = 'Email is required';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors['email'] = 'Invalid email format';
    }
    
    if (empty($comments)) {
        $errors['comments'] = 'Comments are required';
    }
    
    // Check if there are any validation errors
    if (!empty($errors)) {
        echo json_encode([
            'success' => false,
            'message' => 'Validation failed',
            'errors' => $errors
        ]);
        exit;
    }
    
    // Prepare data for JSON storage
    $submission = [
        'firstName' => $firstName,
        'lastName' => $lastName,
        'email' => $email,
        'comments' => $comments,
        'submissionTime' => date('Y-m-d H:i:s', strtotime('2025-05-21 13:45:00 +0530'))
    ];
    
    // Save to JSON file
    $jsonFile = 'submissions.json';
    $submissions = [];
    
    // Check if file exists and read existing data
    if (file_exists($jsonFile)) {
        $submissions = json_decode(file_get_contents($jsonFile), true);
        if (!is_array($submissions)) {
            $submissions = [];
        }
    }
    
    // Append new submission
    $submissions[] = $submission;
    
    // Save back to JSON file
    if (file_put_contents($jsonFile, json_encode($submissions, JSON_PRETTY_PRINT)) === false) {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to save submission data'
        ]);
        exit;
    }
    
    // Initialize PHPMailer
    $mail = new PHPMailer(true);
    
    // Buffer debug output to prevent breaking JSON
    ob_start();
    $mail->SMTPDebug = 3; // Detailed debug output
    $mail->Debugoutput = function($str, $level) {
        error_log("PHPMailer Debug [$level]: $str");
    };
    
    try {
        // SMTP Configuration for Gmail (used by GMass)
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = 'apoorwasandara@gmail.com'; // Your Gmail address
        $mail->Password = 'ncdjxjdmexrehflf'; // Replace with your Gmail App Password
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS; // Use SSL encryption
        $mail->Port = 465; // Gmail SMTP port
        $mail->CharSet = 'UTF-8'; // Ensure proper encoding
        $mail->Timeout = 30; // Increase timeout to 30 seconds
        $mail->SMTPOptions = [
            'ssl' => [
                'verify_peer' => false,
                'verify_peer_name' => false,
                'allow_self_signed' => true
            ]
        ]; // Relax SSL verification for local testing (remove in production)

        // Prepare user email
        $userSubject = "Thank you for contacting CinemaHouseLK";
        $userMessage = "
        <html>
        <head>
            <title>Thank you for your message</title>
        </head>
        <body>
            <div style='max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;'>
                <h2 style='color: #3b82f6;'>Thank You for Contacting Us</h2>
                <p>Dear " . htmlspecialchars($firstName) . " " . htmlspecialchars($lastName) . ",</p>
                <p>We have received your message and will get back to you as soon as possible.</p>
                <p>Here's a summary of the information you provided:</p>
                <div style='background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;'>
                    <p><strong>Name:</strong> " . htmlspecialchars($firstName) . " " . htmlspecialchars($lastName) . "</p>
                    <p><strong>Email:</strong> " . htmlspecialchars($email) . "</p>
                    <p><strong>Message:</strong> " . htmlspecialchars($comments) . "</p>
                </div>
                <p>If you have any additional questions, please don't hesitate to contact us.</p>
                <p>Best regards,<br>The CinemaHouseLK Team</p>
            </div>
        </body>
        </html>
        ";

        // Prepare admin email
        $adminSubject = "New Contact Form Submission from " . htmlspecialchars($firstName) . " " . htmlspecialchars($lastName);
        $adminMessage = "
        <html>
        <head>
            <title>New Contact Form Submission</title>
        </head>
        <body>
            <div style='max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;'>
                <h2 style='color: #3b82f6;'>New Contact Form Submission</h2>
                <p>A new contact form submission has been received with the following details:</p>
                <div style='background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;'>
                    <p><strong>Name:</strong> " . htmlspecialchars($firstName) . " " . htmlspecialchars($lastName) . "</p>
                    <p><strong>Email:</strong> " . htmlspecialchars($email) . "</p>
                    <p><strong>Message:</strong> " . htmlspecialchars($comments) . "</p>
                    <p><strong>Submission Time:</strong> " . $submission['submissionTime'] . "</p>
                </div>
                <p>Please respond to the inquiry at your earliest convenience.</p>
            </div>
        </body>
        </html>
        ";

        // Send user email
        $mail->setFrom('apoorwasandara@gmail.com', 'CinemaHouseLK');
        $mail->addAddress($email, htmlspecialchars($firstName) . ' ' . htmlspecialchars($lastName));
        $mail->isHTML(true);
        $mail->Subject = $userSubject;
        $mail->Body = $userMessage;
        $mail->send();

        // Clear recipients for admin email
        $mail->clearAddresses();
        $mail->clearCCs();
        $mail->clearBCCs();

        // Send admin email
        $adminEmails = [
            'dumidu.kodithuwakku@ebeyonds.com',
            'prabhath.senadheera@ebeyonds.com'
        ];

        foreach ($adminEmails as $adminEmail) {
            $mail->addAddress($adminEmail);
        }

        $mail->Subject = $adminSubject;
        $mail->Body = $adminMessage;
        $mail->send();

        // Clear debug output buffer
        ob_end_clean();

        // Return success response
        echo json_encode([
            'success' => true,
            'message' => 'Form submitted successfully and emails sent',
            'userEmail' => [
                'to' => $email,
                'subject' => $userSubject,
                'message' => $userMessage
            ],
            'adminEmail' => [
                'to' => $adminEmails,
                'subject' => $adminSubject,
                'message' => $adminMessage
            ]
        ]);
    } catch (Exception $e) {
        // Clear debug output buffer
        ob_end_clean();

        // Log error and return response
        error_log("PHPMailer error: " . $e->getMessage());
        echo json_encode([
            'success' => false,
            'message' => 'Failed to send email: ' . $e->getMessage(),
            'userEmail' => [
                'to' => $email,
                'subject' => $userSubject,
                'message' => $userMessage
            ],
            'adminEmail' => [
                'to' => $adminEmails,
                'subject' => $adminSubject,
                'message' => $adminMessage
            ]
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method'
    ]);
}
?>