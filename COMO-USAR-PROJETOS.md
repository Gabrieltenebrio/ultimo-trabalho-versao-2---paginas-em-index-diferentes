# Como ativar a lista de projetos

A página agora lê os projetos do MySQL usando PHP. Para isso, ela precisa ser aberta por um servidor com PHP; abrir o arquivo com um duplo clique ou publicar somente no GitHub Pages não executa PHP.

## Usando XAMPP no computador

1. Instale e abra o XAMPP. No painel, inicie **Apache** e **MySQL**.
2. Copie a pasta deste site para `C:\xampp\htdocs\meu-site`.
3. Abra `http://localhost/phpmyadmin` no navegador.
4. No phpMyAdmin, escolha **Importar**, selecione o arquivo `banco.sql` da pasta do site e confirme em **Importar**. Isso cria o banco `portfolio`, a tabela `projetos` e cadastra os três projetos que já estavam na página.
5. Abra `http://localhost/meu-site/projetos.php`.

O XAMPP costuma usar o usuário `root` sem senha no computador local. Esses são os valores padrão em `conexao.php`. Se a sua instalação MySQL usa outra configuração, altere os valores padrão desse arquivo. Nunca use `root` sem senha em um site publicado na internet.

## Alterar ou adicionar projetos

No phpMyAdmin, selecione o banco `portfolio` e a tabela `projetos`. Use **Inserir** para cadastrar um projeto ou **Editar** para mudar um existente. Preencha `nome`, `descricao` e `tecnologias`; `link` pode ficar vazio. Atualize a página `projetos.php` para ver as mudanças.

As outras páginas do site já apontam para `projetos.php`. Mantenha os arquivos PHP e SQL no servidor e não publique a senha do banco em repositórios públicos.
