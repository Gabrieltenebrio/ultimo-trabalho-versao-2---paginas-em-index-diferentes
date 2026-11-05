const prefereMovimentoReduzido = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
);

const secoes = document.querySelectorAll("main section");

if (prefereMovimentoReduzido.matches || !("IntersectionObserver" in window)) {
    secoes.forEach((secao) => {
        secao.classList.add("visivel");
    });
} else {
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
    const formatarTempo = (tempo) => {
        if (!Number.isFinite(tempo)) {
            return "00:00";
        }

        const minutos = Math.floor(tempo / 60);
        const segundos = Math.floor(tempo % 60);

        return `${String(minutos).padStart(2, "0")}:${String(segundos).padStart(2, "0")}`;
    };

    const atualizarDuracao = () => {
        duracaoMusica.textContent = formatarTempo(player.duration);
        progressoMusica.disabled = !Number.isFinite(player.duration);
    };

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

    player.addEventListener("ended", () => {
        statusMusica.textContent = "Música finalizada";
    });

    player.addEventListener("error", () => {
        statusMusica.textContent = "Não foi possível carregar a música.";
    });

    player.addEventListener("loadedmetadata", atualizarDuracao);
    player.addEventListener("durationchange", atualizarDuracao);
    player.addEventListener("timeupdate", atualizarProgresso);

    progressoMusica.addEventListener("input", () => {
        if (Number.isFinite(player.duration)) {
            player.currentTime =
                (Number(progressoMusica.value) / 100) * player.duration;
        }
    });

    controleVolume.addEventListener("input", () => {
        player.volume = Number(controleVolume.value);
        valorVolume.textContent = `${Math.round(player.volume * 100)}%`;
    });
}

const canvas = document.querySelector("#particulas");
const ctx = canvas?.getContext("2d");

if (canvas && ctx) {
    let particulas = [];
    let largura = 0;
    let altura = 0;
    let animacaoParticulas;

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



const slidesbanner = document.querySelectorAll("#banner .banner-slide");
const botaoAnterior = document.querySelector("#banner-anterior");
const botaoProximo = document.querySelector("#banner-proximo");

if (slidesbanner.length > 0 && botaoAnterior && botaoProximo) {
    let slideAtual = 0;

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