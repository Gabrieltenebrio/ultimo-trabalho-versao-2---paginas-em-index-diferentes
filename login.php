<?php
//inicia a sessao
session_start();
// se o user estiver logado, manda pro painel
if (!empty($_SESSION['user_id'])) {
    header('location: admin.php');
    exit;
}
//puxa a conexao com o banco de dados
require_once __DIR__ . '/conexao.php';
//guarda os erros de login
$loginError = '';
//verifica se o formulario foi enviado
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    //pega os dados do formulario (usando 'senha' igual ta no name do html)
    $email = trim($_POST['email'] ?? '');
    $password = trim($_POST['senha'] ?? '');
    //verifica se o email e senha estao corretos
    $stmt = $pdo->prepare('SELECT * FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    if ($user && password_verify($password, $user['password'])) {
        //se estiver correto, inicia a sessao e redireciona para a pagina inicial
        $_SESSION['user_id'] = $user['id'];
        header('location: admin.php');
        exit;
    } else {
        //se nao estiver correto, mostra uma mensagem de erro
        $loginError = 'E-mail ou senha incorretos.';
    }
}
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gabe | Login</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <!-- fundo de particulas -->
    <canvas id="particulas" aria-hidden="true"></canvas>
    <header>
        <h1>Gabe</h1>
        <nav id="menu">
            <a href="index.html">Início</a>
            <a href="projetos.php">Projetos</a>
            <a href="seguir.html">Seguir</a>
        </nav>
        <button id="tema-botao" type="button" aria-label="Alternar tema">🌙</button>
    </header>
    <main>
        <!-- cartao com o formulario de login -->
        <section id="login">
            <div class="cartao-login">
                <h2>Login de Admin</h2>
               <?php if (!empty($loginError)): ?>
    <!-- mostra a mensagem vermelha se a senha estiver errada -->
    <p style="color: #ff6b6b; margin-bottom: 1rem;">
        <?= htmlspecialchars($loginError, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') ?>
    </p>
                <?php endif; ?>
                <form action="login.php" method="POST">
                    <label for="email">E-mail:</label>
                    <input type="email" id="email" name="email" required placeholder="admin@gabe.com">
                    <label for="senha">Senha:</label>
                    <input type="password" id="senha" name="senha" required placeholder="sua senha">
                    <button type="submit" class="botao-projeto" style="margin-top: 1rem; width: 100%;">Entrar</button>
                </form>
            </div>
        </section>
    </main>
    <!-- carrega o javascript do tema -->
    <script src="javascriptch.js"></script>
</body>
</html>