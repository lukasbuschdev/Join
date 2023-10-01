<?php

if (isset($_POST['uid']))
{
    header("Access-Control-Allow-Origin: *");
    $uid = $_POST['uid'];
    $target = '';
    $directory = $_SERVER['DOCUMENT_ROOT'] . '/Join/assets/img/userImg/';
    if (isset($_FILES['user-img'])) {
        $file = $_FILES['user-img'];
        $fileName = $file['name'];
        $tempName = $file['tmp_name'];
        $extension = pathinfo($fileName, PATHINFO_EXTENSION);
        $target = $directory . $uid . '.' . $extension;
    }
    
    $imgDir = scandir($directory);
    $userImg = array_values(preg_grep("/^$uid/", $imgDir));
    $userImgExists = !empty($userImg);

    if ($userImgExists) {
        foreach($userImg as $img) {
            unlink($directory . $userImg[0]);
        }
    }

    if (isset($file)) {
        move_uploaded_file($tempName, $target); 
        $data = array(
            'imageSrc'  => '/Join/assets/img/userImg/' . $uid . '.' . $extension
        );
        echo json_encode($data);
    } 
}
