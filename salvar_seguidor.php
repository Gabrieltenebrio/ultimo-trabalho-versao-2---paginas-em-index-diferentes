<?php
// puxa a conexao com o banco de dados
require_once __DIR__ . '/conexao.php';

// guarda a mensagem e se deu certo ou errado
$mensagem = '';
$sucesso = false;

// confere se os dados foram enviados pelo formulario
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // pega o email digitado e tira espacos extras
    $email = trim($_POST['email'] ?? '');

    // confere se o email esta vazio ou escrito errado
    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $mensagem = 'Por favor, digite um e-mail válido.';
    } else {
        try {
            // garante que a tabela existe antes de tentar salvar
            $pdo->exec(
                'CREATE TABLE IF NOT EXISTS seguidores (
                    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
                    email VARCHAR(255) NOT NULL,
                    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (id),
                    UNIQUE KEY uq_seguidores_email (email)
                )'
            );

            // prepara o comando para salvar sem perigo de invasao
            $comando = $pdo->prepare(
                'INSERT INTO seguidores (email) VALUES (:email)
                 ON DUPLICATE KEY UPDATE email = email'
            );

            // troca o marcador pelo email real e salva no banco
            $comando->execute([':email' => $email]);

            // monta o assunto e o texto de agradecimento
            $assunto = 'Obrigado por me seguir!';
            $corpo = "Olá!\n\nMuito obrigado por se inscrever para acompanhar meu trabalho e meus projetos.\nEm breve você receberá novidades por aqui!\n\nUm abraço,\nGabe.";

            // cabecalhos para o email sair com o remetente e acentos certos
            $cabecalhos = "From: contato@seusite.com\r\n" .
                          "Reply-To: contato@seusite.com\r\n" .
                          "Content-Type: text/plain; charset=UTF-8\r\n";

            // manda a mensagem pro email da pessoa
            @mail($email, $assunto, $corpo, $cabecalhos);

            $sucesso = true;
            $mensagem = 'Obrigado por seguir! Enviamos um e-mail de agradecimento para você.';
        } catch (PDOException $erro) {
            // anota o erro no servidor se der problema no banco
            error_log('Erro ao salvar seguidor: ' . $erro->getMessage());
            $mensagem = 'Não foi possível concluir a inscrição agora. Tente novamente mais tarde.';
        }
    }
} else {
    // se tentar abrir a pagina direto sem formulario volta pro comeco
    header('Location: seguir.html');
    exit;
}
?>
<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inscrição</title>
    <link rel="stylesheet" href="style.css">
</head>

<body>
    <!-- camada de fundo para as particulas -->
    <canvas id="particulas" aria-hidden="true"></canvas>

    <main>
        <!-- cartao que mostra o aviso se deu certo ou errado -->
        <section id="login">
            <div class="cartao-login">
                <h2><?= $sucesso ? 'Tudo certo!' : 'Atenção' ?></h2>
                <p><?= htmlspecialchars($mensagem, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') ?></p>
                <a href="seguir.html" class="botao-projeto" style="text-decoration: none; display: inline-block; margin-top: 1rem; text-align: center;">Voltar</a>
            </div>
        </section>
    </main>

    <!-- carrega o script para manter o visual e as particulas -->
    <script src="javascriptch.js"></script>
</body>

</html>
