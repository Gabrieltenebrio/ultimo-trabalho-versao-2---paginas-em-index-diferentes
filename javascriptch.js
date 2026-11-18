// olha se a pessoa quer menos ou mais movimento e anima as secoes da pagina conforme isso
const prefereMovimentoReduzido = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
);

// faz as secoes aparecerem quando rola a pagina
const secoes = document.querySelectorAll("main section");

if (secoes.length > 0) {
    const observador = new IntersectionObserver((entradas) => {
        entradas.forEach((entrada) => {
            if (entrada.isIntersecting) {
                entrada.target.classList.add("visivel");
            }
        });
    });

    secoes.forEach((secao) => {
        secao.classList.add("aparecer");
        observador.observe(secao);
    });
}

// anima o titulo e a pfp da pagina inicial
if (!prefereMovimentoReduzido.matches && typeof anime !== "undefined") {
    const tituloInicio = document.querySelector("#inicio h2");
    const imagemInicio = document.querySelector("#inicio img");

    if (tituloInicio) {
        anime.animate(tituloInicio, {
            opacity: [0, 1],
            translateY: [30, 0],
            duration: 1200,
            ease: "outExpo"
        });
    }

    if (imagemInicio) {
        anime.animate(imagemInicio, {
            opacity: [0, 1],
            scale: [0.8, 1],
            duration: 1000,
            delay: 300,
            ease: "outBack"
        });
    }
}

// abre e fecha o menu em telas menores
const menuBotao = document.querySelector("#menu-botao");
const menu = document.querySelector("#menu");

if (menuBotao && menu) {
    menuBotao.addEventListener("click", () => {
        menu.classList.toggle("menu-aberto");

        // muda o icon de abrir e fechar
        if (menu.classList.contains("menu-aberto")) {
            menuBotao.textContent = "✕";
        } else {
            menuBotao.textContent = "☰";
        }
    });

    // fecha se clicar em algum link do menu
    menu.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            menu.classList.remove("menu-aberto");
            menuBotao.textContent = "☰";
        });
    });
}

// elementos do player de musica
const player = document.querySelector("#player");
const botaoMusica = document.querySelector("#music-play");
const progressoMusica = document.querySelector("#music-progress");
const tempoAtualMusica = document.querySelector("#music-current");
const duracaoMusica = document.querySelector("#music-duration");
const controleVolume = document.querySelector("#music-volume");
const valorVolume = document.querySelector("#music-volume-value");
const statusMusica = document.querySelector("#music-status");

// so ativa o player se ele existir nessa pagina
if (player && botaoMusica) {
    // funcao basica pra formatar segundos em 00:00
    function formatarTempo(segundos) {
        if (!segundos) return "00:00";
        let min = Math.floor(segundos / 60);
        let seg = Math.floor(segundos % 60);
        if (min < 10) min = "0" + min;
        if (seg < 10) seg = "0" + seg;
        return min + ":" + seg;
    }

    // ajusta o volume inicial conforme o slider
    if (controleVolume) {
        player.volume = controleVolume.value;
    }

    // play e pause no botao
    botaoMusica.addEventListener("click", () => {
        if (player.paused) {
            player.play();
            botaoMusica.textContent = "❚❚";
            if (statusMusica) statusMusica.textContent = "Tocando";
        } else {
            player.pause();
            botaoMusica.textContent = "▶";
            if (statusMusica) statusMusica.textContent = "Pausada";
        }
    });

    // quando carregar a musica, pega o tempo total
    player.addEventListener("loadedmetadata", () => {
        if (duracaoMusica) {
            duracaoMusica.textContent = formatarTempo(player.duration);
        }
    });

    // atualiza a barra e o relogio enquanto toca
    player.addEventListener("timeupdate", () => {
        if (tempoAtualMusica) {
            tempoAtualMusica.textContent = formatarTempo(player.currentTime);
        }
        if (progressoMusica && player.duration) {
            progressoMusica.value = (player.currentTime / player.duration) * 100;
        }
    });

    // mudar o tempo clicando na barra
    if (progressoMusica) {
        progressoMusica.addEventListener("input", () => {
            player.currentTime = (progressoMusica.value / 100) * player.duration;
        });
    }

    // controle de volume
    if (controleVolume) {
        controleVolume.addEventListener("input", () => {
            player.volume = controleVolume.value;
            if (valorVolume) {
                valorVolume.textContent = Math.round(player.volume * 100) + "%";
            }
        });
    }
}

// fundo animado de particulas no canvas
const canvas = document.querySelector("#particulas");

if (canvas) {
    const ctx = canvas.getContext("2d");

    let largura = window.innerWidth;
    let altura = window.innerHeight;
    canvas.width = largura;
    canvas.height = altura;

    // redimensiona o canvas se a janela mudar
    window.addEventListener("resize", () => {
        largura = window.innerWidth;
        altura = window.innerHeight;
        canvas.width = largura;
        canvas.height = altura;
    });

    // cria 40 bolinhas com posicao e velocidade aleatoria
    const particulas = [];
    for (let i = 0; i < 40; i++) {
        particulas.push({
            x: Math.random() * largura,
            y: Math.random() * altura,
            raio: Math.random() * 2 + 1,
            velY: Math.random() * 0.5 + 0.2
        });
    }

    // desenha e movimenta as bolinhas
    function animar() {
        ctx.clearRect(0, 0, largura, altura);

        particulas.forEach((p, index) => {
            // sobe a bolinha
            p.y -= p.velY;
            if (p.y < 0) {
                p.y = altura;
                p.x = Math.random() * largura;
            }

            // desenha o circulo
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.raio, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(169, 112, 255, 0.5)";
            ctx.fill();

            // liga as bolinhas que estao perto uma da outra
            for (let j = index + 1; j < particulas.length; j++) {
                let p2 = particulas[j];
                let dx = p.x - p2.x;
                let dy = p.y - p2.y;
                let dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 100) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = "rgba(169, 112, 255, 0.15)";
                    ctx.stroke();
                }
            }
        });

        requestAnimationFrame(animar);
    }

    animar();
}

// pega o banner e os botoes para trocar os destaques
const slidesbanner = document.querySelectorAll("#banner .banner-slide");
const botaoAnterior = document.querySelector("#banner-anterior");
const botaoProximo = document.querySelector("#banner-proximo");

if (slidesbanner.length > 0 && botaoAnterior && botaoProximo) {
    let slideAtual = 0;

    // esconde o destaque atual e mostra o escolhido
    function mostrarSlide(indice) {
        slidesbanner[slideAtual].hidden = true;
        slideAtual = (indice + slidesbanner.length) % slidesbanner.length;
        slidesbanner[slideAtual].hidden = false;
    }

    botaoAnterior.addEventListener("click", () => {
        mostrarSlide(slideAtual - 1);
    });

    botaoProximo.addEventListener("click", () => {
        mostrarSlide(slideAtual + 1);
    });
}

// carrega o tema salvo e deixa trocar pelo botao
const botaoTema = document.querySelector("#tema-botao");

if (botaoTema) {
    const temaSalvo = localStorage.getItem("tema");

    if (temaSalvo === "claro") {
        document.body.classList.add("tema-claro");
    }

    botaoTema.addEventListener("click", () => {
        const temaClaroAtivo = document.body.classList.toggle("tema-claro");
        localStorage.setItem("tema", temaClaroAtivo ? "claro" : "escuro");
    });
}

// frases motivacionais / dicas
const frases = [
    "Mude uma coisa por vez e veja o resultado.",
    "Pequenas melhorias deixam um projeto cada vez melhor.",
    "Quando travar, tente explicar o problema em voz alta.",
    "Aprender programação é experimentar, errar e ajustar.",
    "Salve seu trabalho e comemore cada etapa concluída.",
    "Criar algo seu é uma ótima forma de aprender.",
    "Respire, revise o código e tente mais uma vez."
];

const botaoFrase = document.querySelector("#soltar-frase");
const textoFrase = document.querySelector("#frase-atual");
let ultimaFrase = -1;

// sorteia uma frase sem repetir a que acabou de sair
if (botaoFrase && textoFrase) {
    botaoFrase.addEventListener("click", () => {
        let indice;
        do {
            indice = Math.floor(Math.random() * frases.length);
        } while (indice === ultimaFrase);

        ultimaFrase = indice;
        textoFrase.textContent = frases[indice];
    });
}

// busca rapida de projetos
const campoPesquisa = document.querySelector("#pesquisa-proj");
const resultadoPesquisa = document.querySelector("#resultado-pesquisa");
const cartoesProjetos = document.querySelectorAll("#projetos .cartao-projeto");

if (campoPesquisa && cartoesProjetos.length > 0) {
    campoPesquisa.addEventListener("input", () => {
        const termo = campoPesquisa.value.toLowerCase().trim();
        let total = 0;

        cartoesProjetos.forEach((cartao) => {
            const texto = cartao.textContent.toLowerCase();

            // se tiver o termo, mostra, senao esconde
            if (texto.includes(termo)) {
                cartao.hidden = false;
                total++;
            } else {
                cartao.hidden = true;
            }
        });

        if (resultadoPesquisa) {
            if (total === 0) {
                resultadoPesquisa.textContent = "Nenhum projeto encontrado.";
            } else {
                resultadoPesquisa.textContent = `${total} projeto(s) encontrado(s).`;
            }
        }
    });
}

// aqui voce adiciona tarefas e pode marcar quando terminar
const formTarefa = document.querySelector("#form-tarefa");
const inputTarefa = document.querySelector("#text-tarefa");
const listaTarefas = document.querySelector("#lista-tarefas");
const avisoTarefa = document.querySelector("#resultado-tarefas");

if (formTarefa && inputTarefa && listaTarefas) {
    formTarefa.addEventListener("submit", (e) => {
        e.preventDefault(); // nao deixa a pagina recarregar

        const texto = inputTarefa.value.trim();

        if (texto === "") {
            if (avisoTarefa) avisoTarefa.textContent = "digite uma tarefa primeiro";
            return;
        }

        // cria o li com a checkbox
        const li = document.createElement("li");
        li.innerHTML = `<label><input type="checkbox"> ${texto}</label>`;
        listaTarefas.appendChild(li);

        inputTarefa.value = "";
        if (avisoTarefa) avisoTarefa.textContent = "tarefa adicionada";
    });
}
