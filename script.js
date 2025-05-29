const canvas = document.getElementById("mapa");
const ctx = canvas.getContext("2d");

const imagem = new Image();
imagem.src = "assets/mapa.png";

const conexoes = {};
const visitados = new Set(["Usina"]);

let caminhoPercorrido = [];
let pesoTotal = 0;
const pesosArestas = {};


let objetivo = null;

const vertices = [
    { nome: "Usina", x: 343, y: 189 },
    { nome: "A", x: 275, y: 136 },
    { nome: "B", x: 277, y: 96 },
    { nome: "C", x: 202, y: 117 },
    { nome: "D", x: 178, y: 95 },
    { nome: "E", x: 59, y: 192 },
    { nome: "F", x: 153, y: 206 },
    { nome: "G", x: 152, y: 230 },
    { nome: "H", x: 182, y: 229 },
    { nome: "I", x: 255, y: 244 },
    { nome: "J", x: 272, y: 262 },
    { nome: "K", x: 254, y: 277 },
    { nome: "L", x: 217, y: 278 },
    { nome: "M", x: 181, y: 278 },
    { nome: "N", x: 153, y: 276 },
    { nome: "O", x: 342, y: 313 },
    { nome: "P", x: 83, y: 321 },
    { nome: "Q", x: 152, y: 341 },
    { nome: "R", x: 220, y: 340 },
    { nome: "S", x: 253, y: 339 },
    { nome: "T", x: 254, y: 375 },
    { nome: "U", x: 285, y: 466 },
    { nome: "V", x: 218, y: 469 },
    { nome: "W", x: 152, y: 402 },
    { nome: "X", x: 83, y: 396 },
    { nome: "Y", x: 224, y: 95 },
    { nome: "Z", x: 182, y: 206 },
    { nome: "&", x: 59, y: 80 }
];

const arestas = [
    { de: "Usina", para: "A", offsetX: 10, offsetY: -10 },
    { de: "Usina", para: "J", offsetX: -5, offsetY: -10 },
    { de: "Usina", para: "O", offsetX: 5, offsetY: -10 },
    { de: "A", para: "B", offsetX: 5, offsetY: 5 },
    { de: "A", para: "I", offsetX: 0, offsetY: -10 },
    { de: "A", para: "C", offsetX: 0, offsetY: 5 },
    { de: "B", para: "Y", offsetX: 0, offsetY: -5 },
    { de: "C", para: "D", offsetX: -10, offsetY: 15 },
    { de: "C", para: "Y", offsetX: 7, offsetY: 12 },
    { de: "Y", para: "D", offsetX: 0, offsetY: -10 },
    { de: "C", para: "F", offsetX: -8, offsetY: 0 },
    { de: "Z", para: "F", offsetX: 0, offsetY: -10 },
    { de: "G", para: "F", offsetX: -15, offsetY: 3 },
    { de: "G", para: "H", offsetX: -5, offsetY: 15 },
    { de: "L", para: "H", offsetX: 5, offsetY: -5 },
    { de: "M", para: "H", offsetX: 5, offsetY: 5 },
    { de: "M", para: "L", offsetX: -5, offsetY: 18 },
    { de: "R", para: "L", offsetX: 5, offsetY: 0 },
    { de: "R", para: "S", offsetX: -5, offsetY: -10 },
    { de: "K", para: "S", offsetX: 5, offsetY: 0 },
    { de: "O", para: "S", offsetX: 5, offsetY: 5 },
    { de: "K", para: "J", offsetX: 5, offsetY: 20 },
    { de: "K", para: "I", offsetX: -15, offsetY: 0 },
    { de: "J", para: "I", offsetX: 7, offsetY: -10 },
    { de: "J", para: "O", offsetX: -5, offsetY: 0 },
    { de: "L", para: "K", offsetX: -5, offsetY: -7 },
    { de: "N", para: "M", offsetX: -5, offsetY: -7 },
    { de: "R", para: "M", offsetX: -5, offsetY: 2 },
    { de: "R", para: "Q", offsetX: -5, offsetY: -5 },
    { de: "N", para: "Q", offsetX: -12, offsetY: -5 },
    { de: "Q", para: "P", offsetX: 0, offsetY: 2 },
    { de: "N", para: "P", offsetX: 0, offsetY: 0 },
    { de: "E", para: "P", offsetX: -10, offsetY: 0 },
    { de: "X", para: "P", offsetX: -10, offsetY: 0 },
    { de: "X", para: "W", offsetX: -10, offsetY: 0 },
    { de: "Q", para: "W", offsetX: -10, offsetY: 0 },
    { de: "V", para: "W", offsetX: -10, offsetY: 0 },
    { de: "V", para: "U", offsetX: 0, offsetY: 0 },
    { de: "V", para: "R", offsetX: -15, offsetY: 0 },
    { de: "U", para: "T", offsetX: 0, offsetY: 0 },
    { de: "S", para: "T", offsetX: 5, offsetY: 0 },
    { de: "R", para: "T", offsetX: -12, offsetY: 15 },
    { de: "D", para: "&", offsetX: -12, offsetY: 15 },
    { de: "E", para: "&", offsetX: -12, offsetY: 15 },
    { de: "E", para: "G", offsetX: -12, offsetY: 15 },
    { de: "Z", para: "I", offsetX: 0, offsetY: 0 },
    { de: "Z", para: "H", offsetX: 10, offsetY: 5 },
    { de: "G", para: "N", offsetX: -10, offsetY: 5 },
];

function garantirSimetria(arestas) {
    const mapa = new Map();

    for (const a of arestas) {
        mapa.set(`${a.de}->${a.para}`, a);
    }

    const novasArestas = [];

    for (const a of arestas) {
        const chaveReversa = `${a.para}->${a.de}`;
        if (!mapa.has(chaveReversa)) {
            novasArestas.push({
                de: a.para,
                para: a.de,
                offsetX: a.offsetX,
                offsetY: a.offsetY,
            });
        }
    }

    return [...arestas, ...novasArestas];
}

function calcularMenorCaminho(origem, destino) {
    const distancias = {};
    const anteriores = {};
    const naoVisitados = new Set();

    vertices.forEach(v => {
        distancias[v.nome] = Infinity;
        anteriores[v.nome] = null;
        naoVisitados.add(v.nome);
    });
    distancias[origem] = 0;

    while (naoVisitados.size > 0) {
        let atual = null;
        let menorDistancia = Infinity;

        for (const vertice of naoVisitados) {
            if (distancias[vertice] < menorDistancia) {
                menorDistancia = distancias[vertice];
                atual = vertice;
            }
        }

        if (atual === destino || atual === null) break;

        naoVisitados.delete(atual);

        for (const vizinho of conexoes[atual] || []) {
            if (!naoVisitados.has(vizinho)) continue;

            const peso = pesosArestas[`${atual}-${vizinho}`] || 0;
            const distanciaAlternativa = distancias[atual] + peso;

            if (distanciaAlternativa < distancias[vizinho]) {
                distancias[vizinho] = distanciaAlternativa;
                anteriores[vizinho] = atual;
            }
        }
    }

    const caminho = [];
    let atual = destino;

    while (atual !== origem && anteriores[atual] !== null) {
        caminho.unshift(atual);
        atual = anteriores[atual];
    }

    if (atual !== origem) return null;

    caminho.unshift(origem);

    return {
        caminho: caminho,
        pesoTotal: distancias[destino]
    };
}

const arestasSimetricas = garantirSimetria(arestas);

console.log(arestasSimetricas);

arestas.forEach(a => {
    if (!conexoes[a.de]) conexoes[a.de] = [];
    if (!conexoes[a.para]) conexoes[a.para] = [];
    conexoes[a.de].push(a.para);
    conexoes[a.para].push(a.de);
});

function desenharPesos(min = 0, max = 10) {
    arestas.forEach(aresta => {
        const origem = vertices.find(v => v.nome === aresta.de);
        const destino = vertices.find(v => v.nome === aresta.para);

        if (origem && destino) {
            const meioX = (origem.x + destino.x) / 2;
            const meioY = (origem.y + destino.y) / 2;

            const peso = Math.floor(Math.random() * (max - min + 1)) + min;

            pesosArestas[`${aresta.de}-${aresta.para}`] = peso;
            pesosArestas[`${aresta.para}-${aresta.de}`] = peso;

            ctx.font = "12px Arial";
            ctx.fillStyle = "#FF0000";
            ctx.fillText(peso, meioX + aresta.offsetX, meioY + aresta.offsetY);
        }
    });
}


function escolherObjetivoAleatorio() {
    const candidatos = vertices.filter(v => v.nome !== "Usina");
    return candidatos[Math.floor(Math.random() * candidatos.length)];
}

function mostrarObjetivo(obj) {
    const objetivoDiv = document.getElementById("objetivo");
    objetivoDiv.textContent = `Objetivo: encontre o menor caminho da Usina até o ponto "${obj.nome}".`;
}

function criarBotoesVertices() {
    const container = document.getElementById("botoes-container");

    vertices.forEach(v => {
        const btn = document.createElement("button");
        btn.className = "vertice-btn desativado";
        btn.style.position = "absolute";
        btn.style.left = `${v.x - 10}px`;
        btn.style.top = `${v.y - 10}px`;
        btn.textContent = v.nome;
        btn.id = `btn-${v.nome}`;

        btn.addEventListener("click", () => {
            if (visitados.has(btn.textContent)) {
                return;
            }

            const ultimoVisitado = [...visitados].pop();

            const conexao = `${ultimoVisitado} -> ${btn.textContent}`;
            caminhoPercorrido.push(conexao);

            const peso = pesosArestas[`${ultimoVisitado}-${btn.textContent}`] || 0;
            pesoTotal += peso;

            const caminhoDiv = document.getElementById("caminho-percorrido");
            const novoPasso = document.createElement("div");
            novoPasso.textContent = `${conexao}, peso ${peso}`;
            caminhoDiv.appendChild(novoPasso);

            document.getElementById("total-peso").textContent = `Total: ${pesoTotal}`;

            visitados.add(btn.textContent);

            vertices.forEach(v => {
                const b = document.getElementById(`btn-${v.nome}`);
                if (b) {
                    if (v.nome === btn.textContent) {
                        b.classList.remove("ativo", "desativado");
                        b.classList.add("usina", "visitado");
                    } else if (visitados.has(v.nome)) {
                        b.classList.remove("ativo", "usina");
                        b.classList.add("visitado");
                    } else {
                        b.classList.remove("ativo", "usina", "visitado");
                        b.classList.add("desativado");
                    }
                }
            });

            ativarConectados(btn.textContent);

            if (btn.textContent === objetivo.nome) {
                const menorCaminho = calcularMenorCaminho("Usina", objetivo.nome);
                const caminhoUsuario = [...visitados];

                let mensagem = `Parabéns! Você alcançou o objetivo!\n`;
                mensagem += `Seu caminho: ${caminhoUsuario.join(" -> ")} (Total: ${pesoTotal})\n`;
                mensagem += `Menor caminho possível: ${menorCaminho.caminho.join(" -> ")} (Total: ${menorCaminho.pesoTotal})`;

                if (pesoTotal > menorCaminho.pesoTotal) {
                    mensagem += `\n\nVocê não encontrou o caminho mais curto! Tente novamente.`;
                } else {
                    mensagem += `\n\nVocê encontrou o caminho mais curto! Parabéns!`;
                }

                alert(mensagem);
            }
        });

        container.appendChild(btn);
    });

    const btnUsina = document.getElementById("btn-Usina");
    if (btnUsina) {
        btnUsina.classList.remove("desativado");
        btnUsina.classList.add("usina");
    }
}

function ativarConectados(nome) {
    const conectados = conexoes[nome] || [];
    conectados.forEach(vNome => {
        if (!visitados.has(vNome)) {
            const btn = document.getElementById(`btn-${vNome}`);
            if (btn && btn.classList.contains("desativado")) {
                btn.classList.remove("desativado");
                btn.classList.add("ativo");
            }
        }
    });
}

imagem.onload = () => {
    ctx.drawImage(imagem, 0, 0, canvas.width, canvas.height);

    desenharPesos();

    objetivo = escolherObjetivoAleatorio();
    mostrarObjetivo(objetivo);
    criarBotoesVertices();
    ativarConectados("Usina");
};

imagem.onerror = () => {
    console.error("Erro ao carregar a imagem mapa.png");
};


function reiniciarJogo() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const container = document.getElementById("botoes-container");
    container.innerHTML = "";

    visitados.clear();
    visitados.add("Usina");

    caminhoPercorrido = [];
    pesoTotal = 0;
    document.getElementById("caminho-percorrido").innerHTML = "";
    document.getElementById("total-peso").innerHTML = "";

    ctx.drawImage(imagem, 0, 0, canvas.width, canvas.height);
    desenharPesos();

    caminhoPercorrido = [];
    pesoTotal = 0;
    document.getElementById("caminho-percorrido").innerHTML = "";
    document.getElementById("total-peso").innerHTML = "";

    objetivo = escolherObjetivoAleatorio();
    mostrarObjetivo(objetivo);

    criarBotoesVertices();
    ativarConectados("Usina");
}


document.getElementById("btn-reiniciar").addEventListener("click", reiniciarJogo);

document.getElementById("btn-resposta").addEventListener("click", () => {
    if (!objetivo) return;

    const menorCaminho = calcularMenorCaminho("Usina", objetivo.nome);

    if (menorCaminho) {
        alert(`O menor caminho para ${objetivo.nome} é:\n${menorCaminho.caminho.join(" -> ")}\nCom peso total: ${menorCaminho.pesoTotal}`);
    } else {
        alert(`Não há caminho possível para ${objetivo.nome}`);
    }
});
