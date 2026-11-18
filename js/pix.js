// ---------- Pagamento via Pix ----------
// CONFIGURE AQUI os dados de recebimento da loja.
// chave: CPF, CNPJ, e-mail, telefone (+55DDDNUMERO) ou chave aleatória cadastrada no seu banco.
// Enquanto "chave" estiver vazia, o site mostra um QR Code de DEMONSTRAÇÃO, que não recebe pagamentos.
const PIX_CONFIG = {
  chave: "",
  nome: "STN SNEAKERS",   // até 25 letras, sem acento
  cidade: "BRASILIA",     // até 15 letras, sem acento
  desconto: 0.05,         // 5% de desconto no Pix
  validadeMin: 5          // minutos para pagar o QR Code
};
const PIX_DEMO = !PIX_CONFIG.chave;

const Pix = (() => {
  const semAcento = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9 ]/g, "").toUpperCase();
  const campo = (id, valor) => id + String(valor.length).padStart(2, "0") + valor;
  function crc16(txt) {                       // CRC16-CCITT (0x1021, início 0xFFFF), exigido pelo BR Code
    let crc = 0xFFFF;
    for (let i = 0; i < txt.length; i++) {
      crc ^= txt.charCodeAt(i) << 8;
      for (let b = 0; b < 8; b++) crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) & 0xFFFF : (crc << 1) & 0xFFFF;
    }
    return crc.toString(16).toUpperCase().padStart(4, "0");
  }
  // Gera o "Pix copia e cola" (padrão BR Code do Banco Central)
  function codigo(valor, txid) {
    const chave = PIX_CONFIG.chave || "00000000000";
    const id = (txid || "***").replace(/[^A-Za-z0-9]/g, "").slice(0, 25) || "***";
    const corpo =
      campo("00", "01") +
      campo("26", campo("00", "br.gov.bcb.pix") + campo("01", chave)) +
      campo("52", "0000") +
      campo("53", "986") +
      campo("54", valor.toFixed(2)) +
      campo("58", "BR") +
      campo("59", semAcento(PIX_CONFIG.nome).slice(0, 25)) +
      campo("60", semAcento(PIX_CONFIG.cidade).slice(0, 15)) +
      campo("62", campo("05", id)) +
      "6304";
    return corpo + crc16(corpo);
  }
  // Desenha o QR Code como SVG (nítido em qualquer tela)
  function qrSvg(texto) {
    const qr = qrcode(0, "M"); qr.addData(texto); qr.make();
    return qr.createSvgTag({ cellSize: 6, margin: 2, scalable: true });
  }
  const comDesconto = v => Math.round(Math.round(v * 100) * (1 - PIX_CONFIG.desconto)) / 100;
  return { codigo, qrSvg, comDesconto, crc16 };
})();

// Bloco pronto com QR Code + copia e cola + botão copiar
function blocoPix(codigoPix, valor) {
  return `<div class="pix-bloco">
    ${PIX_DEMO ? `<p class="pix-demo">⚠ QR Code de demonstração: a chave Pix da loja ainda não foi configurada. Não pague.</p>` : ""}
    <div class="pix-qr" role="img" aria-label="QR Code para pagamento Pix">${Pix.qrSvg(codigoPix)}</div>
    <p class="pix-valor">Valor: <strong>${real(valor)}</strong></p>
    <label class="pix-copia">Pix copia e cola
      <textarea readonly rows="3">${codigoPix}</textarea>
    </label>
    <button type="button" class="btn btn-escuro pix-copiar" data-copiar="${codigoPix}">Copiar código Pix</button>
    <p class="pix-passos">Abra o app do seu banco, escolha <b>Pix → Ler QR Code</b> ou <b>Pix copia e cola</b> e confirme o pagamento.</p>
  </div>`;
}
document.addEventListener("click", e => {
  const b = e.target.closest(".pix-copiar"); if (!b) return;
  const txt = b.dataset.copiar;
  const ok = () => { b.textContent = "✓ Código copiado!"; setTimeout(() => b.textContent = "Copiar código Pix", 2500); };
  try { navigator.clipboard.writeText(txt).then(ok, () => { b.previousElementSibling.querySelector("textarea").select(); document.execCommand("copy"); ok(); }); }
  catch (x) { b.previousElementSibling.querySelector("textarea").select(); document.execCommand("copy"); ok(); }
});

// ---------- Prazo para pagar o Pix ----------
// Atenção: o prazo é controlado pelo site. Um QR Code Pix "estático" (só com a chave)
// continua aceito pelo banco depois do prazo; para expirar de verdade é preciso Pix
// dinâmico gerado pela API de um banco ou intermediário.
const expiraPix = pedido => new Date(pedido.expiraEm || (new Date(pedido.data).getTime() + PIX_CONFIG.validadeMin * 60000)).getTime();
const pixExpirado = pedido => Date.now() >= expiraPix(pedido);
function mmss(ms) { const s = Math.max(0, Math.ceil(ms / 1000)); return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0"); }
const contadorPix = pedido => `<span class="pix-timer" data-expira="${expiraPix(pedido)}" data-pedido="${pedido.numero}">⏱ <b>${mmss(expiraPix(pedido) - Date.now())}</b></span>`;
setInterval(() => {
  document.querySelectorAll(".pix-timer").forEach(t => {
    const resta = +t.dataset.expira - Date.now();
    t.querySelector("b").textContent = mmss(resta);
    t.classList.toggle("acabando", resta <= 60000);
    if (resta <= 0 && !t.dataset.avisado) {
      t.dataset.avisado = "1";
      document.dispatchEvent(new CustomEvent("pix-expirou", { detail: t.dataset.pedido }));
    }
  });
}, 1000);
