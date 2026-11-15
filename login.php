<?php
// inicia a sessao para lembrar se a pessoa ja fez login
session_start();

// se o usuario ja estiver logado, manda direto pro painel
if (!empty($_SESSION['user_id'])) {
    header('location: admin.php');
    exit;
}

// puxa a conexao com o banco de dados
require_once __DIR__ . '/conexao.php';

// guarda mensagem de aviso se a senha estiver errada
$loginError = '';

// garante que a tabela de usuarios existe antes de tentar o login
$pdo->exec(
    'CREATE TABLE IF NOT EXISTS users (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_users_email (email)
    )'
);

// se nao tiver nenhum usuario cria a conta padrao de admin automaticamente
$totalUsers = (int)$pdo->query('SELECT COUNT(*) FROM users')->fetchColumn();
if ($totalUsers === 0) {
    // cria o primeiro admin com a senha protegida por hash
    $criaAdmin = $pdo->prepare('INSERT INTO users (email, password) VALUES (?, ?)');
    $criaAdmin->execute([
        'admin@gabe.com',
        password_hash('admin123', PASSWORD_DEFAULT)
    ]);
}

// verifica se o formulario foi enviado
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // pega os dados digitados e limpa espacos
    $email = trim($_POST['email'] ?? '');
    $password = trim($_POST['senha'] ?? '');

    if (empty($email) || empty($password)) {
        $loginError = 'Preencha o e-mail e a senha.';
    } else {
        // busca no banco se existe usuario com esse email
        $stmt = $pdo->prepare('SELECT * FROM users WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        // confere se o usuario existe e se a senha digitada bate com a protegida
        if ($user && password_verify($password, $user['password'])) {
            // guarda o id na sessao para dar o cracha de acesso
            $_SESSION['user_id'] = $user['id'];

            // manda para o painel de administracao
            header('location: admin.php');
            exit;
        } else {
            // aviso se errar o email ou a senha
            $loginError = 'E-mail ou senha incorretos.';
        }
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
    <!-- camada de fundo pras particulas -->
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
                    <p style="color: #ff6b6b; margin-bottom: 1rem; font-weight: bold;">
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

                <p style="font-size: 0.85rem; color: #888; margin-top: 1.5rem; text-align: center;">
                    Admin inicial: <code>admin@gabe.com</code> | senha: <code>admin123</code>
                </p>
            </div>
        </section>
    </main>

    <!-- carrega o javascript do tema -->
    <script src="javascriptch.js"></script>
</body>

</html>
