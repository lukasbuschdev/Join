<?php

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $user = json_decode(file_get_contents('php://input'), true);
    $emailAdress = $user['recipient'];
    $message = $user['message'];
    $token = $user['token'];

    $subject = "Confirm your Account";
    $headers = "From: musician.tarik@gmx.de" . "\r\n";
    $headers .= 'MIME-Version: 1.0' . "\r\n";
    $headers .= 'Content-type: text/html; charset=UTF-8';
    
    if(mail($emailAdress, $subject, $message, $headers)){
        echo 'Email sent!';
    } else {
        echo '';
    };
}