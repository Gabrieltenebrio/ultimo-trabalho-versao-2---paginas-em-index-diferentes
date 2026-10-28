const secoes = document.querySelectorAll(
    "main section"
);

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




if (typeof anime !== "undefined") {
    anime.animate("#inicio h2", {
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 1200,
        ease: "outExpo"
    });

    anime.animate("#inicio img", {
        opacity: [0, 1],
        scale: [0.8, 1],
        duration: 1000,
        delay: 300,
        ease: "outBack"
    });
}


const menuBotao = document.querySelector("#menu-botao");
const menu = document.querySelector("#menu");

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



/* Partículas roxas no fundo */
const canvas = document.querySelector("#particulas");
const ctx = canvas.getContext("2d");

let particulas = [];
let largura = 0;
let altura = 0;

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

    particulas.forEach((p) => {
        p.y -= p.velocidade;

        if (p.y < -5) {
            p.y = altura + 5;
            p.x = Math.random() * largura;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.raio, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(169, 112, 255, ${p.opacidade})`;
        ctx.fill();

        // Conectar partículas próximas
        particulas.forEach((outra) => {
            const dx = p.x - outra.x;
            const dy = p.y - outra.y;
            const distancia = Math.sqrt(dx * dx + dy * dy);

            if (distancia < 110 && p !== outra) {
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(outra.x, outra.y);
                ctx.strokeStyle =
                    `rgba(112, 44, 255, ${0.15 * (1 - distancia / 110)})`;
                ctx.lineWidth = 0.6;
                ctx.stroke();
            }
        });
    });

    requestAnimationFrame(desenharParticulas);
}

ajustarCanvas();
desenharParticulas();

window.addEventListener("resize", ajustarCanvas);