<?php
// inicia a sessao para poder apagar os dados dela
session_start();

// limpa todas as informacoes guardadas no cracha
$_SESSION = [];

// destroi a sessao por completo
session_destroy();

// manda a pessoa de volta para a pagina de login
header('location: login.php');
exit;
