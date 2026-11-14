<?php
//incia o login e depois apaga os dados

session_start();
// limpa as info da sessoes
$_SESSION = [];
// o nome ja diz, mas isso destroi a sessao totalmente
session_destroy();

//manda ele de volta para a pagina de login
header('location: login.php');
exit;

