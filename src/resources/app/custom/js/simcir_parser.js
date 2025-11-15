 /**
 * @file Gestor para parseo de expresiones de Bool
 * @author Alexander Enrique Escobar  <alexander.enrique.escobar@gmail.com>
 * @version 1.0
 * @since 2025
 * @copyright Alexander Enrique Escobar 2025
 */
function fx_tabla()
{
	var expresionOut = document.getElementById('form-ecuacion-var').value;
	var expresionIn = document.getElementById('form-ecuacion').value;
	var expresionBooleana = expresionOut + " = " + expresionIn;
	const elementoMensaje = document.getElementById('form-ecuacion-danger');
	
	// var expresionBooleana = "(A + B') * (A' + B) * (A' + B') + C"; // "A'B' + AB'"		// "(A + B') * (A' + B) * (A' + B')"
	
	console.log(expresionBooleana);
	
	if (validarSintaxisBooleana(expresionBooleana) == true)
	{
		
		elementoMensaje.textContent = "Expresion Bool Valida";
		var tabla1 = construirTablaDeVerdad(expresionIn);
		// console.log(`\n--- Tabla de Verdad para: ${expresionBooleana} ---`);
		// console.table(tabla1);
		
		dibujarTablaDeVerdad(tabla1);
		construirEcuaciones(tabla1);
		
		//Z = (A + B' + C) (A' + B + C) (A' + B' + C)") //Z = A'B'C' + A'B'C + A'BC + AB'C + ABC"); //Z =(A + B') * (A' + B) * (A' + B') + CF'");
		
		document.getElementById('diagrama').disabled = false;
	}

}



/**
 * Genera y dibuja un diagrama SimCirJS a partir de una ecuación booleana,
 * y actualiza la etiqueta de descripción asociada.
 *
 * @param {string} a_ecuacion - ID del elemento HTML (por ejemplo, <p>) que contiene la ecuación booleana.
 * @param {string} a_simcir - Selector CSS (por ejemplo, "#mySimcir") del contenedor donde se mostrará el diagrama.
 *
 * Ejemplo de uso:
 *   setdraw('ec-simple', '#mySimcir');
 */
function setdraw(a_ecuacion, a_simcir)
{
	var ecuacionSimple = document.getElementById(a_ecuacion);  // 'ec-simple'
	var $s = simcir;
	var $simcir = $(a_simcir); // '#mySimcir'
	var simcir_label = a_simcir.replace('#', '') + '-label';

	document.getElementById(simcir_label).innerHTML  = "Diagrama de " + ecuacionSimple.textContent;
	
	console.log(ecuacionSimple.textContent);

	//console.log(normalizaExprecionBool(ecuacionSimple.textContent));
  
	var $myvar = draw_device(ecuacionSimple.textContent);
	// var $myvar = draw_device(normalizaExprecionBool(ecuacionSimple.textContent));
	
	console.log($myvar);
	console.log(simcir_label)
	
	$s.setupSimcir($simcir, $myvar );
}








function limpiarExpresion(expresion)
{
    const resultado = {
        salida: null,
        expresion: null
    };

    if (!expresion || typeof expresion !== 'string') {
        throw new Error("Expresión vacía o inválida.");
    }

    // Eliminar espacios y convertir · a *
    let expr = expresion.replace(/·/g, '*').replace(/\s+/g, '').toUpperCase();

    // Extraer salida (ej: Z=...)
    const match = expr.match(/^([A-Z])=([\w\+\*\(\)']+)$/);
    if (!match) {
        throw new Error("La expresión debe tener formato 'Z = ...' con letras A-Z.");
    }

    const salida = match[1];
    expr = match[2];

    // Validar caracteres válidos
    if (!/^[A-Z'+*()]+$/.test(expr)) {
        throw new Error("Solo se permiten letras A-Z, +, *, ', (, ).");
    }

    // Insertar * implícitos entre:
    // 1. letra y letra => AB → A*B
    expr = expr.replace(/([A-Z])(?=[A-Z])/g, '$1*');

    // 2. letra o negación seguida de paréntesis de apertura => A( o A'( → A*( o A'*(
    expr = expr.replace(/([A-Z]')(?=\()/g, '$1*');  // A'( → A'*(
    expr = expr.replace(/([A-Z])(?=\()/g, '$1*');   // A( → A*(

    // 3. paréntesis de cierre seguido de letra => )A → )*A
    expr = expr.replace(/\)(?=[A-Z])/g, ')*$&');

    // 4. paréntesis cerrado seguido de paréntesis abierto => )( → )*(
    expr = expr.replace(/\)\(/g, ')*(');

    resultado.salida = salida;
    resultado.expresion = expr;

    return resultado;
}




function draw_device(expresionBooleana) {
  const devices = [];
  const connectors = [];
  const entradas = new Map();
  const negaciones = new Map();
  const usadoY = new Set();
  const nombreSalida = expresionBooleana.split('=')[0].trim();
  let idCounter = 0;

  function nuevoId() { return 'dev' + (idCounter++); }
  function siguienteY() {
    let y = 0; while (usadoY.has(y)) y += 48; usadoY.add(y); return y;
  }

  function getEntradaId(nombreVar) {
    if (entradas.has(nombreVar)) return entradas.get(nombreVar);
    const id = nuevoId(), y = siguienteY();
    devices.push({ type: "In", id, x: 32, y, label: nombreVar });
    entradas.set(nombreVar, id);
    return id;
  }

  function getNegadaId(nombreVar) {
    if (negaciones.has(nombreVar)) return negaciones.get(nombreVar);
    const entradaId = getEntradaId(nombreVar);
    const id = nuevoId(), y = siguienteY();
    devices.push({ type: "NOT", id, x: 96, y, label: `${nombreVar}'` });
    connectors.push({ from: `${id}.in0`, to: `${entradaId}.out0` });
    negaciones.set(nombreVar, id);
    return id;
  }

  function crearCompuerta(op, entradasIds, profundidad) {
    const id = nuevoId();
    const x = 160 + profundidad * 80, y = siguienteY();
    const label = entradasIds.map(e => e.label || e).join(op === "AND" ? "*" : "+"); //quitamos el por *
    devices.push({ type: op, id, x, y, label });
    entradasIds.forEach((e, i) => connectors.push({ from: `${id}.in${i}`, to: `${e.id || e}.out0` }));
    return { id, label, x, y };
  }

  // === Tokenización ===
function tokenize(expr) {
  const tokens = [];
  expr = expr.split('=')[1].replace(/\s+/g, '');
  let i = 0;

  while (i < expr.length) {
    const c = expr[i];
    if (/[A-Z]/.test(c)) {
      const varName = c;
      let negated = false;
      if (i + 1 < expr.length && expr[i + 1] === "'") {
        negated = true;
        i++;
      }
      tokens.push({ type: 'VAR', value: varName, negated });
      i++;
    } else if (c === '+') {
      tokens.push({ type: 'OR' }); i++;
    } else if (c === '*') {
      tokens.push({ type: 'AND' }); i++;
    } else if (c === '(') {
      tokens.push({ type: 'PAREN_OPEN' }); i++;
    } else if (c === ')') {
      tokens.push({ type: 'PAREN_CLOSE' }); i++;
    } else {
      throw new Error(`Carácter no válido: ${c}`);
    }
  }

  // Inserta AND implícito entre tokens adyacentes apropiados
  const finalTokens = [];
  for (let j = 0; j < tokens.length; j++) {
    const t1 = tokens[j];
    const t2 = tokens[j + 1];
    finalTokens.push(t1);
    if (
      t2 &&
      (
        (t1.type === 'VAR' || t1.type === 'PAREN_CLOSE') &&
        (t2.type === 'VAR' || t2.type === 'PAREN_OPEN')
      )
    ) {
      finalTokens.push({ type: 'AND' });
    }
  }

  return finalTokens;
}

  // === Parser recursivo (AST) ===
  function parseExpression(tokens) {
    let pos = 0;
    function peek() { return tokens[pos]; }
    function consume(type) {
      const token = tokens[pos];
      if (type && token.type !== type)
        throw new Error(`Esperaba ${type} pero encontré ${token.type}`);
      pos++; return token;
    }

    function parseFactor() {
      const token = peek();
      if (!token) throw new Error("Factor inesperadamente vacío");
      if (token.type === 'PAREN_OPEN') {
        consume('PAREN_OPEN');
        const expr = parseOr();
        consume('PAREN_CLOSE');
        return expr;
      }
      if (token.type === 'VAR') {
        consume();
        return { type: 'VAR', name: token.value, negated: token.negated };
      }
      throw new Error(`Token inesperado en parseFactor: ${token.type}`);
    }

    function parseAnd() {
      let left = parseFactor();
      while (peek() && peek().type === 'AND') {
        consume('AND');
        const right = parseFactor();
        left = { type: 'AND', left, right };
      }
      return left;
    }

    function parseOr() {
      let left = parseAnd();
      while (peek() && peek().type === 'OR') {
        consume('OR');
        const right = parseAnd();
        left = { type: 'OR', left, right };
      }
      return left;
    }

    const expr = parseOr();
    if (pos < tokens.length)
      throw new Error(`Tokens restantes sin procesar en posición ${pos}`);
    return expr;
  }

  // === Construcción del circuito desde el AST ===
  function buildCircuitFromAST(node, profundidad = 1) {
    if (!node) return null;
    if (node.type === 'VAR') {
      const id = node.negated ? getNegadaId(node.name) : getEntradaId(node.name);
      return { id, label: node.negated ? `${node.name}'` : node.name };
    }
    if (node.type === 'AND' || node.type === 'OR') {
      const left = buildCircuitFromAST(node.left, profundidad + 1);
      const right = buildCircuitFromAST(node.right, profundidad + 1);
      return crearCompuerta(node.type, [left, right], profundidad);
    }
    throw new Error(`Tipo de nodo desconocido: ${node.type}`);
  }

  // === Proceso principal ===
  const tokens = tokenize(expresionBooleana);
  const ast = parseExpression(tokens);
  const salidaFinal = buildCircuitFromAST(ast);

  // === Salida final ===
  const idSalida = nuevoId();
  devices.push({ 
	type: "Out", 
	id: idSalida, 
	x: salidaFinal ? salidaFinal.x + 96 : 200, 
	y: salidaFinal ? salidaFinal.y : 100, 
	label: nombreSalida 
	});
  
  connectors.push({ from: `${idSalida}.in0`, to: `${salidaFinal.id}.out0` });


  // === Ajuste de tamaño máximo con margen ===
  const MAX_WIDTH = 900;
  const MAX_HEIGHT = 600;
  const MARGIN = 10; // margen automático

  // Encontrar dimensiones reales del diseño
  let maxX = 0, maxY = 0;
  for (const d of devices) {
    if (d.x > maxX) maxX = d.x;
    if (d.y > maxY) maxY = d.y;
  }

  // Calcula factores de escala si excede los límites
  const scaleX = maxX > (MAX_WIDTH - MARGIN * 2) ? (MAX_WIDTH - MARGIN * 2) / maxX : 1;
  const scaleY = maxY > (MAX_HEIGHT - MARGIN * 2) ? (MAX_HEIGHT - MARGIN * 2) / maxY : 1;
  const scale = Math.min(scaleX, scaleY); // usar el menor para mantener proporciones

  // Escala todas las posiciones si es necesario
  if (scale < 1) {
    for (const d of devices) {
      d.x = Math.round(d.x * scale);
      d.y = Math.round(d.y * scale);
    }
  }

  // Aplica margen adicional
  for (const d of devices) {
    d.x += MARGIN;
    d.y += MARGIN;
  }

  // Ajusta el tamaño final con margen incluido
  const finalWidth = Math.min(MAX_WIDTH, Math.max(800, maxX * scale + MARGIN * 2));
  const finalHeight = Math.min(MAX_HEIGHT, Math.max(400, maxY * scale + MARGIN * 2));


	// === Reubicar la salida final (derecha + centrada verticalmente) ===
	{
		const salida = devices.find(d => d.type === "Out");
		if (salida) {
	
			// Usar solo dispositivos internos (NO la salida, que puede tener y inválido)
			const internos = devices.filter(d => d.type !== "Out");
	
			// Rango vertical correcto
			const minY = Math.min(...internos.map(d => d.y));
			const maxY = Math.max(...internos.map(d => d.y));
	
			// Centrado vertical de la salida
			salida.y = Math.round((minY + maxY) / 2);
	
			// Punto más a la derecha del circuito
			const maxX = Math.max(...internos.map(d => d.x));
	
			// Alinear la salida a la derecha del todo (+96 px)
			salida.x = maxX + 96;
	
			// Limitar para no salirse del canvas
			salida.x = Math.min(MAX_WIDTH - MARGIN - 32, salida.x);
		}
	}
  
  

  // === Distribuir entradas verticalmente y alinear negaciones ===
  const entradasList = devices.filter(d => d.type === "In");
  const negacionesList = devices.filter(d => d.type === "NOT");

  if (entradasList.length > 0) {
    // Calcular espacio vertical total disponible (respetando márgenes)
    const totalHeight = finalHeight - MARGIN * 2;
    const spacing = totalHeight / (entradasList.length + 1);

    // Ordenar alfabéticamente para que siempre salgan ordenadas
    entradasList.sort((a, b) => a.label.localeCompare(b.label));

    // Reposicionar cada entrada
    entradasList.forEach((entrada, i) => {
      entrada.x = MARGIN + 32;
      entrada.y = Math.round(MARGIN + (i + 1) * spacing);
    });

    // Alinear negaciones con sus entradas
    negacionesList.forEach(neg => {
      const nombreOriginal = neg.label.replace('¬', '');
      const entrada = entradasList.find(e => e.label === nombreOriginal);
      if (entrada) {
        neg.y = entrada.y; // misma altura
        neg.x = entrada.x + 64; // un poco a la derecha de su entrada
      }
    });
  }


  return {
    width: finalWidth + 200, height: finalHeight + 50, showToolbox: false,
    toolbox: [
      { type: "In" }, { type: "Out" }, { type: "NOT" },
      { type: "AND" }, { type: "OR" }, { type: "NAND" },
      { type: "NOR" }, { type: "XOR" }, { type: "XNOR" }
    ],
    devices, connectors
  };
}








/**
 * Crea y conecta compuertas escalonadas (AND/OR) para manejar más de 2 entradas.
 * Implementa Fan-In estricto (uso de in0 e in1).
 */
// function connectGroupedGate(sources, type, fullLabel, devices, connectors, devCounter, startX, startY) {
//     if (sources.length === 0) return null;
//     if (sources.length === 1) return sources[0]; 
// 
//     let currentSources = sources.map(s => ({...s, currentLabel: s.currentLabel || s.label || s.id}));
//     let currentX = startX;
//     
//     while (currentSources.length > 1) {
//         let nextSources = [];
//         let lastGateY = startY; 
//         
//         // Ajustamos la Y base si tenemos un punto de partida
//         if (currentSources.length > 2 && startY) {
//              let miny = Math.min(...currentSources.map(s => s.y));
//              let maxy = Math.max(...currentSources.map(s => s.y));
//              lastGateY = (miny + maxy) / 2;
//         }
// 
// 
//         for (let i = 0; i < currentSources.length; i += 2) {
//             const src1 = currentSources[i];
//             const src2 = currentSources[i + 1]; 
// 
//             if (!src2) {
//                 nextSources.push(src1);
//                 continue; 
//             }
//             
//             const gateId = `dev${devCounter++}`;
//             
//             let gateY = (src1.y + src2.y) / 2;
//             
//             if (i > 0) {
//                  // Si no es el primer par, apilamos la compuerta 
//                  gateY = lastGateY + 60; 
//             }
//             
//             lastGateY = gateY; 
//             
//             let label = fullLabel; 
//             if (currentSources.length > 2 || nextSources.length > 0) {
//                 const connective = (type === 'AND' ? '' : '+');
//                 const label1 = src1.currentLabel || src1.label;
//                 const label2 = src2.currentLabel || src2.label;
//                 label = `(${label1}${connective}${label2})`;
//             }
// 
//             devices.push({ "type": type, "id": gateId, "x": currentX, "y": gateY, "label": label });
//             
//             connectors.push({ "from": `${src1.id}.${src1.pin}`, "to": `${gateId}.in0` });
//             connectors.push({ "from": `${src2.id}.${src2.pin}`, "to": `${gateId}.in1` });
// 
//             nextSources.push({ id: gateId, pin: 'out0', x: currentX, y: gateY, label: label, currentLabel: label, type: type, y: gateY });
//         }
// 
//         currentSources = nextSources;
//         currentX += 80; 
//         if (currentSources.length > 1) {
//              // Actualizar startY para el próximo nivel de escalonamiento
//              startY = lastGateY + 60; 
//         }
//     }
//     
//     return currentSources[0];
// }
// 
// /**
//  * Genera el JSON de SimCirJS para dibujar un circuito (POS):
//  * Z = (A + B' + C)(A' + B + C)(A' + B' + C)
//  */
// function draw_device(expresionBooleana) {
//     const contenedor = document.getElementById('devices'); 
//     if (!contenedor) return; 
// 
//     // 1. LIMPIEZA Y NORMALIZACIÓN
//     const partes = expresionBooleana.split('=');
//     if (partes.length !== 2) return;
//     const varSalida = partes[0].trim().toUpperCase();
//     let expresion = partes[1].trim().toUpperCase();
// 
//     expresion = expresion.replace(/([A-Z'])(\s*[A-Z(])/g, '$1*$2').replace(/([A-Z])(\()/g, '$1*$2').replace(/\s+/g, '').replace(/(\))([A-Z])/g, '$1*$2');
//     
//     const variablesSet = new Set(expresion.match(/[A-Z]/g));
//     const variables = Array.from(variablesSet).sort();
// 
//     // 2. INICIALIZACIÓN
//     let devices = [];
//     let connectors = [];
//     let devCounter = 0;
//     let xOffset = 64;
//     let currentY = 40; 
//     const varOutputMap = {}; 
//     let factorOutputs = []; 
//     
//     // CORRECCIÓN X: Columna principal de la lógica de los factores
//     let gateXPosition = xOffset + 240; 
//     
//     // CORRECCIÓN X: Columna X dedicada para ORs binarios, más separada.
//     const orGateCache = new Map(); 
//     const cacheGateXPosition = xOffset + 160; 
//     let cacheYPosition = 40; 
//     let termYOffset = 40; 
//     
//     let maxLogicX = 0; 
// 
//     // 3. GENERAR DISPOSITIVOS DE ENTRADA ('In') y Puertas NOT
//     variables.forEach(v => {
//         const inId = `dev${devCounter++}`;
//         const label = v;
//         const outSource = { id: inId, pin: 'out0', x: xOffset, y: currentY, label: label, currentLabel: label, y: currentY, type: 'In' };
//         devices.push({ "type": "In", "id": inId, "x": xOffset, "y": currentY, "label": label });
//         varOutputMap[v] = outSource;
//         
//         if (expresion.includes(v + "'")) {
//             const notId = `dev${devCounter++}`;
//             const notX = xOffset + 80;
//             const notSource = { id: notId, pin: 'out0', x: notX, y: currentY, label: v + "'", currentLabel: v + "'", y: currentY, type: 'NOT' };
//             devices.push({ "type": "NOT", "id": notId, "x": notX, "y": currentY, "label": "NOT" });
//             connectors.push({ "from": `${inId}.out0`, "to": `${notId}.in0` });
//             varOutputMap[v + "'"] = notSource;
//         }
//         currentY += 80; 
//     });
// 
//     // FUNCIÓN: Implementación del nodo del árbol (Crear/Obtener OR binario con caché)
//     const getOrCreateBinaryOR = (input1, input2) => {
//         const factors = [input1, input2].sort();
//         const cacheKey = factors.join('+');
//         const initialLabel = `(${factors.join('+')})`;
// 
//         if (orGateCache.has(cacheKey)) {
//             return orGateCache.get(cacheKey); 
//         } else {
//             const sources = factors.map(f => varOutputMap[f]).filter(s => s);
//             
//             if (sources.length < 2) return null; 
//             
//             // Creamos el nodo OR binario, usando la posición Y del caché
//             const newOR = connectGroupedGate(sources, 'OR', initialLabel, devices, connectors, devCounter, cacheGateXPosition, cacheYPosition);
//             devCounter = devices.length;
//             
//             // Forzar las Coordenadas X, Y del caché
//             newOR.x = cacheGateXPosition; 
//             newOR.y = cacheYPosition;
//             
//             const deviceToUpdate = devices.find(d => d.id === newOR.id);
//             if(deviceToUpdate) {
//                 deviceToUpdate.x = cacheGateXPosition;
//                 deviceToUpdate.y = cacheYPosition;
//             }
//             
//             cacheYPosition += 60; 
//             
//             orGateCache.set(cacheKey, newOR);
//             return newOR;
//         }
//     };
//     
//     // 4. DESCOMPOSICIÓN DE FACTORES POS
//     const factoresPOS = expresion.split('*').filter(f => f.startsWith('(') && f.endsWith(')'));
// 
//     factoresPOS.forEach(factor => {
//         const subExp = factor.substring(1, factor.length - 1); 
//         const orInputs = subExp.split('+').map(t => t.trim());
//         
//         let terminoOutput = null; 
//         
//         if (orInputs.length === 2) {
//             terminoOutput = getOrCreateBinaryOR(orInputs[0], orInputs[1]);
//             
//         } else if (orInputs.length > 2) {
//             // OR de múltiples entradas (requiere escalonamiento)
//             
//             const input1 = orInputs[0]; 
//             const input2 = orInputs[1]; 
//             const remainingInputs = orInputs.slice(2); 
//             
//             const intermediateOR = getOrCreateBinaryOR(input1, input2);
//             
//             if (!intermediateOR) return;
// 
//             // 2. Conectar el nodo binario con las fuentes restantes (ej: (A+B') y C)
//             let sourcesForFinalOR = [intermediateOR].concat(remainingInputs.map(f => varOutputMap[f])).filter(s => s);
//             
//             if (sourcesForFinalOR.length < 2) {
//                  terminoOutput = intermediateOR;
//             } else {
//                  const orGateY = termYOffset; 
//             
//                  // 3. Resolver el escalonamiento restante (columna X más a la derecha)
//                  terminoOutput = connectGroupedGate(sourcesForFinalOR, 'OR', subExp, devices, connectors, devCounter, gateXPosition + 80, orGateY);
//                  devCounter = devices.length;
//             
//                  // Asignación de posición Y del factor OR COMPLETO
//                  const deviceToUpdate = devices.find(d => d.id === terminoOutput.id);
//                  if(deviceToUpdate) {
//                      deviceToUpdate.y = orGateY;
//                      terminoOutput.y = orGateY;
//                  }
//             
//                  termYOffset = Math.max(termYOffset, orGateY + 80);
//             }
//         }
//         
//         // Almacenar la salida del factor OR completo
//         if (terminoOutput && terminoOutput.y) {
//             factorOutputs.push(terminoOutput);
//             maxLogicX = Math.max(maxLogicX, terminoOutput.x);
//         }
//     });
// 
//     // 5. COMBINACIÓN FINAL (AND principal) y SALIDA ('Out')
//     let ultimoDispositivoLogico = null;
//     
//     const finalGateType = 'AND'; 
//     
//     if (factorOutputs.length > 0) {
//         // Escalar el AND final para la multiplicación de todos los factores
//         const finalANDGate = connectGroupedGate(factorOutputs, finalGateType, varSalida, devices, connectors, devCounter, maxLogicX + 120);
//         devCounter = devices.length;
//         ultimoDispositivoLogico = finalANDGate;
//     }
//     
//     // Conectar el resultado final a la salida 'Z'
//     if (ultimoDispositivoLogico) {
//         const outId = `dev${devCounter++}`;
//         const maxX = devices.reduce((max, d) => Math.max(max, d.x), 0);
//         const outX = maxX + 120; 
//         const outY = ultimoDispositivoLogico.y || 72;
//         devices.push({ "type": "Out", "id": outId, "x": outX, "y": outY, "label": varSalida });
//         connectors.push({ "from": `${ultimoDispositivoLogico.id}.${ultimoDispositivoLogico.pin}`, "to": `${outId}.in0` });
//     }
// 
//     // 6. INYECTAR EL JSON FINAL
//     const simcirJson = { devices, connectors }; 
//     contenedor.textContent = JSON.stringify(simcirJson, null, 2);
// }





/**
 * Implementa una versión simplificada del Algoritmo de Quine-McCluskey.
 *
 * @param {Array<number>} mintermsIndices Arreglo de índices (m) donde Z=1.
 * @param {Array<number>} dontCareIndices Arreglo de índices (m) donde Z=X (Don't Care).
 * @returns {Array<string>} Arreglo de implicantes primarios esenciales simplificados (ej: ["A'B", "C"]).
 */
function construirQM(mintermsIndices, dontCareIndices) {
    // 1. Unir y ordenar todos los términos a cubrir
    const todosLosTerminos = [...mintermsIndices, ...dontCareIndices].sort((a, b) => a - b);
    
    if (todosLosTerminos.length === 0) {
        return [];
    }

    // 2. Determinar el número de variables (n)
    // Se calcula el log2 del término más grande para encontrar el número de bits necesario.
    const maxTerm = todosLosTerminos[todosLosTerminos.length - 1];
    const numVariables = Math.ceil(Math.log2(maxTerm + 1));
    
    // Si no hay variables, algo salió mal
    if (numVariables === 0) return []; 

    // 3. Funciones de Conversión

    /** Convierte un número a su representación binaria con padding (relleno con ceros a la izquierda) */
    const toBinary = (num) => {
        return num.toString(2).padStart(numVariables, '0');
    };

    /** Convierte el binario (ej: '01-1') a la expresión booleana (ej: A'CD) */
    const toBoolean = (binaryTerm, variables) => {
        let term = '';
        for (let i = 0; i < binaryTerm.length; i++) {
            const char = binaryTerm[i];
            if (char === '0') {
                term += variables[i] + "'"; // Negado
            } else if (char === '1') {
                term += variables[i]; // Sin Negar
            }
            // Si es '-', se omite (simplificación)
        }
        return term;
    };

    // 4. ALGORITMO CORE DE AGRUPACIÓN
    
    // Convertir todos los términos a binario y agrupar por el número de '1' (cero '0' en el ejemplo)
    let grupos = {}; // Estructura: { num_ones: [ { binario: '0101', minterms: [5] } ] }
    
    [...mintermsIndices, ...dontCareIndices].forEach(m => {
        const binario = toBinary(m);
        const numOnes = (binario.match(/1/g) || []).length;
        
        if (!grupos[numOnes]) grupos[numOnes] = [];
        
        grupos[numOnes].push({ 
            binario: binario, 
            minterms: [m],
            usado: false 
        });
    });

    let implicantesPrimarios = [];
    let gruposActuales = grupos;

    // Simulación de la Etapa de Agrupación de QM (comparación repetida)
    while (Object.keys(gruposActuales).length > 1) {
        let nuevosGrupos = {};
        let keys = Object.keys(gruposActuales).map(Number).sort((a, b) => a - b);

        for (let i = 0; i < keys.length - 1; i++) {
            const grupoA = gruposActuales[keys[i]];
            const grupoB = gruposActuales[keys[i+1]];

            grupoA.forEach(termA => {
                grupoB.forEach(termB => {
                    // Comparar: ¿Difieren en un solo bit?
                    let diffCount = 0;
                    let diffIndex = -1;
                    for (let k = 0; k < numVariables; k++) {
                        if (termA.binario[k] !== termB.binario[k]) {
                            diffCount++;
                            diffIndex = k;
                        }
                    }

                    if (diffCount === 1) {
                        // Se pueden combinar!
                        termA.usado = true;
                        termB.usado = true;

                        // Crear nuevo binario (ej: '0101' y '0111' -> '01-1')
                        const nuevoBinario = termA.binario.substring(0, diffIndex) + '-' + termA.binario.substring(diffIndex + 1);
                        const nuevaListaMinterms = [...termA.minterms, ...termB.minterms];

                        // Añadir al nuevo grupo (o actualizar si ya existe)
                        const nuevoNumOnes = (nuevoBinario.match(/1/g) || []).length;
                        
                        if (!nuevosGrupos[nuevoNumOnes]) nuevosGrupos[nuevoNumOnes] = [];
                        
                        // Evitar duplicados en el nuevo grupo
                        if (!nuevosGrupos[nuevoNumOnes].some(t => t.binario === nuevoBinario)) {
                            nuevosGrupos[nuevoNumOnes].push({ 
                                binario: nuevoBinario, 
                                minterms: nuevaListaMinterms, 
                                usado: false 
                            });
                        }
                    }
                });
            });
        }
        
        // Mover términos NO usados al arreglo de Implicantes Primarios
        Object.values(gruposActuales).forEach(grupo => {
            grupo.filter(term => !term.usado)
                 .forEach(term => {
                    // Evitar duplicados
                    if (!implicantesPrimarios.some(ip => ip.binario === term.binario)) {
                        implicantesPrimarios.push(term);
                    }
                 });
        });
        
        // Continuar con los nuevos grupos formados
        gruposActuales = nuevosGrupos;
    }

    // Añadir los términos restantes (del último ciclo)
    Object.values(gruposActuales).forEach(grupo => {
        grupo.forEach(term => implicantesPrimarios.push(term));
    });

    // 5. SELECCIÓN DE IMPLICANTES ESENCIALES (Simplificación extrema)
    // Para simplificar, solo devolveremos los implicantes primarios únicos.
    // Una implementación completa requeriría la "Tabla de Implicantes" para cubrir todos los minterms.
    
    // Obtener la lista de variables (A, B, C...)
    const variables = Array.from({length: numVariables}, (_, i) => String.fromCharCode(65 + i));
    
    // Convertir los binarios simplificados a expresiones booleanas
    const terminosSimplificados = implicantesPrimarios.map(ip => toBoolean(ip.binario, variables));

    // Eliminar duplicados si los hay (aunque la lógica de QM debería minimizarlos)
    return Array.from(new Set(terminosSimplificados));
}


/**
 * Analiza la tabla de verdad (matriz) para generar y mostrar las ecuaciones SOP, POS y Simplificada.
 * @param {Array<Array<any>>} a_tabla La tabla de verdad en formato de matriz (ej: [[A, B, Z], [0, 0, 0], ...]).
 */
 function construirEcuaciones(a_tabla) 
 {
    
	/* Lógica de verificación */
    if (!Array.isArray(a_tabla) || a_tabla.length < 2) {
        console.error("Error: Tabla de verdad vacía o incompleta para generar ecuaciones.");
        return;
    }

    // 1. EXTRAER ENCABEZADOS Y DATOS
	// El encabezado de variables está en la fila [0] (ej: ['A', 'B', 'C', 'Z'])
    const headers = a_tabla[0];
    const variables = headers.slice(0, -1); 			// Excluye la última columna (Z o salida)
    const var_salida = headers[headers.length - 1];  	// La última columna (Z)
    
	// Almacenamos los índices de las filas donde Z = 1 (minterms) y Z = 0 (maxterms)
    const mintermsIndices = []; // Para SOP
    const maxtermsIndices = []; // Para POS
    const dontCareIndices = []; // Para condiciones Don't Care (si se usan)
	
    // 2. RECORRER LAS FILAS DE DATOS Y OBTENER ÍNDICES (m)
	// Empezamos desde i = 1 para saltar la fila de encabezados [0]
    for (let i = 1; i < a_tabla.length; i++) {
        const resultadoZ = a_tabla[i][a_tabla[i].length - 1]; 
        const mintermIndex = i - 1; 

        if (resultadoZ === 1) {
            mintermsIndices.push(mintermIndex);
        } else if (resultadoZ === 0) {
            maxtermsIndices.push(mintermIndex);
        } else if (resultadoZ === 'X' || resultadoZ === 'x') {
            dontCareIndices.push(mintermIndex);
        }
    }


    // 3. CONSTRUIR Y MOSTRAR SOP Y POS
    // Nota: Para SOP y POS, necesitas la lista de minterms/maxterms con valores binarios,
    // pero como ya tienes la función original para generarlos, la usamos:
    // ** Simulación para que no falle la llamada a generarSOP/POS **
    const minterms = mintermsIndices.map(m => ({ index: m, valores: a_tabla[m+1].slice(0, -1) }));
    const maxterms = maxtermsIndices.map(m => ({ index: m, valores: a_tabla[m+1].slice(0, -1) }));

    const ecuacionSOP = generarSOP(variables, minterms, var_salida);
    const ecuacionPOS = generarPOS(variables, maxterms, var_salida);

    // 4. GENERAR LA ECUACIÓN SIMPLIFICADA USANDO QUINE-MCCLUSKEY (QM)
    const implicantesSimplificados = construirQM(mintermsIndices, dontCareIndices);
    
    let ecuacionSimplificada = '';
    if (implicantesSimplificados.length > 0) {
        ecuacionSimplificada = `${var_salida} = ` + implicantesSimplificados.join(' + ');
    } else if (mintermsIndices.length === 0) {
        ecuacionSimplificada = `${var_salida} = 0`; // Si no hay minterms, la salida es 0
    } else {
        ecuacionSimplificada = `${var_salida} = ` + ecuacionSOP.split('=')[1].trim(); // Si QM no simplificó, usamos SOP
    }

    // 5. INYECTAR EN EL HTML
    document.getElementById('ec-simple').textContent = ecuacionSimplificada;
    document.getElementById('ec-sop').textContent = ecuacionSOP;
    document.getElementById('ec-pos').textContent = ecuacionPOS;
}


// --- FUNCIONES AUXILIARES para SOP, POS ---
/**
 * Genera la forma SOP (Minterms)
 */
function generarSOP(variables, minterms, var_salida) {
    if (minterms.length === 0) return `${var_salida} = 0`;

    const terminos = minterms.map(minterm => {
        let termino = '';
        minterm.valores.forEach((valor, index) => {
            const variable = variables[index];
            if (valor === 1) {
                termino += variable; // Variable sin negar (ej: A)
            } else {
                termino += variable + "'"; // Variable negada (ej: A')
            }
        });
        return termino;
    });

    // Une los términos con el operador OR (+)
    return `${var_salida} = ` + terminos.join(' + ');
}

/**
 * Genera la forma POS (Maxterms)
 */
function generarPOS(variables, maxterms, var_salida) {
    if (maxterms.length === 0) return `${var_salida} = 1`; // La salida es siempre 1

    const terminos = maxterms.map(maxterm => {
        let termino = '(';
        const subterminos = [];
        
        maxterm.valores.forEach((valor, index) => {
            const variable = variables[index];
            if (valor === 0) {
                // En POS, los 0 se usan sin negar (ej: A)
                subterminos.push(variable);
            } else {
                // En POS, los 1 se usan negados (ej: A')
                subterminos.push(variable + "'");
            }
        });
        
        // Une los sub-términos con el operador OR (+)
        termino += subterminos.join(' + ');
        termino += ')';
        return termino;
    });

    // Une los términos con el operador AND implícito (espacio o *)
    return `${var_salida} = ` + terminos.join(' '); 
}




function dibujarTablaDeVerdad(tablaDeVerdad) 
{
    const contenedorTabla = document.getElementById('table-responsive');
    contenedorTabla.innerHTML = ''; // Limpiamos el contenido anterior.

    if (!Array.isArray(tablaDeVerdad) || tablaDeVerdad.length < 2) {
        // La tabla debe tener al menos la fila de encabezados y una fila de datos.
        contenedorTabla.innerHTML = '<p class="text-center text-danger">No se pudieron generar los datos de la tabla.</p>';
        return;
    }

    // Los encabezados de las variables (A, B, C, Z) están en la primera fila de la matriz.
    const variableHeaders = tablaDeVerdad[0]; 
    
    // El conjunto completo de encabezados, comenzando con 'Index'
    const fullHeaders = ['Index', ...variableHeaders]; 
    
    let htmlTabla = '<table class="table table-borderless table-centered">';
    
    // --- CONSTRUIR ENCABEZADO (<thead>) ---
    htmlTabla += '<thead><tr>';
    fullHeaders.forEach(label => {
        // Imprime 'Index', 'A', 'B', 'C', 'Z'
        htmlTabla += `<th scope="col" class="pb-2 border-bottom">${label.toUpperCase()}</th>`;
    });
    htmlTabla += '</tr></thead>';

    // --- CONSTRUIR CUERPO DE LA TABLA (<tbody>) ---
    htmlTabla += '<tbody>';
    
    // Empezamos a iterar desde i = 1 para saltarnos la fila de encabezados que está en tablaDeVerdad[0]
    for (let i = 1; i < tablaDeVerdad.length; i++) {
        const filaValores = tablaDeVerdad[i]; // Esto es un arreglo de valores [0, 0, 0, 1]
        
        // El index 'm' es el número de la fila actual (menos el encabezado)
        const index_m = i - 1; 

        htmlTabla += '<tr>';
        
        // 1. IMPRIMIR EL INDEX (m)
        htmlTabla += `<td>${index_m}</td>`;
        
        // 2. IMPRIMIR EL RESTO DE LOS VALORES (A, B, C, Z)
        filaValores.forEach(valor => {
            // Utilizamos el valor tal como viene en la matriz.
            const valorDisplay = valor ?? '—'; 
            htmlTabla += `<td>${valorDisplay}</td>`;
        });
        
        htmlTabla += '</tr>';
    }
    htmlTabla += '</tbody></table>';

    // Inyectar la tabla completa
    contenedorTabla.innerHTML = htmlTabla;
}



function normalizaExprecionBool(expresionBooleana) {
  if (!validarSintaxisBooleana(expresionBooleana)) return null;

  const original = expresionBooleana.trim().toUpperCase();
  const match = original.match(/^([A-Z])\s*=\s*(.+)$/);
  const outputVar = match ? match[1] : 'Z';
  const expresion = match ? match[2] : original;

  // Eliminar espacios
  let limpia = expresion.replace(/\s+/g, '');

  // Insertar * (AND) implícito entre:
  // - letra/letra → A*B
  // - letra/' → A'*B'
  // - ')' seguido de letra → )*A
  // - letra seguida de '(' → A*(...
  // - ')' seguido de '(' → )*(

  limpia = limpia
    .replace(/([A-Z]')(?=[A-Z])/g, "$1*")   // A'B → A'*B
    .replace(/([A-Z])(?=[A-Z])/g, "$1*")    // AB → A*B
    .replace(/([A-Z])(?=\()/g, "$1*")       // A( → A*(...
    .replace(/(\))(?=[A-Z])/g, "$1*")       // )A → )*A
    .replace(/(\))(?=\()/g, "$1*");         // )( → )*(

  return `${outputVar} = ${limpia}`;
}






/**
 * Valida la sintaxis de una expresión booleana (ej: "A'B + AB'").
 * * @param {string} expresion La expresión booleana a validar.
 * @returns {boolean} True si la sintaxis es válida, false en caso contrario.
 */
function validarSintaxisBooleana(expresion) 
{
    const mensajeElemento = document.getElementById('form-ecuacion-danger');
    const mostrarError = (msg) => {
        if (mensajeElemento) mensajeElemento.textContent = msg;
        console.error(msg);
        return false;
    };

    try {
        // 1. Limpieza y extracción
        const { salida, expresion: expr } = limpiarExpresion(expresion);

        if (!salida || !expr) {
            return mostrarError("Expresión vacía o mal formada.");
        }

        // 2. Validar caracteres válidos
        const caracteresValidos = /^[A-Z'+*()]+$/;
        if (!caracteresValidos.test(expr)) {
            return mostrarError("Error: Solo se permiten letras A-Z, +, *, ', (, ).");
        }

        // 3. Reglas de sintaxis

        // 3.1 Operadores duplicados o mal ubicados
        if (/[\+\*]{2,}/.test(expr)) {
            return mostrarError("Error: Operadores duplicados (++ o **).");
        }
        if (/^[\+\*]|[\+\*]$/.test(expr)) {
            return mostrarError("Error: Operador al inicio o al final.");
        }

        // 3.2 Paréntesis mal usados
        if (/\(\)/.test(expr)) {
            return mostrarError("Error: Paréntesis vacíos.");
        }
        if (/[\+\*]\)/.test(expr) || /\([\+\*]/.test(expr)) {
            return mostrarError("Error: Operadores mal colocados junto a paréntesis.");
        }

        // 3.3 Negaciones inválidas
        if (/''/.test(expr) || /^'/.test(expr)) {
            return mostrarError("Error: Negación mal colocada.");
        }

        // 3.4 Paréntesis balanceados
        let balance = 0;
        for (let char of expr) {
            if (char === '(') balance++;
            else if (char === ')') balance--;
            if (balance < 0) {
                return mostrarError("Error: Paréntesis de cierre sin apertura.");
            }
        }
        if (balance !== 0) {
            return mostrarError("Error: Paréntesis desbalanceados.");
        }

        // 3.5 Secuencias incorrectas como letra seguida de letra sin operador (ya corregido en limpiarExpresion)
        // → Ya no es necesario, limpiarExpresion se encarga.

        // 4. Todo bien
        return true;

    } catch (e) {
        return mostrarError("Error de sintaxis: " + e.message);
    }
}





/*
---
## 2. Función para Generar la Tabla de Verdad

Esta función toma la expresión validada y genera una matriz con todas las combinaciones de entrada y el resultado final.

```javascript
*/
/**
 * Construye y devuelve la tabla de verdad para una expresión booleana válida.
 *
 * @param {string} expresionBooleana La expresión a evaluar (ej: "A'B' + AB'").
 * @returns {Array<Array<any>>} Una matriz con el encabezado, variables y resultados.
 */
function construirTablaDeVerdad(expresionBooleana) 
{
	const var_salida = document.getElementById('form-ecuacion-var').value;
	const label_control = document.getElementById('var-entrada');
	
    // 1. Limpieza y Normalización
    const limpia = expresionBooleana.trim().toUpperCase().replace(/\s/g, ''); 

    // 2. Identificar y Ordenar Variables
    const variablesSet = new Set(limpia.match(/[A-Z]/g));
    const variables = Array.from(variablesSet).sort();
    
    const numVariables = variables.length;
    const numFilas = Math.pow(2, numVariables);
	
	
	label_control.textContent = `Variables de Entrada: ${numVariables} | ${variables}`;
	
    
    // 3. Crear la Función de Evaluación (TRADUCCIÓN MEJORADA)
    
    let jsExpresion = limpia;

    // 3a. Insertar el operador AND (*) implícito:
    // Insertar * entre:
    // 1) ) y (  -> Ej: (A+B)(C) se vuelve (A+B)*(C)
    // 2) ) y Variable -> Ej: (A+B)C se vuelve (A+B)*C
    // 3) Negación y Variable -> Ej: A'B se vuelve A'*B
    // 4) Variable y ( -> Ej: A(B+C) se vuelve A*(B+C)
    // 5) Variable y Variable (AND implícito) -> Ej: AB se vuelve A*B

    // 1 y 2: ) seguido de una Variable o (
    jsExpresion = jsExpresion.replace(/\)([A-Z\(])/g, ')*$1');

    // 3 y 5: Variable/Negación' seguida de Variable
    jsExpresion = jsExpresion.replace(/([A-Z'])([A-Z])/g, '$1*$2');
    
    // 4: Variable seguida de (
    jsExpresion = jsExpresion.replace(/([A-Z])(\()/g, '$1*$2');
    
    // 3b. Transformar NOT (') con Paréntesis de Agrupación para evitar el error de token:
    // Ahora A' se convierte en (A === 0)
    jsExpresion = jsExpresion.replace(/([A-Z])'/g, '($1 === 0)');
    
    // 3c. Reemplazar '+' por '||' para asegurar que siempre usemos lógica OR
    jsExpresion = jsExpresion.replace(/\+/g, '||'); 
    
    // 3d. Reemplazar '*' por '&&' (AND lógico)
    jsExpresion = jsExpresion.replace(/\*/g, '&&');
    
    // 4. Crear la función dinámica
    const funcionCuerpo = `return (${jsExpresion});`;
    
    // ESTA LÍNEA es donde ocurría el error, pero ahora con la traducción mejorada, debería funcionar.
    const evaluador = new Function(...variables, funcionCuerpo); 

    // 5. Construir la Matriz de la Tabla de Verdad
    const tabla = [];
    tabla.push([...variables, var_salida ]);  // 'expresionBooleana'

    for (let i = 0; i < numFilas; i++) {
        const fila = [];
        
        for (let j = 0; j < numVariables; j++) {
            const valor = (i >> (numVariables - 1 - j)) & 1;
            fila.push(valor);
        }

        // Evaluar la Expresión con los valores de la fila
        // Si usamos '||' y '&&', la función evaluador devolverá true/false.
        const resultadoBooleano = evaluador(...fila);
        
        // Convertir el resultado a 1 (True) o 0 (False)
        const resultadoFinal = resultadoBooleano ? 1 : 0;
        
        fila.push(resultadoFinal);
        tabla.push(fila);
    }

    return tabla;
}



/*
---

## 3. Ejemplo de Uso y Ejecución

```javascript
*/
function ejecutarAnalisis(expresion) {
    console.log(`\n======================================================`);
    console.log(`Analizando expresión: ${expresion}`);
    
    // 1. Validar la sintaxis
    if (!validarSintaxisBooleana(expresion)) {
        console.error("ANÁLISIS DETENIDO: La sintaxis de la expresión es INCORRECTA.");
        return;
    }
    
    console.log("SINTAXIS: VÁLIDA.");

    // 2. Generar y mostrar la Tabla de Verdad
    const tabla = construirTablaDeVerdad(expresion);
    
    console.log("TABLA DE VERDAD GENERADA:");
    // Usa console.table para un formato gráfico en el navegador/Node.js
    console.table(tabla);
}


// --- PRUEBAS ---

// Prueba VÁLIDA: Y = A'B' + AB'
// ejecutarAnalisis("A'B' + AB'");

// Prueba VÁLIDA: Z = (A + B') (A' + B) (A' + B')
// Nota: El código inserta automáticamente el * entre paréntesis
// ejecutarAnalisis("(A + B') (A' + B) (A' + B')"); 

// Prueba INVÁLIDA: Operador doble
// ejecutarAnalisis("A++B");