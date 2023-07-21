<?php

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $user = json_decode(file_get_contents('php://input'), true);
    
    $emailAdress = $user['recipient'];
    $subjectText = $user['subject'];
    $subject = '=?utf-8?B?'.base64_encode($subjectText).'?=';
    $message = $user['message'];
    $from = "Join <info.noreply.join@gmail.com>";
    // $from = "musician.tarik@gmx.de";

    $headers = "From: " . $from . "\r\n";
    $headers .= 'MIME-Version: 1.0' . "\r\n";
    $headers .= 'Content-type: text/html; charset=UTF-8';
    
    echo mail($emailAdress, $subject, $message, $headers) ? true : false;
}