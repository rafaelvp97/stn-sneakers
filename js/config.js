// =====================================================================
// CONFIGURAÇÃO DA LOJA
// Enquanto supabaseUrl e supabaseChave estiverem vazios, o site roda em
// MODO DEMONSTRAÇÃO: tudo fica salvo só no navegador de quem acessa.
// Preencha com os dados do seu projeto Supabase (Project Settings → API)
// para ligar a loja de verdade. Veja o passo a passo no LEIA-ME.md.
// =====================================================================
const CONFIG = {
  // Ex.: "https://abcdefghijklm.supabase.co"
  supabaseUrl: "",
  // A chave "anon public" (é pública, pode ficar aqui). NUNCA use a "service_role".
  supabaseChave: "",

  // Microsoft Clarity (opcional): gravações e mapas de calor da navegação.
  // Crie um projeto grátis em clarity.microsoft.com e cole o ID aqui.
  clarityId: "",

  // E-mail de suporte mostrado no rodapé (o clique copia o endereço)
  emailSuporte: "igor.amorim@cultura.gov.br"
};
