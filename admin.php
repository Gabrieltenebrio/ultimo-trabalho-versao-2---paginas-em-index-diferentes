<?php
// inicia a sessao para conferir o cracha de acesso
session_start();

// se nao tiver o cracha de login, manda direto para a tela de login
if (empty($_SESSION['user_id'])) {
    header('location: login.php');
    exit;
}

// puxa a conexao com o banco de dados
require_once __DIR__ . '/conexao.php';

// guarda os avisos de sucesso ou de erro
$mensagemSucesso = '';
$mensagemErro = '';

// confere se enviou o formulario para mudar a senha
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['acao']) && $_POST['acao'] === 'mudar_senha') {
    // pega a nova senha digitada e tira espacos
    $novaSenha = trim($_POST['nova_senha'] ?? '');

    if (empty($novaSenha)) {
        $mensagemErro = 'Digite a nova senha.';
    } elseif (strlen($novaSenha) < 4) {
        $mensagemErro = 'A senha precisa ter pelo menos 4 caracteres.';
    } else {
        try {
            // protege a nova senha com hash antes de salvar
            $novoHash = password_hash($novaSenha, PASSWORD_DEFAULT);

            // atualiza a senha do usuario que esta logado
            $atualiza = $pdo->prepare('UPDATE users SET password = ? WHERE id = ?');
            $atualiza->execute([$novoHash, $_SESSION['user_id']]);

            $mensagemSucesso = 'Senha alterada com sucesso! Lembre-se de usar a nova senha no próximo login.';
        } catch (PDOException $erro) {
            error_log('Erro ao alterar senha: ' . $erro->getMessage());
            $mensagemErro = 'Não foi possível alterar a senha. Tente novamente.';
        }
    }
}

// confere se enviou o formulario para cadastrar um novo projeto
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['acao']) && $_POST['acao'] === 'novo_projeto') {
    // pega os dados digitados e tira espacos extras
    $nome = trim($_POST['nome'] ?? '');
    $descricao = trim($_POST['descricao'] ?? '');
    $tecnologias = trim($_POST['tecnologias'] ?? '');
    $link = trim($_POST['link'] ?? '');
    if ($link === '') {
        $link = null;
    }

    if (empty($nome) || empty($descricao) || empty($tecnologias)) {
        $mensagemErro = 'Preencha o nome, a descrição e as tecnologias.';
    } else {
        try {
            // salva o novo projeto no banco com prepared statement
            $comando = $pdo->prepare(
                'INSERT INTO projetos (nome, descricao, tecnologias, link) VALUES (:nome, :descricao, :tecnologias, :link)'
            );
            $comando->execute([
                ':nome' => $nome,
                ':descricao' => $descricao,
                ':tecnologias' => $tecnologias,
                ':link' => $link
            ]);
            $mensagemSucesso = 'Projeto cadastrado com sucesso! Já está aparecendo na página de Projetos.';
        } catch (PDOException $erro) {
            error_log('Erro ao cadastrar projeto: ' . $erro->getMessage());
            $mensagemErro = 'Não foi possível salvar o projeto. Verifique se o nome já não existe.';
        }
    }
}

// confere se clicou para apagar um projeto
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['acao']) && $_POST['acao'] === 'excluir_projeto') {
    $idProjeto = (int)($_POST['id'] ?? 0);
    if ($idProjeto > 0) {
        // apaga o projeto escolhido com seguranca
        $apaga = $pdo->prepare('DELETE FROM projetos WHERE id = :id');
        $apaga->execute([':id' => $idProjeto]);
        $mensagemSucesso = 'Projeto excluído com sucesso!';
    }
}

// busca todos os projetos cadastrados no banco
$projetos = $pdo->query('SELECT id, nome, descricao, tecnologias, link FROM projetos ORDER BY id DESC')->fetchAll();

// busca todas as pessoas que se inscreveram para seguir o site
$seguidores = [];
try {
    $seguidores = $pdo->query('SELECT id, email, criado_em FROM seguidores ORDER BY id DESC')->fetchAll();
} catch (PDOException $e) {
    // se a tabela de seguidores ainda nao existir deixa a lista vazia
    $seguidores = [];
}
?>
<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gabe | Painel Admin</title>
    <link rel="stylesheet" href="style.css">
    <style>
        .admin-painel {
            max-width: 900px;
            margin: 2rem auto;
            padding: 1.5rem;
        }
        .admin-bloco {
            background: rgba(25, 23, 36, 0.85);
            border: 1px solid rgba(138, 43, 226, 0.3);
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 2rem;
        }
        .admin-tabela {
            width: 100%;
            border-collapse: collapse;
            margin-top: 1rem;
        }
        .admin-tabela th, .admin-tabela td {
            padding: 0.75rem;
            text-align: left;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .admin-tabela th {
            color: #b784ff;
        }
        .botao-perigo {
            background: #e63946;
            color: white;
            border: none;
            padding: 0.4rem 0.8rem;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.85rem;
        }
        .botao-perigo:hover {
            background: #d62828;
        }
    </style>
</head>

<body>
    <!-- camada de fundo pras particulas -->
    <canvas id="particulas" aria-hidden="true"></canvas>

    <header>
        <h1>Painel Admin</h1>
        <nav id="menu">
            <a href="index.html">Início</a>
            <a href="projetos.php" target="_blank">Ver Projetos ↗</a>
            <a href="logout.php" style="color: #ff6b6b;">Sair (Logout)</a>
        </nav>
        <button id="tema-botao" type="button" aria-label="Alternar tema">🌙</button>
    </header>

    <main class="admin-painel">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <h2>Painel de Controle 👋</h2>
            <a href="logout.php" class="botao-perigo" style="text-decoration: none;">Sair da Conta</a>
        </div>

        <?php if (!empty($mensagemSucesso)): ?>
            <!-- aviso verde de sucesso -->
            <p style="background: rgba(46, 204, 113, 0.2); border: 1px solid #2ecc71; color: #2ecc71; padding: 0.75rem; border-radius: 8px; margin-bottom: 1.5rem;">
                <?= htmlspecialchars($mensagemSucesso, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') ?>
            </p>
        <?php endif; ?>

        <?php if (!empty($mensagemErro)): ?>
            <!-- aviso vermelho de erro -->
            <p style="background: rgba(231, 76, 60, 0.2); border: 1px solid #e74c3c; color: #ff6b6b; padding: 0.75rem; border-radius: 8px; margin-bottom: 1.5rem;">
                <?= htmlspecialchars($mensagemErro, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') ?>
            </p>
        <?php endif; ?>

        <!-- formulario para mudar a senha do admin com seguranca -->
        <section class="admin-bloco">
            <h3>🔑 Alterar Minha Senha</h3>
            <form action="admin.php" method="POST" style="margin-top: 1rem; display: flex; flex-direction: column; gap: 0.8rem; max-width: 420px;">
                <input type="hidden" name="acao" value="mudar_senha">

                <label for="nova_senha">Nova Senha:</label>
                <input type="password" id="nova_senha" name="nova_senha" required placeholder="Digite a nova senha desejada">

                <button type="submit" class="botao-projeto" style="width: auto;">Atualizar Senha</button>
            </form>
        </section>

        <!-- formulario para adicionar projetos direto pelo site sem phpmyadmin -->
        <section class="admin-bloco">
            <h3>➕ Cadastrar Novo Projeto</h3>
            <form action="admin.php" method="POST" style="margin-top: 1rem; display: flex; flex-direction: column; gap: 0.8rem;">
                <input type="hidden" name="acao" value="novo_projeto">

                <label for="nome">Nome do Projeto:</label>
                <input type="text" id="nome" name="nome" required placeholder="Ex: Automação Residencial com IoT">

                <label for="descricao">Descrição:</label>
                <textarea id="descricao" name="descricao" rows="3" required placeholder="Explique brevemente o projeto..." style="background: rgba(0,0,0,0.3); color: white; border: 1px solid rgba(255,255,255,0.2); padding: 0.5rem; border-radius: 6px;"></textarea>

                <label for="tecnologias">Tecnologias (separadas por ponto ou vírgula):</label>
                <input type="text" id="tecnologias" name="tecnologias" required placeholder="Ex: Python · IoT · C++">

                <label for="link">Link (opcional):</label>
                <input type="url" id="link" name="link" placeholder="https://github.com/...">

                <button type="submit" class="botao-projeto" style="margin-top: 0.5rem;">Publicar Projeto</button>
            </form>
        </section>

        <!-- lista com os projetos que ja existem para poder apagar -->
        <section class="admin-bloco">
            <h3>📂 Projetos Cadastrados (<?= count($projetos) ?>)</h3>
            <?php if (count($projetos) === 0): ?>
                <p style="margin-top: 0.5rem; color: #888;">Nenhum projeto cadastrado.</p>
            <?php else: ?>
                <table class="admin-tabela">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Tecnologias</th>
                            <th>Ação</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($projetos as $proj): ?>
                            <tr>
                                <td><strong><?= htmlspecialchars($proj['nome'], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') ?></strong></td>
                                <td><?= htmlspecialchars($proj['tecnologias'], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') ?></td>
                                <td>
                                    <!-- formulario para apagar o projeto -->
                                    <form action="admin.php" method="POST" onsubmit="return confirm('Tem certeza que deseja apagar este projeto?');" style="display: inline;">
                                        <input type="hidden" name="acao" value="excluir_projeto">
                                        <input type="hidden" name="id" value="<?= (int)$proj['id'] ?>">
                                        <button type="submit" class="botao-perigo">Excluir</button>
                                    </form>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            <?php endif; ?>
        </section>

        <!-- lista com os emails de quem se inscreveu em seguir -->
        <section class="admin-bloco">
            <h3>💌 Seguidores (<?= count($seguidores) ?>)</h3>
            <?php if (count($seguidores) === 0): ?>
                <p style="margin-top: 0.5rem; color: #888;">Nenhum seguidor ainda.</p>
            <?php else: ?>
                <table class="admin-tabela">
                    <thead>
                        <tr>
                            <th>E-mail</th>
                            <th>Data</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($seguidores as $seg): ?>
                            <tr>
                                <td><?= htmlspecialchars($seg['email'], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') ?></td>
                                <td><?= htmlspecialchars(date('d/m/Y H:i', strtotime($seg['criado_em'])), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') ?></td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            <?php endif; ?>
        </section>
    </main>

    <!-- script de animacao e tema -->
    <script src="javascriptch.js"></script>
</body>

</html>
