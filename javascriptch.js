// confere se a pessoa prefere menos movimento na pagina
const prefereMovimentoReduzido = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
);

// pega as secoes para mostrar elas quando aparecem na tela
const secoes = document.querySelectorAll("main section");

// mostra tudo sem animacao se a pessoa preferir menos movimento
if (prefereMovimentoReduzido.matches || !("IntersectionObserver" in window)) {
    secoes.forEach((secao) => {
        secao.classList.add("visivel");
    });
} else {
    // observa as secoes e mostra cada uma quando ela aparece
    const observador = new IntersectionObserver(
        (entradas) => {
            entradas.forEach((entrada) => {
                if (entrada.isIntersecting) {
                    entrada.target.classList.add("visivel");
                    observador.unobserve(entrada.target);
                }
            });
        },
        {
            threshold: 0.15
        }
    );

    secoes.forEach((secao) => {
        secao.classList.add("aparecer");
        observador.observe(secao);
    });
}

// anima o titulo e a foto da pagina inicial
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
        const aberto = menu.classList.toggle("menu-aberto");

        menuBotao.setAttribute("aria-expanded", aberto);
        menuBotao.setAttribute(
            "aria-label",
            aberto ? "Fechar menu" : "Abrir menu"
        );
        menuBotao.textContent = aberto ? "✕" : "☰";
    });

    menu.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            menu.classList.remove("menu-aberto");
            menuBotao.setAttribute("aria-expanded", "false");
            menuBotao.setAttribute("aria-label", "Abrir menu");
            menuBotao.textContent = "☰";
        });
    });
}

// pega os controles do player de musica
const player = document.querySelector("#player");
const botaoMusica = document.querySelector("#music-play");
const progressoMusica = document.querySelector("#music-progress");
const tempoAtualMusica = document.querySelector("#music-current");
const duracaoMusica = document.querySelector("#music-duration");
const controleVolume = document.querySelector("#music-volume");
const valorVolume = document.querySelector("#music-volume-value");
const statusMusica = document.querySelector("#music-status");

if (
    player &&
    botaoMusica &&
    progressoMusica &&
    tempoAtualMusica &&
    duracaoMusica &&
    controleVolume &&
    valorVolume &&
    statusMusica
) {
    // transforma a duracao em minutos e segundos
    const formatarTempo = (tempo) => {
        if (!Number.isFinite(tempo)) {
            return "00:00";
        }

        const minutos = Math.floor(tempo / 60);
        const segundos = Math.floor(tempo % 60);

        return `${String(minutos).padStart(2, "0")}:${String(segundos).padStart(2, "0")}`;
    };

    // atualiza a duracao assim que o navegador carrega a musica
    const atualizarDuracao = () => {
        duracaoMusica.textContent = formatarTempo(player.duration);
        progressoMusica.disabled = !Number.isFinite(player.duration);
    };

    // mostra o tempo atual e move a barra de progresso
    const atualizarProgresso = () => {
        tempoAtualMusica.textContent = formatarTempo(player.currentTime);

        if (Number.isFinite(player.duration) && player.duration > 0) {
            progressoMusica.value = String(
                (player.currentTime / player.duration) * 100
            );
        }
    };

    player.volume = Number(controleVolume.value);
    valorVolume.textContent = `${Math.round(player.volume * 100)}%`;
    atualizarDuracao();

    // toca ou pausa a musica quando apertar o botao
    botaoMusica.addEventListener("click", () => {
        if (player.paused) {
            player.play().catch(() => {
                statusMusica.textContent =
                    "Não foi possível reproduzir a música.";
            });
        } else {
            player.pause();
        }
    });

    // atualiza o botao e o aviso quando a musica toca ou para
    player.addEventListener("play", () => {
        botaoMusica.textContent = "❚❚";
        botaoMusica.setAttribute("aria-label", "Pausar música");
        statusMusica.textContent = "Tocando";
    });

    player.addEventListener("pause", () => {
        botaoMusica.textContent = "▶";
        botaoMusica.setAttribute("aria-label", "Reproduzir música");

        if (!player.ended && !player.error) {
            statusMusica.textContent = "Pausada";
        }
    });

    // mostra avisos se a musica terminar ou der erro
    player.addEventListener("ended", () => {
        statusMusica.textContent = "Música finalizada";
    });

    player.addEventListener("error", () => {
        statusMusica.textContent = "Não foi possível carregar a música.";
    });

    player.addEventListener("loadedmetadata", atualizarDuracao);
    player.addEventListener("durationchange", atualizarDuracao);
    player.addEventListener("timeupdate", atualizarProgresso);

    // deixa mudar o ponto da musica pela barra
    progressoMusica.addEventListener("input", () => {
        if (Number.isFinite(player.duration)) {
            player.currentTime =
                (Number(progressoMusica.value) / 100) * player.duration;
        }
    });

    // muda o volume e atualiza o numero na tela
    controleVolume.addEventListener("input", () => {
        player.volume = Number(controleVolume.value);
        valorVolume.textContent = `${Math.round(player.volume * 100)}%`;
    });
}

// prepara a tela onde as particulas vao aparecer
const canvas = document.querySelector("#particulas");
const ctx = canvas?.getContext("2d");

if (canvas && ctx) {
    let particulas = [];
    let largura = 0;
    let altura = 0;
    let animacaoParticulas;

    // ajusta o tamanho da tela e cria as particulas
    function ajustarCanvas() {
        const escala = Math.min(window.devicePixelRatio || 1, 2);

        largura = window.innerWidth;
        altura = window.innerHeight;

        canvas.width = largura * escala;
        canvas.height = altura * escala;
        canvas.style.width = `${largura}px`;
        canvas.style.height = `${altura}px`;

        ctx.setTransform(escala, 0, 0, escala, 0, 0);

        const quantidade = Math.min(
            70,
            Math.floor((largura * altura) / 14000)
        );

        particulas = Array.from({ length: quantidade }, () => ({
            x: Math.random() * largura,
            y: Math.random() * altura,
            raio: Math.random() * 2 + 0.5,
            velocidade: Math.random() * 0.35 + 0.1,
            opacidade: Math.random() * 0.6 + 0.2
        }));
    }

    // desenha as particulas e liga as que estao perto
    function desenharParticulas() {
        ctx.clearRect(0, 0, largura, altura);

        particulas.forEach((particula, indice) => {
            particula.y -= particula.velocidade;

            if (particula.y < -5) {
                particula.y = altura + 5;
                particula.x = Math.random() * largura;
            }

            ctx.beginPath();
            ctx.arc(
                particula.x,
                particula.y,
                particula.raio,
                0,
                Math.PI * 2
            );
            ctx.fillStyle = `rgba(169, 112, 255, ${particula.opacidade})`;
            ctx.fill();

            for (let proxima = indice + 1; proxima < particulas.length; proxima++) {
                const outra = particulas[proxima];
                const dx = particula.x - outra.x;
                const dy = particula.y - outra.y;
                const distanciaQuadrada = dx * dx + dy * dy;

                if (distanciaQuadrada < 110 * 110) {
                    const distancia = Math.sqrt(distanciaQuadrada);

                    ctx.beginPath();
                    ctx.moveTo(particula.x, particula.y);
                    ctx.lineTo(outra.x, outra.y);
                    ctx.strokeStyle =
                        `rgba(112, 44, 255, ${0.15 * (1 - distancia / 110)})`;
                    ctx.lineWidth = 0.6;
                    ctx.stroke();
                }
            }
        });

        animacaoParticulas = requestAnimationFrame(desenharParticulas);
    }

    // liga ou pausa o efeito conforme a preferencia de movimento
    function atualizarAnimacaoParticulas() {
        if (animacaoParticulas) {
            cancelAnimationFrame(animacaoParticulas);
            animacaoParticulas = undefined;
        }

        if (prefereMovimentoReduzido.matches) {
            ctx.clearRect(0, 0, largura, altura);
            return;
        }

        ajustarCanvas();
        desenharParticulas();
    }

    atualizarAnimacaoParticulas();
    window.addEventListener("resize", ajustarCanvas);
    prefereMovimentoReduzido.addEventListener(
        "change",
        atualizarAnimacaoParticulas
    );
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

// aqui ficam as frases que podem sair na roleta
const frases = [
    "Cada linha de código é mais um passo.",
    "Erros também ajudam a gente a aprender.",
    "Um projeto simples terminado já é uma conquista.",
    "Pratique um pouco hoje e você saberá mais amanhã.",
    "Divida um problema grande em partes menores.",
    "Continue tentando, mesmo quando o código não funcionar.",
    "Boas perguntas ajudam a encontrar boas soluções.",
    "Teste suas ideias para descobrir o que funciona.",
    "Todo desenvolvedor já precisou pesquisar uma resposta.",
    "Faça funcionar primeiro e depois melhore com calma.",
    "Uma página de cada vez também constrói um grande projeto.",
    "Aprender a procurar respostas também é uma habilidade.",
    "Seu progresso aparece quando você olha para onde começou.",
    "Mude uma coisa por vez e veja o resultado.",
    "Pequenas melhorias deixam um projeto cada vez melhor.",
    "Quando travar, tente explicar o problema em voz alta.",
    "Aprender programação é experimentar, errar e ajustar.",
    "Salve seu trabalho e comemore cada etapa concluída.",
    "Criar algo seu é uma ótima forma de aprender.",
    "Respire, revise o código e tente mais uma vez."
];
// aqui o botao escolhe uma frase e mostra na pagina
const botaoFrase = document.querySelector("#soltar-frase");
const textoFrase = document.querySelector("#frase-atual");
let ultimaFrase = -1;

if (botaoFrase && textoFrase) {
    botaoFrase.addEventListener("click", () => {
        let indiceFrase;

        do {
            indiceFrase = Math.floor(Math.random() * frases.length);
   } while (indiceFrase === ultimaFrase);

        ultimaFrase = indiceFrase;
        textoFrase.textContent = frases[indiceFrase];
    });
}

// pega o campo e os cartoes para filtrar os projetos
const campopesquisa = document.querySelector("#pesquisa-proj");
const resultadoPesquisa = document.querySelector("#resultado-pesquisa");
const cartoesProjetos = document.querySelectorAll("#projetos .cartao-projeto");

if (campopesquisa && resultadoPesquisa && cartoesProjetos.length > 0) {
    // refaz a busca toda vez que o texto muda
    campopesquisa.addEventListener("input", () => {
        const pesquisa = campopesquisa.value.trim().toLocaleLowerCase("pt-BR");
        let quantidadeEncontrada = 0;

        cartoesProjetos.forEach((cartao) => {
            const textoCartao = cartao.textContent.trim().toLocaleLowerCase("pt-BR");
            const encontrado = textoCartao.includes(pesquisa);

            cartao.hidden = !encontrado;

            if (encontrado) {
                quantidadeEncontrada++;
            }
        });

        resultadoPesquisa.textContent = quantidadeEncontrada === 0
            ? "Nenhum projeto encontrado."
            : `${quantidadeEncontrada} projeto(s) encontrado(s).`;
    });
}

// aqui voce adiciona tarefas e pode marcar quando terminar
const formularioTarefa = document.querySelector("#form-tarefa");
const campoTarefa = document.querySelector("#text-tarefa");
const listaTarefas = document.querySelector("#lista-tarefas");
const resultadoTarefas = document.querySelector("#resultado-tarefas");

if (formularioTarefa && campoTarefa && listaTarefas && resultadoTarefas) {
    // pega o texto e cria uma tarefa quando enviar o formulario
    formularioTarefa.addEventListener("submit", (evento) => {
        evento.preventDefault();

        const textoTarefa = campoTarefa.value.trim();

        if (textoTarefa === "") {
            resultadoTarefas.textContent = "digite uma tarefa primeiro";
            return;
        }

        // cria uma caixinha para poder marcar a tarefa pronta
        const itemTarefa = document.createElement("li");
        const marcarTarefa = document.createElement("input");
        const texto = document.createTextNode(` ${textoTarefa}`);
        const etiquetaTarefa = document.createElement("label");

        marcarTarefa.type = "checkbox";
        etiquetaTarefa.append(marcarTarefa, texto);
        itemTarefa.appendChild(etiquetaTarefa);
        listaTarefas.appendChild(itemTarefa);

        campoTarefa.value = "";
        resultadoTarefas.textContent = "tarefa adicionada";
    });
}