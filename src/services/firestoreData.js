import { firebaseConfig } from '../config/firebase';

const TEMPO_CACHE_MS = 60000;
const TEMPO_FIREBASE_MS = 30000;
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents`;
const API_KEY = firebaseConfig.apiKey;

const cache = {
  medicamentos: null,
  medicamentosPromise: null,
  registrosPorData: new Map(),
  registrosPorDataPromises: new Map(),
  registrosPeriodo: new Map(),
  registrosPeriodoPromises: new Map(),
};

function criarEntrada(dados) {
  return { dados, atualizadoEm: Date.now() };
}

function cacheValido(entrada) {
  return entrada && Date.now() - entrada.atualizadoEm < TEMPO_CACHE_MS;
}

function periodoKey(dataInicio, dataFim) {
  return `${dataInicio}|${dataFim}`;
}

function documentoId(nomeCompleto) {
  return nomeCompleto?.split('/').pop();
}

function normalizarCodigo(status) {
  return status ? status.toLowerCase().replace(/_/g, '-') : 'sem-codigo';
}

function criarErroFirebase(error) {
  const motivo = error?.details?.find(item => item.reason)?.reason;
  const erro = new Error(error?.message || 'Erro ao acessar o Firestore.');
  erro.code = normalizarCodigo(motivo || error?.status);
  return erro;
}

async function requisitarFirestore(caminho, opcoes = {}) {
  const separador = caminho.includes('?') ? '&' : '?';
  const url = `${BASE_URL}${caminho}${separador}key=${API_KEY}`;

  const resposta = await fetch(url, {
    ...opcoes,
    headers: {
      'Content-Type': 'application/json',
      ...(opcoes.headers || {}),
    },
  });

  const texto = await resposta.text();
  const corpo = texto ? JSON.parse(texto) : null;

  if (!resposta.ok) {
    throw criarErroFirebase(corpo?.error);
  }

  return corpo;
}

function comTempoLimite(promise, acao) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      const erro = new Error(`Tempo esgotado ao ${acao}. Verifique a internet do celular.`);
      erro.code = 'timeout';
      reject(erro);
    }, TEMPO_FIREBASE_MS);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
}

function decodificarValor(valor) {
  if (!valor) return null;
  if ('stringValue' in valor) return valor.stringValue;
  if ('booleanValue' in valor) return valor.booleanValue;
  if ('integerValue' in valor) return Number(valor.integerValue);
  if ('doubleValue' in valor) return Number(valor.doubleValue);
  if ('timestampValue' in valor) return valor.timestampValue;
  if ('nullValue' in valor) return null;

  if ('arrayValue' in valor) {
    return (valor.arrayValue.values || []).map(decodificarValor);
  }

  if ('mapValue' in valor) {
    return decodificarCampos(valor.mapValue.fields || {});
  }

  return null;
}

function decodificarCampos(fields = {}) {
  return Object.entries(fields).reduce((acc, [chave, valor]) => {
    acc[chave] = decodificarValor(valor);
    return acc;
  }, {});
}

function decodificarDocumento(documento) {
  return {
    id: documentoId(documento.name),
    ...decodificarCampos(documento.fields || {}),
  };
}

function codificarValor(valor) {
  if (valor === null) return { nullValue: null };
  if (Array.isArray(valor)) {
    if (valor.length === 0) return { arrayValue: {} };
    return { arrayValue: { values: valor.map(codificarValor) } };
  }
  if (typeof valor === 'boolean') return { booleanValue: valor };
  if (typeof valor === 'number') {
    return Number.isInteger(valor)
      ? { integerValue: String(valor) }
      : { doubleValue: valor };
  }
  if (typeof valor === 'object') {
    return { mapValue: { fields: codificarObjeto(valor) } };
  }
  return { stringValue: String(valor) };
}

function codificarObjeto(objeto) {
  return Object.entries(objeto).reduce((acc, [chave, valor]) => {
    if (valor !== undefined) {
      acc[chave] = codificarValor(valor);
    }
    return acc;
  }, {});
}

function getTempoCriacao(medicamento) {
  if (typeof medicamento.criadoEm === 'string') {
    const tempo = Date.parse(medicamento.criadoEm);
    return Number.isNaN(tempo) ? 0 : tempo;
  }
  return 0;
}

function ordenarMedicamentos(medicamentos) {
  return medicamentos.slice().sort((a, b) => getTempoCriacao(b) - getTempoCriacao(a));
}

async function listarColecao(nome) {
  const resposta = await requisitarFirestore(`/${nome}`);
  return (resposta.documents || []).map(decodificarDocumento);
}

function salvarRegistroEmCache(registro) {
  if (!registro?.data) return;

  const entradaData = cache.registrosPorData.get(registro.data);
  if (entradaData) {
    const lista = entradaData.dados.slice();
    const index = lista.findIndex(item => item.id === registro.id);
    if (index >= 0) {
      lista[index] = { ...lista[index], ...registro };
    } else {
      lista.push(registro);
    }
    cache.registrosPorData.set(registro.data, criarEntrada(lista));
  }

  cache.registrosPeriodo.forEach((entrada, key) => {
    const [inicio, fim] = key.split('|');
    if (registro.data < inicio || registro.data > fim) return;

    const lista = entrada.dados.slice();
    const index = lista.findIndex(item => item.id === registro.id);
    if (index >= 0) {
      lista[index] = { ...lista[index], ...registro };
    } else {
      lista.push(registro);
    }
    cache.registrosPeriodo.set(key, criarEntrada(lista));
  });
}

export function getMedicamentosEmCache() {
  return cache.medicamentos?.dados ?? null;
}

export function getRegistrosPorDataEmCache(dataKey) {
  return cache.registrosPorData.get(dataKey)?.dados ?? null;
}

export function getRegistrosPeriodoEmCache(dataInicio, dataFim) {
  return cache.registrosPeriodo.get(periodoKey(dataInicio, dataFim))?.dados ?? null;
}

export async function buscarMedicamentos({ force = false } = {}) {
  if (!force && cacheValido(cache.medicamentos)) {
    return cache.medicamentos.dados;
  }

  if (!force && cache.medicamentosPromise) {
    return cache.medicamentosPromise;
  }

  cache.medicamentosPromise = comTempoLimite(
    listarColecao('medicamentos'),
    'carregar medicamentos'
  )
    .then(medicamentos => {
      const ordenados = ordenarMedicamentos(medicamentos);
      cache.medicamentos = criarEntrada(ordenados);
      return ordenados;
    })
    .finally(() => {
      cache.medicamentosPromise = null;
    });

  return cache.medicamentosPromise;
}

export async function buscarRegistrosPorData(dataKey, { force = false } = {}) {
  const entrada = cache.registrosPorData.get(dataKey);
  if (!force && cacheValido(entrada)) {
    return entrada.dados;
  }

  const promiseAtual = cache.registrosPorDataPromises.get(dataKey);
  if (!force && promiseAtual) {
    return promiseAtual;
  }

  const promise = comTempoLimite(
    listarColecao('registros'),
    'carregar registros do dia'
  )
    .then(registros => registros.filter(registro => registro.data === dataKey))
    .then(registros => {
      cache.registrosPorData.set(dataKey, criarEntrada(registros));
      return registros;
    })
    .finally(() => {
      cache.registrosPorDataPromises.delete(dataKey);
    });

  cache.registrosPorDataPromises.set(dataKey, promise);
  return promise;
}

export async function buscarRegistrosPeriodo(dataInicio, dataFim, { force = false } = {}) {
  const key = periodoKey(dataInicio, dataFim);
  const entrada = cache.registrosPeriodo.get(key);
  if (!force && cacheValido(entrada)) {
    return entrada.dados;
  }

  const promiseAtual = cache.registrosPeriodoPromises.get(key);
  if (!force && promiseAtual) {
    return promiseAtual;
  }

  const promise = comTempoLimite(
    listarColecao('registros'),
    'carregar historico'
  )
    .then(registros => registros.filter(registro =>
      registro.data >= dataInicio && registro.data <= dataFim
    ))
    .then(registros => {
      cache.registrosPeriodo.set(key, criarEntrada(registros));
      return registros;
    })
    .finally(() => {
      cache.registrosPeriodoPromises.delete(key);
    });

  cache.registrosPeriodoPromises.set(key, promise);
  return promise;
}

export async function criarRegistro(dados) {
  const resposta = await comTempoLimite(
    requisitarFirestore('/registros', {
      method: 'POST',
      body: JSON.stringify({ fields: codificarObjeto(dados) }),
    }),
    'registrar dose'
  );

  const registro = decodificarDocumento(resposta);
  salvarRegistroEmCache(registro);
  return registro;
}

export async function atualizarRegistroTomado(registro, tomado) {
  await comTempoLimite(
    requisitarFirestore(`/registros/${registro.id}?updateMask.fieldPaths=tomado`, {
      method: 'PATCH',
      body: JSON.stringify({ fields: codificarObjeto({ tomado }) }),
    }),
    'atualizar dose'
  );

  const atualizado = { ...registro, tomado };
  salvarRegistroEmCache(atualizado);
  return atualizado;
}

export async function criarMedicamento(dados) {
  const agora = new Date().toISOString();
  const resposta = await comTempoLimite(
    requisitarFirestore('/medicamentos', {
      method: 'POST',
      body: JSON.stringify({
        fields: codificarObjeto({
          ...dados,
          criadoEm: agora,
        }),
      }),
    }),
    'salvar medicamento'
  );

  const medicamento = decodificarDocumento(resposta);
  if (cache.medicamentos) {
    cache.medicamentos = criarEntrada([medicamento, ...cache.medicamentos.dados]);
  }

  return { id: medicamento.id };
}

export async function atualizarMedicamento(id, dados) {
  const updateMask = Object.keys(dados)
    .map(campo => `updateMask.fieldPaths=${encodeURIComponent(campo)}`)
    .join('&');

  await comTempoLimite(
    requisitarFirestore(`/medicamentos/${id}?${updateMask}`, {
      method: 'PATCH',
      body: JSON.stringify({ fields: codificarObjeto(dados) }),
    }),
    'atualizar medicamento'
  );

  if (cache.medicamentos) {
    const medicamentos = cache.medicamentos.dados.map(medicamento =>
      medicamento.id === id ? { ...medicamento, ...dados } : medicamento
    );
    cache.medicamentos = criarEntrada(medicamentos);
  }
}

export async function excluirMedicamento(id) {
  await comTempoLimite(
    requisitarFirestore(`/medicamentos/${id}`, { method: 'DELETE' }),
    'excluir medicamento'
  );

  if (cache.medicamentos) {
    cache.medicamentos = criarEntrada(
      cache.medicamentos.dados.filter(medicamento => medicamento.id !== id)
    );
  }
}
