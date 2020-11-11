<?php
ini_set( 'opcache.enable', 0 );
header('content-type: application/json; charset=utf-8');
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");
header('access-control-allow-origin: *');

function check_url($url, $resolve_array = false ) {
	
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    if($resolve_array != false){
    	curl_setopt($ch, CURLOPT_RESOLVE, $resolve_array );
    }
	curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'User-Agent: Webskipperbot/1.0',
        'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Encoding: gzip, deflate'
    ]);
    curl_setopt($ch, CURLOPT_HEADER, true);
    curl_setopt($ch, CURLOPT_NOBODY, true);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_FRESH_CONNECT, true);
    //curl_setopt($ch, CURLOPT_COOKIESESSION, true);    
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
    curl_setopt($ch, CURLOPT_FAILONERROR, false);
    //curl_setopt($ch, CURLOPT_MAXREDIRS, 10);
    $data = curl_exec($ch);
    $headers = curl_getinfo($ch);
    curl_close($ch);
    
    //return $headers['http_code'];
    return $headers;
}

$url = $_POST['url'];
/* Array of allowed hosts */
/*$host_ip_array = Array( "sub.example.com:192.168.0.1",
						"www.example.com:127.0.0.1",
						"example.com:0.0.0.0",
					);*/
$host_ip_array = false;

echo json_encode( check_url( trim($url), $host_ip_array ), JSON_PRETTY_PRINT );

?>