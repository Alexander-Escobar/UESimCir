/**
 * @file simcir_minmaxtermino.js
 * @version 1.6
 * @since 2024
 * @description
 * Genera expresiones booleanas en forma canónica:
 *  - SOP (Suma de Productos / Mínimos términos)
 *  - POS (Producto de Sumas / Máximos términos)
 * 
 * Los datos son leídos desde sessionStorage, donde cada combinación de
 * entradas/salidas se almacena como:
 * 
 *   Key:  "X0", "Y3", ...
 *   Value: ["valor", "bitsBinarios"]
 * 
 * Ejemplo:
 *   ["1", "10"] → Salida = 1, Entradas = A=1, B=0
 * 
 * La longitud de la cadena de bits depende del número de variables de entrada.
 * El resultado se inserta en los elementos HTML con id="sop" y id="pos".
 * 
 * Compatible con cualquier número de variables de entrada (n) y de salida (m).
 * 
 * @author
 *   Alexander Enrique Escobar <alexander.enrique.escobar@gmail.com>
 * @maintainer
 *   Alexander Enrique Escobar, 2025
 * @copyright Alexander Enrique Escobar 2024
 */

// =======================================================
// FUNCION PRINCIPAL
// =======================================================

/**
 * @name get_sop
 * @function get_sop
 * @description
 * Genera las expresiones booleanas canónicas (SOP y POS)
 * para cada salida del circuito lógico.
 * 
 * @summary
 * 1. Obtiene el número de entradas y salidas desde el DOM.
 * 2. Recorre cada combinación de la tabla de verdad.
 * 3. Para cada salida, concatena los términos SOP y POS
 *    según el valor almacenado en sessionStorage.
 * 4. Inserta los resultados finales en el DOM.
 * 
 * @example
 * // Supongamos icols = 2, ocols = 3
 * // Y en sessionStorage:
 * // "Y1" = ["1","01"], "Y2" = ["X","10"]
 * get_sop();
 * // => SOP: Y = A'B
 * // => POS: Y = (A + B')(A' + B)(A' + B')
 * 
 * @returns {void} No devuelve valor. Actualiza el DOM.
 */
function get_sop() 
{
  const col_i = parseInt(document.getElementById("icols").value, 10); // # de entradas
  const col_o = parseInt(document.getElementById("ocols").value, 10); // # de salidas
  const filas = Math.pow(2, col_i); // Total de combinaciones de entrada

  let l_html_sop = "";
  let l_html_pos = "";

  // --- Recorre cada salida ---
  for (let j = 0; j < col_o; j++) {
    const salida = String.fromCharCode(91 - col_o + j); // X, Y, Z, etc.
    const sop_terms = [];
    const pos_terms = [];

    // --- Recorre todas las filas de la tabla de verdad ---
    for (let i = 0; i < filas; i++) {
      const id_control = `${salida}${i}`;
      const raw = sessionStorage.getItem(id_control);
      if (!raw) continue;

      let item_row;
      try {
        item_row = JSON.parse(raw);
      } catch (e) {
        console.warn("Error parseando", id_control, raw);
        continue;
      }

      const [valor, bits] = item_row; // ["1", "10"]

      // --- SOP (Suma de Productos) ---
      if (valor === "1") {
        sop_terms.push(get_eval_sop(bits));
      }

      // --- POS (Producto de Sumas) ---
      if (valor === "0" || valor === "X") {
        pos_terms.push(`(${get_eval_pos(bits)})`);
      }
    }

    // --- Si no hay términos, es una función constante ---
    if (sop_terms.length === 0) {
      l_html_sop += `<p>${salida} = 0</p>`;
    } else {
      l_html_sop += `<p>${salida} = ${sop_terms.join(" + ")}</p>`;
    }

    if (pos_terms.length === 0) {
      l_html_pos += `<p>${salida} = 1</p>`;
    } else {
      l_html_pos += `<p>${salida} = ${pos_terms.join("")}</p>`;
    }
  }

  // --- Inserta los resultados en el DOM ---
  document.getElementById("sop").innerHTML = l_html_sop;
  document.getElementById("pos").innerHTML = l_html_pos;
}

// =======================================================
// FUNCIONES AUXILIARES
// =======================================================

/**
 * @function get_eval_sop
 * @description
 * Genera un término de tipo **SOP (Suma de Productos)** o minitérmino.
 * Cada bit binario se traduce en una variable o su negación.
 * 
 * - '1' → variable directa (A, B, C...)
 * - '0' → variable negada (A', B', C'...)
 * 
 * @param {string} bits - Cadena binaria (ej. "10", "011", "1010").
 * @returns {string} Expresión SOP parcial (ej. `"A'B"`, `"A'BC"`).
 * 
 * @example
 * get_eval_sop("10"); // "A'B"
 * get_eval_sop("011"); // "A'BC"
 */
function get_eval_sop(bits) {
  let result = "";
  for (let i = 0; i < bits.length; i++) {
    const letter = String.fromCharCode(65 + i); // A, B, C...
    result += bits[i] === "1" ? letter : letter + "'";
  }
  return result;
}

/**
 * @function get_eval_pos
 * @description
 * Genera un término de tipo **POS (Producto de Sumas)** o maxitérmino.
 * Cada bit binario se traduce en una variable o su negación,
 * separadas por el operador OR (`+`).
 * 
 * - '0' → variable directa (A, B, C...)
 * - '1' → variable negada (A', B', C'...)
 * 
 * @param {string} bits - Cadena binaria (ej. "10", "011", "1010").
 * @returns {string} Expresión POS parcial (ej. `"A' + B"`, `"A + B' + C"`).
 * 
 * @example
 * get_eval_pos("10"); // "A' + B"
 * get_eval_pos("011"); // "A + B' + C'"
 */
function get_eval_pos(bits) {
  let result = "";
  for (let i = 0; i < bits.length; i++) {
    const letter = String.fromCharCode(65 + i);
    result += bits[i] === "0" ? letter + " + " : letter + "' + ";
  }
  return result.slice(0, -3); // elimina el último " + "
}















