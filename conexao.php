<?php
$servidor = getenv('DB_HOST') ?: '127.0.0.1';
$banco = getenv('DB_NAME') ?: 'portfolio';
$usuario = getenv('DB_USER') ?: 'root';
$senha = getenv('DB_PASS') ?: '';

$pdo = new PDO(
    "mysql:host=$servidor;dbname=$banco;charset=utf8mb4",
    $usuario,
    $senha,
    [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]
);
