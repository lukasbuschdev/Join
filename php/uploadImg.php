<?php

if (isset($_POST['uid']))
{
    header("Access-Control-Allow-Origin: *");
    $uid = $_POST['uid'];
    $target = '';
    if (isset($_FILES['user-img'])) {
        $file = $_FILES['user-img'];
        $fileName = $file['name'];
        $tempName = $file['tmp_name'];
        $extension = pathinfo($fileName, PATHINFO_EXTENSION);
        $target = '../assets/img/userImg/'. $uid . '.' . $extension;
    }
    
    $imgDir = scandir('../assets/img/userImg');
    $userImg = preg_grep("/^$uid/", $imgDir);
    $userImgExists = !empty($userImg);

    if ($userImgExists) {
        foreach($userImg as $img) {
            unlink('../assets/img/userImg/' . $img);
        }
    }

    if (isset($file)) {
        move_uploaded_file($tempName, $target);
    }
    
    $data = array(
        'imageSrc'  => '' . $target
    );
    echo json_encode($data);
}
