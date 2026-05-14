export function formatarErroFirebase(erro, fallback) {
  const codigo = erro?.code || 'sem-codigo';
  const detalhe = erro?.message || String(erro);

  const dicas = {
    'permission-denied': 'Abra Firestore Database > Regras e permita leitura/escrita para teste.',
    'service-disabled': 'Ative a Cloud Firestore API no Google Cloud/Firebase e aguarde alguns minutos.',
    'not-found': 'Confira se o Firestore Database foi criado nesse projeto Firebase.',
    unavailable: 'Confira a internet do celular e reinicie o Expo com cache limpo.',
    'failed-precondition': 'O Firebase pode estar pedindo indice ou configuracao do banco.',
  };

  return [
    fallback,
    '',
    `Codigo: ${codigo}`,
    `Detalhe: ${detalhe}`,
    dicas[codigo] ? `Dica: ${dicas[codigo]}` : null,
  ].filter(Boolean).join('\n');
}
