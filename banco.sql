CREATE DATABASE IF NOT EXISTS portfolio
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE portfolio;

CREATE TABLE IF NOT EXISTS projetos (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    nome VARCHAR(120) NOT NULL,
    descricao TEXT NOT NULL,
    tecnologias VARCHAR(255) NOT NULL,
    link VARCHAR(2048) NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_projetos_nome (nome)
);

INSERT INTO projetos (nome, descricao, tecnologias, link)
VALUES
    (
        'Meu portfólio',
        'Site pessoal desenvolvido para apresentar minhas habilidades e meus projetos.',
        'HTML · CSS · JavaScript',
        'https://github.com/Gabrieltenebrio'
    ),
    (
        'Projeto de IoT',
        'Espaço para apresentar um projeto de Internet das Coisas quando estiver pronto.',
        'C++ · IoT',
        NULL
    ),
    (
        'Projeto de Python',
        'Espaço para apresentar um projeto de programação ou automação em Python.',
        'Python',
        NULL
    )
ON DUPLICATE KEY UPDATE id = id;

-- cria a tabela para guardar quem se inscreveu no site
CREATE TABLE IF NOT EXISTS seguidores (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_seguidores_email (email)
);


-- cria a tabela de usuarios para o login
CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_email (email)
);

-- cadastra o seu usuario de admin inicial com senha protegida
INSERT INTO users (email, password) 
VALUES (
    'admin@gabe.com', 
    '$2y$10$lgKAwJQxeBWFB2gfGY7v6.ag0Vib1MkFStzVFYKMrAVORfYVrsQXy'
) ON DUPLICATE KEY UPDATE email = email;
