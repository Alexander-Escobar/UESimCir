/**
 * simcir_qm.js
 * Versión refactorizada y corregida (v1.0-refactor)
 * Gestión de Quine-McCluskey sobre la información almacenada en sessionStorage.
 *
 * Formato esperado en sessionStorage:
 *   Key: "X0", "Y3", ...
 *   Value: ["1","00"]  -> [valor: "1"|"0"|"X", bits: "00"]
 *
 * Notas:
 * - Esta versión preserva la lógica original del algoritmo pero corrige errores
 *   de robustez, variables globales, y funciones auxiliares.
 * - Activa DEBUG_QM = true para ver trazas en consola.
 */

/* ========== Configuración ========== */
const DEBUG_QM = false;

/* ========== Utilitarios y Clases ========== */

/**
 * Clase que representa un término (como en la versión original)
 */
class Termino {
  constructor() {
    this.mp = [];   // minterms agrupados (array de enteros)
    this.fp = [];   // "floating positions" o diferencias (array de enteros)
    this.used = false;
  }

  add_mp(item) {
    this.mp.push(item);
  }
  add_fp(item) {
    this.fp.push(item);
  }
}

/**
 * Cuenta la cantidad de bits 1 en el numero (popcount).
 * @param {number} numero
 * @returns {number}
 */
function contarUnos(numero) {
  let contador = 0;
  let n = Number(numero) || 0;
  while (n) {
    n &= (n - 1);
    contador++;
  }
  return contador;
}

/**
 * Determina si n es potencia de 2 (y > 0).
 * @param {number} n
 * @returns {boolean}
 */
function esPotencia2(n) {
  return n > 0 && (n & (n - 1)) === 0;
}

/**
 * Compara dos arrays (strict equality item-by-item).
 * @param {Array} arr1
 * @param {Array} arr2
 * @returns {boolean}
 */
function arraysEqual(arr1, arr2) {
  if (!Array.isArray(arr1) || !Array.isArray(arr2)) return false;
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }
  return true;
}

/**
 * Clona el objeto Termino (copia superficial de mp y fp).
 * @param {Termino} t
 * @returns {Termino}
 */
function cloneObject(t) {
  const new_t = new Termino();
  new_t.fp = t.fp.slice();
  new_t.mp = t.mp.slice();
  new_t.used = t.used;
  return new_t;
}

/* ========== Funciones para manejar sessionStorage y extracción de minterms/dontcares ========== */

/**
 * Recorre sessionStorage y extrae, para una letra dada (ej. 'X','Y','Z'),
 * los índices de minterms y dontcares.
 * Formato esperado por clave: "X0","X10", etc.
 *
 * @param {string} letra - Letra mayúscula de la variable a evaluar (ej. "Y")
 * @returns {{minTerminos: number[], dontCares: number[]}}
 */
function obtenerMinYDontDesdeStorage(letra) {
  const letraMay = String(letra).toUpperCase();
  const minTerminos = [];
  const dontCares = [];

  for (let k = 0; k < sessionStorage.length; k++) {
    const key = sessionStorage.key(k);
    if (!key) continue;
    // Filtrar claves que comiencen con la letra
    if (!key.startsWith(letraMay)) continue;

    const raw = sessionStorage.getItem(key);
    if (!raw) continue;

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      // Si no es JSON, lo ignoramos (puedes adaptar si guardas en otro formato)
      if (DEBUG_QM) console.warn(`Clave ${key} no es JSON:`, raw);
      continue;
    }

    // parsed se espera como ["1","00"] por ejemplo
    if (!Array.isArray(parsed) || parsed.length < 1) continue;
    const estado = parsed[0]; // "1"|"0"|"X"
    // extraer índice numérico desde la clave (todo lo que venga después de la letra)
    const indiceStr = key.slice(letraMay.length);
    const indice = parseInt(indiceStr, 10);
    if (Number.isNaN(indice)) continue;

    if (estado === "1") minTerminos.push(indice);
    else if (estado === "X") dontCares.push(indice);
  }

  minTerminos.sort((a, b) => a - b);
  dontCares.sort((a, b) => a - b);

  return { minTerminos, dontCares };
}

/* ========== Métodos auxiliares del algoritmo Quine-McCluskey (refactorizados) ========== */

/**
 * Añade un término `t` en la posición pos dentro de la estructura item
 * (item es un arreglo de grupos por número de unos).
 * @param {Termino} t
 * @param {Array} item
 * @param {number} pos
 */
function addTerm(t, item, pos) {
  if (!item[pos]) item[pos] = [];
  item[pos].push(t);
}

/**
 * Verifica si dos fp arrays son iguales.
 * @param {Array<number>} fp1
 * @param {Array<number>} fp2
 * @returns {boolean}
 */
function fp_equals(fp1, fp2) {
  return arraysEqual(fp1, fp2);
}

/**
 * Verifica si dos arrays de mp (listado de minterms) pueden combinarse.
 * Reglas (refactorizadas):
 *  - ambos arrays deben tener la misma longitud
 *  - para cada índice i, diff = mp2[i] - mp1[i] debe existir, ser potencia de 2
 *  - todos los diffs deben ser iguales (esto implica que los pares difieren en el mismo bit)
 *
 * @param {number[]} mp1
 * @param {number[]} mp2
 * @returns {boolean}
 */
function diffsPotencia2(mp1, mp2) {
  if (!Array.isArray(mp1) || !Array.isArray(mp2)) return false;
  if (mp1.length !== mp2.length) return false;

  const diffs = [];
  for (let i = 0; i < mp1.length; i++) {
    const diff = mp2[i] - mp1[i];
    if (diff <= 0) return false; // esperamos mp2>mp1 por construcción
    if (!esPotencia2(diff)) return false;
    diffs.push(diff);
  }

  // todos los diffs iguales?
  return diffs.every((v) => v === diffs[0]);
}

/**
 * Busca si un término ya está en el array de ipe (comparando mp).
 * @param {Array<Termino>} ipe
 * @param {Termino} t
 * @returns {boolean}
 */
function isInIPE(ipe, t) {
  if (!Array.isArray(ipe)) return false;
  for (const tipe of ipe) {
    if (!tipe) continue;
    if (arraysEqual(tipe.mp, t.mp)) return true;
  }
  return false;
}

/**
 * Elimina términos vacíos (con mp.length == 0) del array ip_wdc.
 * Modifica el array in-place.
 * @param {Array<Termino>} ip_wdc
 */
function deleteEmptyTerms(ip_wdc) {
  if (!Array.isArray(ip_wdc)) return;
  // recorrer al revés para evitar problemas con indices al splicear
  for (let i = ip_wdc.length - 1; i >= 0; i--) {
    if (!ip_wdc[i] || !Array.isArray(ip_wdc[i].mp) || ip_wdc[i].mp.length === 0) {
      ip_wdc.splice(i, 1);
    }
  }
}

/* ========== Parte esencial del algoritmo (refactorizado para robustez) ========== */

/**
 * Genera las iteraciones (grupos por cantidad de 1's y combinaciones) para
 * la primera parte del método Quine-McCluskey.
 *
 * @param {number[]} minterm - Array de minterms (enteros)
 * @param {number[]} dontcare - Array de don't care (enteros)
 * @returns {Array} iterations - Estructura en niveles como en la versión original
 */
function getIterations(minterm, dontcare) {
  const terminos = (minterm || []).concat(dontcare || []);
  const iterations = [];
  let it = 0;
  let flag = false;

  // Crear primer grupo (según numero de unos)
  let item = [];
  for (let i = 0; i < terminos.length; i++) {
    const t = new Termino();
    t.add_mp(terminos[i]);
    const pos = contarUnos(terminos[i]);
    addTerm(t, item, pos);
  }
  iterations.push(item);

  while (!flag) {
    item = iterations[it];
    const buffer = [];
    // combinar grupos adyacentes
    for (let idx = 0; idx < item.length - 1; idx++) {
      const grupoA = item[idx];
      const grupoB = item[idx + 1];
      if (!grupoA || !grupoB) continue;

      for (let a = 0; a < grupoA.length; a++) {
        const tA = grupoA[a];
        if (!tA) continue;
        for (let b = 0; b < grupoB.length; b++) {
          const tB = grupoB[b];
          if (!tB) continue;

          if (fp_equals(tA.fp, tB.fp) && diffsPotencia2(tA.mp, tB.mp)) {
            // marcar usados
            tA.used = true;
            tB.used = true;

            const t = new Termino();
            t.mp = tA.mp.concat(tB.mp);
            t.fp = tA.fp.slice();
            // la diferencia representativa es mpB[0] - mpA[0]
            t.add_fp(tB.mp[0] - tA.mp[0]);
            t.mp = Array.from(new Set(t.mp)).sort((x, y) => x - y);
            t.fp = Array.from(new Set(t.fp)).sort((x, y) => x - y);

            addTerm(t, buffer, idx);
          }
        }
      }
    }

    if (buffer.length > 0) {
      iterations.push(buffer);
      it++;
    } else {
      flag = true;
    }
  }

  return iterations;
}

/**
 * Extrae implicantes primos (IP) de las iteraciones (elementos no usados).
 * @param {Array} iterations
 * @returns {Termino[]}
 */
function searchForIP(iterations) {
  const ip = [];
  for (const it of iterations) {
    for (const gp of it) {
      if (!gp) continue;
      for (const t of gp) {
        if (!t) continue;
        if (!t.used && !isInIPE(ip, t)) ip.push(t);
      }
    }
  }
  return ip;
}

/**
 * Elimina de IP los dontCare (remueve la ocurrencia de minterms don't-care en mp)
 * y borra términos vacíos.
 *
 * @param {Termino[]} ip
 * @param {number[]} dontcare
 * @returns {Termino[]}
 */
function deleteDontCare(ip, dontcare) {
  const ip_wdc = ip.map((x) => cloneObject(x));
  for (const dc of (dontcare || [])) {
    for (const t of ip_wdc) {
      const idx = t.mp.indexOf(dc);
      if (idx !== -1) t.mp.splice(idx, 1);
    }
  }
  deleteEmptyTerms(ip_wdc);
  return ip_wdc;
}

/**
 * Encuentra implicantes primos esenciales (IPE) a partir de implicantes totales e minterms
 * @param {Termino[]} implicantes
 * @param {number[]} minterms
 * @returns {Termino[]}
 */
function searchForIPE(implicantes, minterms) {
  const all = [];
  for (const ip of implicantes) {
    for (const m of ip.mp) all.push(m);
  }
  all.sort((a, b) => a - b);

  const contadores = minterms.map(() => 0);
  for (let i = 0; i < minterms.length; i++) {
    for (const val of all) {
      if (minterms[i] === val) contadores[i]++;
    }
  }

  const mint_esenciales = [];
  for (let i = 0; i < contadores.length; i++) {
    if (contadores[i] === 1) mint_esenciales.push(minterms[i]);
  }

  const ipe = [];
  for (const mt of mint_esenciales) {
    for (let i = 0; i < implicantes.length; i++) {
      if (searchMinterm(implicantes[i].mp, mt) && !isAlreadyInIPE(implicantes[i].mp, ipe)) {
        ipe.push(implicantes[i]);
      }
    }
  }

  return ipe;
}

/**
 * Comprueba si un minterm está dentro de un array (utilitario)
 * @param {Array<number>} arr
 * @param {number} minterm
 * @returns {boolean}
 */
function searchMinterm(arr, minterm) {
  if (!Array.isArray(arr)) return false;
  for (const t of arr) if (t === minterm) return true;
  return false;
}

/**
 * Comprueba si un implicante (por mp array) ya está en ipe
 * @param {Array<number>} imp (mp array)
 * @param {Array<Termino>} ipe
 * @returns {boolean}
 */
function isAlreadyInIPE(imp, ipe) {
  for (const it of ipe) if (arraysEqual(it.mp, imp)) return true;
  return false;
}

/**
 * Genera NIP = implicantes no esenciales (todos menos los ipe)
 * @param {Termino[]} implicantes
 * @param {number[]} minterms
 * @param {Termino[]} ipe
 * @returns {Termino[]}
 */
function searchForNIP(implicantes, minterms, ipe) {
  const nip = implicantes.slice();
  for (const impl of implicantes) {
    for (const a of ipe) {
      if (arraysEqual(impl.mp, a.mp)) {
        const idx = nip.indexOf(impl);
        if (idx !== -1) nip.splice(idx, 1);
      }
    }
  }
  return nip;
}

/**
 * Proceso de obtención de solución combinando ipe + nipe (se mantienen
 * las heurísticas originales, pero se corrigen accesos y mutaciones)
 *
 * @param {number[]} minterms
 * @param {Termino[]} implicantes
 * @param {Termino[]} ipe
 * @param {Termino[]} nipe
 * @returns {Termino[]} solución completa (ipe + selección de nipe)
 */
 /* YA NO ES UTILIZADO, metodo Manual */
function getIPEyIPS(minterms, implicantes, ipe, nipe) {
  // copia profunda de nipe
  const cp_nipe = nipe.map((m) => cloneObject(m));

  // Eliminar de cada nipe los elementos que ya están en ipe
  for (const imp of ipe) {
    for (const a of imp.mp) {
      for (const imp2 of cp_nipe) {
        const index = imp2.mp.indexOf(a);
        if (index > -1) imp2.mp.splice(index, 1);
      }
    }
  }

  // Resolver casos base: si todos nipe vacíos -> devolvemos cualquiera (fallback)
  let solv1 = [];
  if (!allarraysEmpty(cp_nipe)) {
    const repeatedT = repeatedElements(cp_nipe);
    for (const r of repeatedT) {
      for (const m of cp_nipe) {
        const index = m.mp.indexOf(r);
        if (index > -1) m.mp.splice(index, 1);
      }
    }
    if (allarraysEmpty(cp_nipe)) {
      // fallback: tomar el primero
      solv1.push(cloneObject(cp_nipe[0] || new Termino()));
    } else {
      for (let j = 0; j < cp_nipe.length; j++) {
        if (cp_nipe[j] && cp_nipe[j].mp.length > 0) solv1.push(cloneObject(cp_nipe[j]));
      }
    }
  }

  const complete_solv = ipe.map((x) => cloneObject(x));
  for (const s of solv1) complete_solv.push(cloneObject(s));
  return complete_solv;
}

/* ========== Helpers para repeatedElements y checks ========== */

/**
 * Devuelve elementos repetidos (minterms) dentro de un array de Termino (nipe).
 * @param {Termino[]} nipe
 * @returns {number[]} array de minterms repetidos
 */
function repeatedElements(nipe) {
  const counters = new Map();
  for (const ar of nipe) {
    for (const a of ar.mp) {
      counters.set(a, (counters.get(a) || 0) + 1);
    }
  }
  const repeated = [];
  for (const [key, val] of counters.entries()) {
    if (val > 1) repeated.push(key);
  }
  return repeated;
}

/**
 * Verifica si todos los mp arrays dentro de nipe están vacíos.
 * @param {Termino[]} nipe
 * @returns {boolean}
 */
function allarraysEmpty(nipe) {
  for (const imp of nipe) {
    if (!imp) continue;
    if (Array.isArray(imp.mp) && imp.mp.length > 0) return false;
  }
  return true;
}

/* ========== Código que orquesta el proceso (funciones públicas) ========== */


/**
 * Inicializa la ejecución del algoritmo Quine-McCluskey.
 * Si no hay minterms ni don't care, igual ejecuta para mostrar F=0 o F=1 según corresponda.
 *
 * @param {string} a_input_minterm - ej "1,3,5" o "" si no hay minterminos
 * @param {string} a_input_dontcare - ej "2,6" o "" si no hay don't care
 */
function f_init(a_input_minterm, a_input_dontcare) {
  const input_minterm = (a_input_minterm || "").trim();
  const input_dontcare = (a_input_dontcare || "").trim();

  // Convierte las cadenas a arreglos numéricos
  const minterm = input_minterm.length
    ? input_minterm.split(",").map((x) => Number(x))
    : [];
  const dontcare = input_dontcare.length
    ? input_dontcare.split(",").map((x) => Number(x))
    : [];

  // ⚙️ Nueva lógica: permitir minterms vacíos
  // Si ambos están vacíos, ejecuta igual, la función será 0.
  if (minterm.length === 0 && dontcare.length === 0) {
    console.info("Sin minterminos ni don't cares: la función será F = 0.");
  }

  quineMcCluskey(minterm, dontcare);
}


/**
 * Función principal invocada desde UI para procesar la variable seleccionada.
 * Se espera que exista <select id="seleccion_var"> con la letra de salida.
 * Recupera los arrays desde sessionStorage previamente poblado por f_obtener_valores.
 */
function my_qm() {
  const selectElement = document.getElementById("seleccion_var");
  if (!selectElement) {
    console.error("No se encontró elemento #seleccion_var");
    return;
  }
  
  const valorSeleccionado = selectElement.value;
  
  f_obtener_valores();
  
  // asegurarse de haber llenado sessionStorage con min/dont para cada letra
  const minObj = JSON.parse(sessionStorage.getItem("min " + valorSeleccionado)) || [];
  const dontObj = JSON.parse(sessionStorage.getItem("dont " + valorSeleccionado)) || [];

  const input_minterm = minObj.join(",");
  const input_dontcare = dontObj.join(",");

  f_init(input_minterm, input_dontcare);
}

/**
 * Extrae desde las claves de sessionStorage (la tabla completa) los min y dont
 * para todas las salidas y los guarda con keys "min X", "dont X", etc.
 * Corrige el bug de indice de fila multi-dígito.
 *
 * @returns {void}
 */
function f_obtener_valores() {
  const col_i = parseInt(document.getElementById("icols").value, 10);
  const col_o = parseInt(document.getElementById("ocols").value, 10);
  const filas = Math.pow(2, col_i);

  for (let j = 0; j < col_o; j++) {
    const letra = String.fromCharCode(91 - col_o + j);
    const l_MinTerm = [];
    const l_DontCare = [];

    for (let i = 0; i < filas; i++) {
      const id_control = `${letra}${i}`;
      const raw = sessionStorage.getItem(id_control);
      if (!raw) continue;
      let item_row;
      try {
        item_row = JSON.parse(raw);
      } catch (e) {
        if (DEBUG_QM) console.warn("Error parseando:", id_control, raw);
        continue;
      }
      // item_row expected: ["1","00"]
      const estado = item_row && item_row[0];
      if (estado === 1 || estado === "1") {
        l_MinTerm.push(i);
      } else if (estado === "X") {
        l_DontCare.push(i);
      }
    }

    // Guardar en sessionStorage: "min X" y "dont X"
    sessionStorage.setItem("min " + letra, JSON.stringify(l_MinTerm));
    sessionStorage.setItem("dont " + letra, JSON.stringify(l_DontCare));
    if (DEBUG_QM) console.log(`min ${letra} = ${l_MinTerm}, dont ${letra} = ${l_DontCare}`);
  }
}

/* ========== Orquestador Quine-McCluskey y funciones de impresión (manteniendo la estructura original) ========== */

/**
 * Realiza el proceso completo de simplificación booleana usando el
 * método de Quine–McCluskey, incluyendo la reducción por el método
 * de Petrick para obtener una o varias expresiones mínimas equivalentes.
 *
 * Esta función:
 *  1. Calcula las iteraciones de combinación de minterminos y don't cares.
 *  2. Identifica los Implicantes Primos (IP) y filtra los Don't Care.
 *  3. Determina los Implicantes Primos Esenciales (IPE) y los No Esenciales (NIP).
 *  4. Aplica el método de Petrick para seleccionar las coberturas mínimas posibles.
 *  5. Imprime paso a paso los resultados en el formulario HTML.
 *
 * @param {number[]} minterm - Lista de minterminos activos (por ejemplo [4, 8, 10, 11, 12, 15]).
 * @param {number[]} dontcare - Lista de términos "Don't Care" (por ejemplo [9, 14]).
 * @returns {void}
 *
 * Dependencias:
 * - getIterations()
 * - printIterations()
 * - searchForIP()
 * - deleteDontCare()
 * - searchForIPE()
 * - searchForNIP()
 * - printIPEyNIP()
 * - solveByPetrick()
 * - printSolution()
 * - printSolRep()
 *
 * Notas:
 * - La función utiliza el valor actual del elemento HTML <select id="seleccion_var">
 *   para etiquetar la variable de salida a simplificar (por ejemplo, "X", "Y", "Z").
 * - Si el método de Petrick devuelve varias soluciones mínimas equivalentes,
 *   se imprimen todas numeradas secuencialmente.
 * - Si no se encuentran minterminos válidos, se imprime "f = 0".
 * - Si todos los términos están activos, se imprime "f = 1".
 */
function quineMcCluskey(minterm, dontcare) 
{

  // ============================================================
  // 1️⃣ Generar las iteraciones de agrupación de minterminos
  // ============================================================
  const iterations = getIterations(minterm, dontcare);
  printIterations(iterations, minterm, dontcare);

  // ============================================================
  // 2️⃣ Obtener los Implicantes Primos (IP)
  // ============================================================
  const ip = searchForIP(iterations);
  let ip_wdc = deleteDontCare(ip, dontcare);
  if (DEBUG_QM) console.log("ip_wdc:", ip_wdc);

  // ============================================================
  // 3️⃣ Identificar los Implicantes Primos Esenciales (IPE)
  //     y los No Esenciales (NIP)
  // ============================================================
  const ipe = searchForIPE(ip_wdc, minterm);
  const nip = searchForNIP(ip_wdc, minterm, ipe);

  printIPEyNIP(ipe, nip, minterm);

  // ============================================================
  // 4️⃣ Aplicar el método de Petrick para hallar todas las
  //     combinaciones mínimas equivalentes
  // ============================================================
  const primeImplicants = ipe.concat(nip);
  const rawSolutions = solveByPetrick(primeImplicants, minterm);

  // Normalizar el formato de salida:
  // Siempre obtener una lista de soluciones (cada una es array de Termino)
  let validSolutions = [];

  if (Array.isArray(rawSolutions) && rawSolutions.length > 0) {
    if (Array.isArray(rawSolutions[0])) {
      // Ejemplo: [[T,T,T], [T,T,T]] → múltiples soluciones mínimas
      validSolutions = rawSolutions;
    } else {
      // Ejemplo: [T,T,T] → una sola solución
      validSolutions = [rawSolutions];
    }
  } else {
    // Si Petrick no devolvió nada, usar los esenciales (IPE) como fallback
    validSolutions = [ipe];
  }

  // ============================================================
  // 5️⃣ Imprimir todas las soluciones equivalentes en la interfaz
  // ============================================================
  const selectElement = document.getElementById("seleccion_var");
  const valorSeleccionado = selectElement ? selectElement.value : "";

  validSolutions.forEach((sol, idx) => {
    // Validar tipo de dato
    if (!Array.isArray(sol)) sol = [];

    let repsolution = [];
    try {
      // printSolution convierte los objetos Termino en cadenas legibles
      repsolution = printSolution(sol, minterm, dontcare) || [];
    } catch (e) {
      console.error("Error al generar repsolution:", e);
      repsolution = [];
    }

    // Etiqueta numerada solo si hay varias soluciones mínimas
	// Usar 'valorSeleccionado' limpio para sessionStorage,
	// y pasar la etiqueta aparte solo para mostrarla visualmente.
	const etiquetaVisible =
	validSolutions.length > 1
		? `${valorSeleccionado} (${idx + 1})`
		: valorSeleccionado;
	
	printSolRep(repsolution, valorSeleccionado, etiquetaVisible);

  });
}

//  function quineMcCluskey(minterm, dontcare) 
//  {
//  	const iterations = getIterations(minterm, dontcare);
//  	printIterations(iterations, minterm, dontcare);
//  
//  	const ip = searchForIP(iterations);
//  	let ip_wdc = deleteDontCare(ip, dontcare);
//  	if (DEBUG_QM) console.log("ip_wdc:", ip_wdc);
//  
//  	const ipe = searchForIPE(ip_wdc, minterm);
//  	const nip = searchForNIP(ip_wdc, minterm, ipe);
//  
//  	printIPEyNIP(ipe, nip, minterm);
//  	
//  console.group("QM DEBUG");
//  console.log("minterm:", minterm);
//  console.log("dontcare:", dontcare);
//  console.log("ip (primos):", ip);
//  console.log("ip_wdc (sin DC):", ip_wdc);
//  console.log("ipe (esenciales):", ipe);
//  console.log("nip (no-esenciales):", nip);
//  console.groupEnd();
//  
//  	//const solution = getIPEyIPS(minterm, ip_wdc, ipe, nip);
//  	//const repsolution = printSolution(solution, minterm, dontcare);
//    
//  	// 🧩 Aplicar método de Petrick en lugar de heurística manual
//  	const primeImplicants = ipe.concat(nip);
//  	const solutions = solveByPetrick(primeImplicants, minterm);
//  	
//  let validSolutions = [];
//  
//  if (Array.isArray(rawSolutions) && rawSolutions.length > 0) {
//    if (Array.isArray(rawSolutions[0])) {
//      // Ya hay varias soluciones (cada una es arreglo de Termino)
//      validSolutions = rawSolutions;
//    } else {
//      // Solo una solución (arreglo plano de Termino)
//      validSolutions = [rawSolutions];
//    }
//  } else {
//    // Petrick no devolvió nada, usar IPE
//    validSolutions = [ipe];
//  }
//  
//  
//  // ✅ Mostrar todas las soluciones equivalentes
//  const selectElement = document.getElementById("seleccion_var");
//  const valorSeleccionado = selectElement.value;
//  
//  validSolutions.forEach((sol, idx) => {
//    const repsolution = printSolution(sol, minterm, dontcare);
//    const etiqueta = (validSolutions.length > 1)
//      ? `${valorSeleccionado} (${idx + 1})`
//      : valorSeleccionado;
//    printSolRep(repsolution, etiqueta);
//  });
//  	
//  	// // Si Petrick no devolvió nada, usamos IPE como fallback
//  	// const validSolutions = (solutions.length > 0) ? solutions : [ipe];
//  	// 
//  	// console.log("validSolutions (final to print):", validSolutions);
//  	// 
//  	// // Mostrar todas las soluciones equivalentes
//  	// 
//  	// const selectElement = document.getElementById("seleccion_var");
//  	// const valorSeleccionado = selectElement.value;
//  	// 
//  	// if (validSolutions.length === 1) {
//  	// const repsolution = printSolution(validSolutions[0], minterm, dontcare);
//  	// printSolRep(repsolution, valorSeleccionado);
//  	// } else {
//  	// validSolutions.forEach((sol, idx) => {
//  	// 	const repsolution = printSolution(sol, minterm, dontcare);
//  	// 	printSolRep(repsolution, `${valorSeleccionado} (${idx + 1})`);
//  	// });
//  	// }
//  
//  
//    
//  	// printSolRep(repsolution, valorSeleccionado);
//  }

/* ========== Las funciones de impresión se mantienen mayormente igual,
   pero se corrigen cálculos y variables para evitar errores ========== */

/**
 * Retorna el mínimo número de bits necesarios para representar el mayor término.
 * @param {number[]} arr
 * @returns {number}
 */
function bitsRequired(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return 1;
  const max = Math.max(...arr);
  return Math.max(1, Math.ceil(Math.log2(max + 1)));
}

/* printIterations / changeFPtoPos / changeBinNumber / printIPEyNIP /
   isMinTinIP / printSolution / getLogicRep / printSolRep
   Se mantienen con pequeñas correcciones internas (uso let/const, cálculo de bits).
   Para no extender innecesariamente esta respuesta, las dejo sin cambios lógicos
   pero con variables locales corregidas. */

/* -------------------------
   Implemento ahora las funciones de impresión corregidas (resumidas)
   ------------------------- */

function changeFPtoPos(fp) {
  const pos = [];
  for (const f of fp) pos.push(Math.log2(f));
  return pos;
}

function changeBinNumber(bin, pos_fp) {
  const bin_str = bin.split("");
  for (const f of pos_fp) {
    const idx = bin_str.length - 1 - f;
    if (idx >= 0 && idx < bin_str.length) bin_str[idx] = "_";
  }
  return bin_str.join("");
}

function printIterations(iterations, minterm, dontcare) {
  const terminos = (minterm || []).concat(dontcare || []).slice();
  terminos.sort((a, b) => a - b);
  const numt = bitsRequired(terminos);
  if (DEBUG_QM) console.log("imprimiendo terminos", terminos);

  let output = `<div class="col"><h2>Primera parte</h2>`;
  for (const it of iterations) {
    let contador = 0;
    output += `
      <table class="table">
      <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col">Minimización</th>
          <th scope="col">Pares</th>
          <th scope="col">FP</th>
        </tr>
      </thead>
      <tbody>`;
    for (const gp of it) {
      if (!gp) continue;
      contador++;
      for (const t of gp) {
        const bin = (t.mp[0] || 0).toString(2).padStart(numt, "0");
        const pos_fp = changeFPtoPos(t.fp);
        const nbin = changeBinNumber(bin, pos_fp);
        output += `<tr>
            <th scope="row">${contador}</th>
            <td>${nbin}</td>
            <td>${t.mp}`;
        output += t.used ? "&#10004" : "&#x2718";
        output += `</td>
            <td>${t.fp}</td>
          </tr>`;
      }
      output += `<tr><td style="border-bottom: 5px solid #ccc;" colspan="4"></td></tr>`;
    }
    output += `</tbody></table>`;
  }
  output += `</div>`;
  const el = document.getElementById("solution");
  if (el) el.innerHTML = output;
}

function printIPEyNIP(ipe, nip, minterm) {
  let output = `<div class="col"><h2>Segunda parte</h2>`;
  output += `<table class="table"><thead><tr><th scope="col">IP</th>`;
  for (const m of minterm) output += `<th scope="col">${m}</th>`;
  output += `</tr></thead><tbody>`;

  for (const ip of ipe) {
    output += `<tr><th scope="row">${ip.mp}</th>`;
    for (const m of minterm) {
      output += `<td>${isMinTinIP(ip.mp, m) ? "X" : ""}</td>`;
    }
    output += `</tr>`;
  }
  for (const ip of nip) {
    output += `<tr><th scope="row">${ip.mp}</th>`;
    for (const m of minterm) {
      output += `<td>${isMinTinIP(ip.mp, m) ? "X" : ""}</td>`;
    }
    output += `</tr>`;
  }

  output += `</tbody></table></div>`;
  const el = document.getElementById("solution2");
  if (el) el.innerHTML = output;
}

function isMinTinIP(mp, m) {
  for (const it of mp) if (it === m) return true;
  return false;
}

// VERSION FUNCIONAL - COn 1 respuesta
// function printSolution(solution, minterm, dontcare) {
//   const terminos = (minterm || []).concat(dontcare || []).slice();
//   terminos.sort((a, b) => a - b);
//   const numt = bitsRequired(terminos);
//   const repsolution = [];
//   let output = `<div class="col"><h2>Solución</h2>`;
//   output += `<table class="table"><thead><tr><th scope="col">IP</th><th scope="col">Minimización</th><th scope="col">Variables</th></tr></thead><tbody>`;
// 
//   for (const s of solution) {
//     const bin = (s.mp[0] || 0).toString(2).padStart(numt, "0");
//     const pos_fp = changeFPtoPos(s.fp);
//     const nbin = changeBinNumber(bin, pos_fp);
//     const lrep = getLogicRep(nbin);
//     repsolution.push(lrep);
//     output += `<tr><th scope="row">${s.mp}</th><td>${nbin}</td><td>${lrep}</td></tr>`;
//   }
// 
//   output += `</tbody></table></div>`;
//   const el = document.getElementById("solution3");
//   if (el) el.innerHTML = output;
//   return repsolution;
// }






// ****************** VERSION FUNCIONAL *********
//  /**
//   * printSolution
//   * - Convierte un array de Termino (solution) en representaciones legibles.
//   * - Inserta en el elemento #solution3 una tabla con la solución (nbin, término, rep lógica).
//   * - Devuelve un array de strings con la representación de cada término (repsolution).
//   *
//   * Compatible con la estructura Termino { mp: [...], fp: [...], used: bool }
//   *
//   * @param {Array} solution - array de Termino (p. ej. [Termino, Termino, ...])
//   * @param {number[]} minterm
//   * @param {number[]} dontcare
//   * @returns {string[]} repsolution - p. ej. ["BC'D'", "AC", "AD'"]
//   */
//  function printSolution(solution, minterm, dontcare) {
//    // Resultado textual que devolveremos
//    const repsolution = [];
//  
//    // Seguridad: si no hay solution, limpíamos el contenedor y devolver array vacío
//    let el = document.getElementById("solution3");
//    if (!Array.isArray(solution) || solution.length === 0) {
//      if (el) el.innerHTML = `<div class="col"><h2>Solución</h2><p>No hay términos a mostrar.</p></div>`;
//      return repsolution;
//    }
//  
//    // Determinar ancho en bits para mostrar binarios (toma max de minterm+dontcare)
//    const términos = (minterm || []).concat(dontcare || []);
//    términos.sort((a, b) => a - b);
//    const numt = (términos.length > 0) ? Math.max(1, Math.ceil(Math.log2(Math.max(...términos) + 1))) : 1;
//  
//    // Construir HTML (tabla similar a la usada por printSolution anterior)
//    let output = `<div class="col"><h2>Solución</h2>`;
//    output += `<table class="table"><thead><tr><th scope="col">IP</th><th scope="col">Minimización</th><th scope="col">Variables</th></tr></thead><tbody>`;
//  
//    // Para cada término (Termino) en solution:
//    for (let i = 0; i < solution.length; i++) {
//      const t = solution[i];
//  
//      // Extraer binario base desde el primer mp (si existe)
//      const firstMp = (Array.isArray(t.mp) && t.mp.length > 0) ? t.mp[0] : 0;
//      const bin = (firstMp || 0).toString(2).padStart(numt, "0");
//  
//      // Convertir fp en posiciones (si existen) y obtener nbin con guiones
//      // Si fp contiene la forma textual (como "A' + B"), preferimos usar t.fp directamente.
//      // Aquí asumimos que t.fp es un array de fragmentos (ej ["A", "B'", ...]) o contiene string tokens.
//      let nbin = bin;
//      if (Array.isArray(t.fp) && t.fp.length > 0) {
//        // En muchos flujos t.fp fue usado para la representación simbólica; si sus items
//        // son números/potencias, intentar formar posiciones, si son strings, juntarlos.
//        const allAreStrings = t.fp.every(item => typeof item === "string");
//        if (allAreStrings) {
//          // formar la representación textual y usarla para repsolution / Variables
//          const textual = t.fp.join("");
//          repsolution.push(textual);
//          // Para la columna "Minimización" mostramos una versión simplificada:
//          nbin = textual; // muestra textual en vez de binarios con guiones
//        } else {
//          // Si fp es numérico (ej [4] o [2,8]) interpretamos como potencias y transformamos
//          try {
//            // convertir diffs a posiciones (si son potencias de 2)
//            const pos_fp = [];
//            for (const f of t.fp) {
//              const p = Math.log2(f);
//              if (Number.isFinite(p) && p >= 0) pos_fp.push(p);
//            }
//            // reemplazar bits por '_' en las posiciones pos_fp
//            const bin_arr = bin.split("");
//            for (const fpos of pos_fp) {
//              const idx = bin_arr.length - 1 - fpos;
//              if (idx >= 0 && idx < bin_arr.length) bin_arr[idx] = "_";
//            }
//            nbin = bin_arr.join("");
//            // construir representación lógica con getLogicRep (si existe)
//            if (typeof getLogicRep === "function") {
//              const lrep = getLogicRep(nbin);
//              repsolution.push(lrep);
//            } else {
//              // fallback: push nbin si no hay getLogicRep
//              repsolution.push(nbin);
//            }
//          } catch (e) {
//            // fallback seguro
//            repsolution.push(nbin);
//          }
//        }
//      } else {
//        // Si no hay fp: intentar generar representación lógica a partir de nbin
//        if (typeof getLogicRep === "function") {
//          const lrep = getLogicRep(nbin);
//          repsolution.push(lrep);
//        } else {
//          repsolution.push(nbin);
//        }
//      }
//  
//      // Obtener lista de minterms mp
//      const mpList = Array.isArray(t.mp) ? t.mp.join(",") : String(t.mp || "");
//  
//      // Obtener la representación de variables (si getLogicRep no se usó aún)
//      let varRep = "";
//      if (typeof getLogicRep === "function") {
//        // Si repsolution ya tiene el último elemento correspondiente, úsalo
//        const last = repsolution[repsolution.length - 1];
//        varRep = last || getLogicRep(nbin);
//      } else {
//        varRep = repsolution[repsolution.length - 1] || nbin;
//      }
//  
//      output += `<tr><th scope="row">${mpList}</th><td>${nbin}</td><td>${varRep}</td></tr>`;
//    }
//  
//    output += `</tbody></table></div>`;
//  
//    // Insertar resultado en DOM
//    if (el) el.innerHTML = output;
//  
//    // Depuración opcional
//    if (DEBUG_QM) console.log("printSolution -> repsolution:", repsolution);
//  
//    return repsolution;
//  }



/**
 * printSolution
 * - Convierte un array de Termino (solution) en representaciones legibles.
 * - Inserta en el elemento #solution3 una tabla con la solución (nbin, término, rep lógica).
 * - Devuelve un array de strings con la representación de cada término (repsolution).
 *
 * Compatible con la estructura Termino { mp: [...], fp: [...], used: bool }
 *
 * @param {Array} solution - array de Termino (p. ej. [Termino, Termino, ...])
 * @param {number[]} minterm
 * @param {number[]} dontcare
 * @returns {string[]} repsolution - p. ej. ["BC'D'", "AC", "AD'"]
 */
function printSolution(solution, minterm, dontcare) {
  const repsolution = [];
  let el = document.getElementById("solution3");

  if (!Array.isArray(solution) || solution.length === 0) {
    if (el)
      el.innerHTML = `<div class="col"><h2>Solución</h2><p>No hay términos a mostrar.</p></div>`;
    return repsolution;
  }

  const términos = (minterm || []).concat(dontcare || []);
  términos.sort((a, b) => a - b);
  const numt =
    términos.length > 0
      ? Math.max(1, Math.ceil(Math.log2(Math.max(...términos) + 1)))
      : 1;

  let output = `<div class="col"><h2>Solución</h2>`;
  output += `<table class="table"><thead><tr><th scope="col">MP</th><th scope="col">Patrón</th><th scope="col">Variables</th></tr></thead><tbody>`;

  // === 🔧 Revisión de cada término
  for (let i = 0; i < solution.length; i++) {
    const t = solution[i];
    const mpList = Array.isArray(t.mp) ? t.mp.join(",") : String(t.mp || "");

    // Si hay varios minterms, generar patrón común con '_'
    let nbin = "";
    if (Array.isArray(t.mp) && t.mp.length > 0) {
      const numVars =
        document.getElementById("icols") &&
        parseInt(document.getElementById("icols").value, 10)
          ? parseInt(document.getElementById("icols").value, 10)
          : numt;

      const bins = t.mp.map((m) => m.toString(2).padStart(numVars, "0"));
      let pattern = bins[0].split("");
      for (let b = 1; b < bins.length; b++) {
        for (let k = 0; k < pattern.length; k++) {
          if (pattern[k] !== bins[b][k]) pattern[k] = "_";
        }
      }
      nbin = pattern.join("");
    } else {
      // fallback: un solo minterm
      const firstMp =
        Array.isArray(t.mp) && t.mp.length > 0 ? t.mp[0] : 0;
      nbin = (firstMp || 0).toString(2).padStart(numt, "0");
    }

    // Representación lógica
    let varRep = "";
    if (typeof getLogicRep === "function") {
      varRep = getLogicRep(nbin);
    } else {
      varRep = nbin;
    }

    repsolution.push(varRep);

    if (DEBUG_QM)
      console.log(`printSolution DEBUG → mp=[${mpList}] pattern=${nbin} → ${varRep}`);

    output += `<tr><th scope="row">${mpList}</th><td>${nbin}</td><td>${varRep}</td></tr>`;
  }

  output += `</tbody></table></div>`;
  if (el) el.innerHTML = output;

  if (DEBUG_QM) console.log("printSolution -> repsolution:", repsolution);
  return repsolution;
}



function getLogicRep(nbin) { 
  const allVars = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

  // Obtener número de variables de entrada directamente del formulario
  const colInput = document.getElementById("icols");
  const numVars = colInput ? parseInt(colInput.value, 10) : 4; // usa 4 por defecto si no existe

  if (nbin == null) return "0";

  let nbin_str = String(nbin);

  // Si es patrón de don't care ("____") → no mostrar
  if (/^_+$/.test(nbin_str)) return "";

  // Solo aceptar caracteres válidos
  if (!/^[01_]+$/.test(nbin_str)) return "0";

  // Si tiene menos bits que las variables de entrada, completar con ceros
  if (nbin_str.length < numVars) {
    nbin_str = nbin_str.padStart(numVars, "0");
  }

  const bits = nbin_str.split("");
  const vars = allVars.slice(0, numVars);
  let rep = "";

  for (let i = 0; i < numVars; i++) {
    const bit = bits[i];
    const variable = vars[i];
    if (bit === "1") rep += variable;
    else if (bit === "0") rep += variable + "'";
    // '_' se omite (don't care interno)
  }

  console.log(`getLogicRep DEBUG → nbin: ${nbin} | padded: ${nbin_str} | numVars: ${numVars} → ${rep}`);
  return rep;
}






/**
 * Imprime la representación final de la función simplificada (SOP) en pantalla.
 * Corrige el caso donde no hay términos (f = vacío).
 *
 * @param {string[]} repsolution - Array de expresiones simplificadas, ej. ["A'B", "AB'"]
 */
/**
 * Imprime la representación final de la función simplificada (SOP) en pantalla.
 * Detecta correctamente los casos constantes (f=0, f=1) y de sólo Don't Care.
 *
 * @param {string[]} repsolution - Array con los términos simplificados
 * @param {string} letra - Variable actual (X, Y, Z, etc.)
 */
function printSolRep(repsolution, letra, etiquetaVisible) 
{
  console.log("DEBUG printSolRep entrada:", { letra, repsolution });
  const minData = sessionStorage.getItem("min " + letra);
  const dontData = sessionStorage.getItem("dont " + letra);
  console.log("DEBUG printSolRep sessionStorage:", { minData, dontData });
  
  // Usa etiquetaVisible (si existe) para mostrar el nombre en pantalla,
  // pero sigue usando 'letra' pura para leer sessionStorage.
  const etiquetaMostrar = (typeof etiquetaVisible !== "undefined" && etiquetaVisible) ? etiquetaVisible : letra;
  
  let output = `<h3>${etiquetaMostrar} = `;

  // --- Leer los valores min y dont desde sessionStorage ---
  const min = JSON.parse(sessionStorage.getItem("min " + letra) || "[]");
  const dont = JSON.parse(sessionStorage.getItem("dont " + letra) || "[]");
  const col_i = parseInt(document.getElementById("icols").value, 10);
  const totalCombinaciones = Math.pow(2, col_i);

  // --- Caso 1: sólo Don't Care ---
  if (min.length === 0 && dont.length > 0) {
    output += `X (solo Don't Care)`;

  // --- Caso 2: sin minterms ni don't cares → función 0 ---
  } else if (min.length === 0 && dont.length === 0) {
    output += `0`;

  // --- Caso 3: todos los minterms posibles → función 1 ---
  } else if (min.length + dont.length === totalCombinaciones) {
    output += `1`;

  // --- Caso 4: función normal (expresión simplificada) ---
  } else if (repsolution && repsolution.length > 0) {
    output += repsolution.join(" + ");

  // --- Caso 5: fallback (si repsolution vacío pero no total) ---
  } else {
    output += `0`;
  }

  output += `</h3>`;

  let el = document.getElementById("solution4");
  if (el) el.innerHTML += output;
}







/**
 * Aplica el método de Petrick para seleccionar el conjunto mínimo
 * de implicantes que cubren todos los minterminos requeridos.
 * 
 * @param {Termino[]} primeImplicants - Lista de implicantes primos (IPE + NIPE)
 * @param {number[]} minterms - Lista de minterminos que deben cubrirse
 * @returns {Termino[]} subconjunto mínimo de implicantes
 */
function solveByPetrick(primeImplicants, minterms) 
{
  if (!primeImplicants || primeImplicants.length === 0) return [];

  // 1️⃣ Construir expresiones de cobertura: cada minterm -> lista de implicantes que lo cubren
  const coverSets = minterms.map(m =>
    primeImplicants
      .map((pi, i) => (pi.mp.includes(m) ? "P" + i : null))
      .filter(x => x !== null)
  );

  // Si algún minterm no está cubierto por ningún implicante → error
  if (coverSets.some(set => set.length === 0)) {
    console.warn("⚠️ Un mintermino no está cubierto por ningún implicante:", coverSets);
    return [];
  }

  // 2️⃣ Expandir el producto lógico (P1+P2)(P3+P4+P5) → lista de combinaciones de Ps
  let product = coverSets[0].map(x => [x]); // Inicial
  for (let i = 1; i < coverSets.length; i++) {
    const newProduct = [];
    for (const term1 of product) {
      for (const term2 of coverSets[i]) {
        const combined = [...term1];
        if (!combined.includes(term2)) combined.push(term2);
        newProduct.push(combined);
      }
    }
    product = newProduct;
  }

  // 3️⃣ Eliminar duplicados y simplificar (absorción)
  // a) Ordenar cada producto (conjunto de Ps)
  product = product.map(p => p.sort());
  // b) Eliminar combinaciones repetidas
  product = product.filter(
    (p, i, arr) =>
      i === arr.findIndex(q => JSON.stringify(q) === JSON.stringify(p))
  );
  // c) Eliminar combinaciones que son superconjuntos de otras
  product = product.filter(
    (p, i, arr) => !arr.some((q, j) => j !== i && q.every(x => p.includes(x)))
  );

// 4️⃣ Encontrar las combinaciones con menor número de implicantes
const minLen = Math.min(...product.map(p => p.length));
const minimalCombos = product.filter(p => p.length === minLen);

// 5️⃣ Convertir todas las combinaciones a conjuntos de objetos Termino
const allResults = minimalCombos.map(combo =>
  combo.map(tag => primeImplicants[parseInt(tag.substring(1))])
);

// 6️⃣ Retornar todas las soluciones mínimas equivalentes
console.info("🧩 Petrick: soluciones equivalentes =", allResults);
return allResults;


console.group("Petrick internal");
console.log("coverSets:", coverSets);
console.log("product (expanded):", product);
console.log("minimalCombos (tags):", minimalCombos);
console.log("allResults (Termino arrays):", allResults);
console.groupEnd();


}


/* ========== Fin del archivo refactorizado ========== */
