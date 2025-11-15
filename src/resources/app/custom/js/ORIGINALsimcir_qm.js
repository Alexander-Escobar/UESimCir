/**
 * @file Gestor para obtener las Funciones Booleanas de Min & Max terminos.
 * @author Alexander Enrique Escobar  <alexander.enrique.escobar@gmail.com>
 * @version 1.2
 * @since 2024
 * @copyright Alexander Enrique Escobar 2024
 */

function my_qm()
{
	// Seteo de Valores & Inicializacion de valores
	/**
	 * @constant
	 * @name input_minterm
	 * @type {string}
	 * @default
	 */
	var input_minterm = '1,3'; //'1,5,6,7,10,11,12,13,15'; //document.getElementById('minterminos').value;
	
	/**
	 * @constant 
	 * @name input_dontcare
	 * @type {string} 
	 * @default
	 */
	var input_dontcare = ''; //document.getElementById('dontcare').value;
	
	const selectElement = document.getElementById('seleccion_var');
	const valorSeleccionado = selectElement.value;
	var l_MinTerm = [];
	var l_DontCare = [];
	
	
	// Obtener valores
	f_obtener_valores();
	
	l_MinTerm = JSON.parse(sessionStorage.getItem("min " + valorSeleccionado));
	console.log(JSON.parse(sessionStorage.getItem("min " + valorSeleccionado)) );
	l_DontCare = JSON.parse(sessionStorage.getItem("dont " + valorSeleccionado));
	console.log(JSON.parse(sessionStorage.getItem("dont " + valorSeleccionado)) );
	
	input_minterm = l_MinTerm.join(',');
	input_dontcare = l_DontCare.join(',');
	
	// Evaluacion
	f_init(input_minterm, input_dontcare);
	// f_evaluacion()
	
	// Obtener Resultados
	// f_resultado()
}

/**
 * Filtra los datos directamente desde las claves de Session Storage
 * por una letra específica y clasifica los min-términos (1) y Don't Cares (X).
 *
 * @param {string} letra - La letra a filtrar (ej. 'Y', 'Z').
 * @returns {{minTerminos: number[], dontCares: number[]}} - Objeto con los arrays de índices (filas).
 */
function f_obtener_valores() // a_myselect
{
	// var x = document.getElementById(a_myselect).textContent;
	// var y = document.getElementById(a_myselect).value;
	// var z = JSON.parse(sessionStorage.getItem(y));

	// alert(y);
	// document.getElementById("variables").innerHTML = "You selected: " + x + " , Value: " + y;
	// z[0] = y;
	// sessionStorage.setItem(x, JSON.stringify(z));
	
	
	var col_i = parseInt(document.getElementById("icols").value, 10);
	var col_o = parseInt(document.getElementById("ocols").value , 10);
	var filas = Math.pow(2, col_i);
	var item_row = "";
	var l_MinTerm = [];
	var l_DontCare = [];
	
	for(j=0;j<col_o;j++)
	{
		l_MinTerm = [];
		l_DontCare = [];
		for (i=0; i<filas;i++)
		{
			id_control = String.fromCharCode(91 - col_o + j) + i;
			item_row = JSON.parse(sessionStorage.getItem(id_control));
			// console.log(id_control + " " + item_row);
			
			if (item_row[0] == 1)
			{
				l_MinTerm.push(id_control[1]);	// += id_control[1]+",";
			}
			
			if (item_row[0] == "X")
			{
				l_DontCare.push(id_control[1]);
			}
			
			// console.log(id_control[1]);
			// console.log 
			// sessionStorage.setItem("min " + id_control[0], JSON.stringify());
		}
		console.log("min " + id_control[0] +"=" + l_MinTerm);
		sessionStorage.setItem("min " + id_control[0], JSON.stringify(l_MinTerm));
		console.log("dont " + id_control[0] +"=" + l_DontCare);
		sessionStorage.setItem("dont " + id_control[0], JSON.stringify(l_DontCare));
	}

//function obtenerMinTerminosDesdeStorage(letra) {
    // const letraMayuscula = y; //letra.toUpperCase();
    // const minTerminos = []; // Almacenará los índices (filas) con "1"
    // const dontCares = [];   // Almacenará los índices (filas) con "X"
	// 
    // // 1. Iterar sobre todas las claves almacenadas en sessionStorage
    // for (let i = 0; i < sessionStorage.length; i++) {
    //     const key = sessionStorage.key(i); // Ej: "Y0", "Z1"
	// 
    //     // 2. Filtrar: Solo procesamos las claves que comienzan con la letra
    //     if (key && key.startsWith(letraMayuscula)) {
    //         try {
    //             // 3. Obtener el valor y convertirlo de string JSON a un array
    //             const valorString = sessionStorage.getItem(key);
    //             // Ejemplo: valorArray será ["1", "00"]
    //             const valorArray = JSON.parse(valorString); 
	// 
    //             // Verificamos que sea un array válido y que tenga al menos un elemento
    //             if (Array.isArray(valorArray) && valorArray.length > 0) {
    //                 
    //                 const estado = valorArray[0]; // "1", "0", o "X"
    //                 
    //                 // Extraer el índice (número de fila) de la clave: 
    //                 // Si key es "Y2" y letra es "Y", extraemos el "2"
    //                 const indiceStr = key.substring(letraMayuscula.length);
    //                 const indice = parseInt(indiceStr, 10);
	// 
    //                 // 4. Clasificar el estado y añadir el índice
    //                 if (!isNaN(indice)) { // Asegurar que el índice es un número válido
    //                     if (estado === '1') {
    //                         minTerminos.push(indice);
    //                     } else if (estado === 'X') {
    //                         dontCares.push(indice);
    //                     }
    //                 }
    //             }
    //         } catch (error) {
    //             // Captura y omite errores si una clave no tiene un JSON válido
    //             console.warn(`Omitiendo clave con formato incorrecto: ${key}`);
    //             continue;
    //         }
    //     }
    // }

    // 5. Devolver los resultados ordenados
    // return 
	// {
    //     minTerminos: minTerminos.sort((a, b) => a - b),
    //     dontCares: dontCares.sort((a, b) => a - b)
    // };
	// console.log(minTerminos: minTerminos.sort((a, b) => a - b), dontCares: dontCares.sort((a, b) => a - b));
//}
	
}


function f_init(a_input_minterm, a_input_dontcare)
{
  const input_minterm = a_input_minterm; //document.getElementById('minterminos').value;
  const input_dontcare = a_input_dontcare; //document.getElementById('dontcare').value;

  /**
   * FALTA validar que los input solo contengan numeros y que esten separados por comas y que NO se repitan los elementos y que No esten vacias
   */

  /*Los inputs los recibimos como string pero los guardamos como arrays y para ello separamos cada elemento y lo guardmos como number*/
  let minterm = []
  let dontcare = []

  if (input_minterm.length != 0 )
    minterm = input_minterm.split(",").map(Number);

  if (input_dontcare.length != 0)
    dontcare = input_dontcare.split(",").map(Number);

  /*Iniciamos el Quine-McCluskey con un arreglo que contiene los minterminos y
    los dont care juntos ya que el método sabe que hacer */
  if(minterm.length > 0)
    quineMcCluskey(minterm,dontcare);
  else alert("Debe haber por lo menos 1 término");

}


function quineMcCluskey(minterm, dontcare) 
{
  var iterations = getIterations(minterm,dontcare);

  printIterations(iterations,minterm,dontcare)

  ip = searchForIP(iterations);

  ip_wdc = deleteDontCare(ip,dontcare);
  console.log('sind',ip_wdc);

  /* Obtenemos lo implicantes primos esenciales */
  ipe = searchForIPE(ip_wdc,minterm);

  /* Se NIP se refiere al complemente de ipe, es decir, todo aquel
    implicante primo que no sea esencial  */
  nip = searchForNIP(ip_wdc,minterm,ipe)

  printIPEyNIP(ipe,nip,minterm)

  solution = getIPEyIPS(minterm,ip_wdc,ipe,nip)

  repsolution = printSolution(solution,minterm,dontcare)

  printSolRep(repsolution);

}



/*
	auxiliarymeth.js
*/
function searchMinterm(arr,minterm) {
  for (t of arr)
    if (t == minterm)
      return true;
  return false;
}

function isAlreadyInIPE(imp,ipe){
  for (it  of ipe)
    if (arraysEqual(it.mp,imp))
      return true;
  return false;
}

function arraysEqual(arr1, arr2) {
    if(arr1.length !== arr2.length)
        return false;
    for(var i = arr1.length; i--;) {
        if(arr1[i] !== arr2[i])
            return false;
    }
    return true;
}

function repeatedElements(nipe) {
  all = []
  for (ar of nipe)
    for (a  of ar.mp)
      all.push(a)
  console.log(all);
  let unique = [...new Set(all)];
  console.log("uniques",unique);

  contadores = []
  for (let i = 0; i < unique.length; i++)
    contadores.push(0)

  for (let i = 0; i < unique.length; i++)
    for (a  of all)
      if (unique[i] == a)
       contadores[i]++;

  repeated = []
  for (let i = 0; i < contadores.length; i++)
    if (contadores[i] > 1)
      repeated.push(unique[i])

  return repeated

}

function allarraysEmpty(nipe) {
  for (imp  of nipe)
    if (imp.mp.length > 0)
      return false;
  return true;
}

function searchMinterm(arr,minterm) {
  for (t of arr)
    if (t == minterm)
      return true;
  return false
}

function allSameLen(arr) {
  lens = []
  for (a of arr)
    lens.push(a.length)

  let first = lens[0]
  for (let i = 1; i < lens.length; i++)
    if(first != lens[i])
      return false;

  return true;

}

function arraysEqual(arr1, arr2) {
    if(arr1.length !== arr2.length)
        return false;
    for(var i = arr1.length; i--;) {
        if(arr1[i] !== arr2[i])
            return false;
    }

    return true;
}

function cloneObject(t){
  new_t = new Termino()
  new_t.fp = t.fp //estos nunca son afectados
  new_t.mp =t.mp.slice()

  return new_t
}



/*
	esencialmeth.js
*/

/**
  Esta función devuelve todas las iteraciones de
  la primera parte del metodo de quine McCluskey
*/
function getIterations(minterm,dontcare) {
  /* This are auxiliary variavles */
  var terminos = minterm.concat(dontcare);
  var item = [];
  var iterations = [];
  var it = 0;
  var ipf = []
  var flag = false;

  /** Creating initial group */
  for(var i = 0; i< terminos.length; i++){
      let pos = contarUnos(terminos[i]);
      let t = new Termino();
      t.add_mp(terminos[i]);
      addTerm(t,item,pos);
  }
  iterations.push(item)

  while (!flag) {
    item = iterations[it];
    var buffer =[];
    /** Obtaining prime implicants */
    for(var i = 0 ; i < item.length-1 ; i++) if(item[i] != null)
      for( var j = 0 ; j < item[i].length ; j++ )
        for(var k = 0 ; k < item[i+1].length; k++ )
          if (fp_equals(item[i][j].fp,item[i+1][k].fp)
            && diffsPotencia2(item[i][j].mp,item[i+1][k].mp)) {
            item[i][j].used = true;
            item[i+1][k].used = true;

            let t = new Termino();
            t.mp = item[i][j].mp.concat(item[i+1][k].mp)
            t.fp =item[i][j].fp.slice()
            t.add_fp(item[i+1][k].mp[0]-item[i][j].mp[0])
            t.mp.sort((a, b)=> a-b);
            t.fp.sort((a, b)=> a-b);
            /* i is the position of new term in new iteration*/
            addTerm(t,buffer,i);
          }
    if (buffer.length > 0) {
      iterations.push(buffer);
      it++;
    }else flag = true;

  }
  return iterations

}

function searchForIP(iterations) {
  let ipe = [];
  for (var it of iterations)
    for (var gp of it) if(gp !=null)
      for (var t of gp) if (!isInIPE(ipe,t) && !t.used)
          ipe.push(t)
  return ipe;
}

function deleteDontCare(ip,dontcare){
  var ip_wdc = ip.slice(0)

  for (var i = 0; i < dontcare.length; i++)
    for (let t of ip_wdc)
      if(t.mp.indexOf(dontcare[i])!= -1)
        t.mp.splice( t.mp.indexOf(dontcare[i]), 1 );

  deleteEmptyTerms(ip_wdc);

  return ip_wdc;
}

function searchForIPE(implicantes,minterms) {

  all = []
  contadores = []

  for (let i = 0; i < minterms.length; i++)
    contadores.push(0)

  for (ip of implicantes)
    for (i of ip.mp)
      all.push(i)

  all.sort((a,b)=>a-b)

  for (let i = 0; i< minterms.length; i++)
    for (j of all)
      if (minterms[i] == j)
        contadores[i]++

  mint_esenciales = []
  for (let i = 0; i < contadores.length; i++)
    if (contadores[i] == 1)
      mint_esenciales.push(minterms[i])

  console.log("mines",mint_esenciales);

  ipe = []
  for (mt of mint_esenciales)
    for (let i = 0; i< implicantes.length; i++)
      if(searchMinterm(implicantes[i].mp,mt))
        if(!isAlreadyInIPE(implicantes[i].mp,ipe))
          ipe.push(implicantes[i])

  console.log("ipe",ipe);

  return ipe;

}

function searchForNIP(implicantes,minterms,ipe) {
  nip = []

  for (a of implicantes) {
    nip.push(a)
  }

  for (impl of implicantes)
    for (a of ipe)
      if(arraysEqual(impl.mp,a.mp))
        nip.splice(nip.indexOf(impl),1)

  console.log("nip",nip);

  return nip;
}

function getIPEyIPS(minterms,implicantes,ipe,nipe) {

  let cp_nipe = [];

  for (m of nipe) {
    cp_nipe.push(cloneObject(m))
  }

  /*A los terminos que no son imp. primos esenciales, se les
   quita todo aquel termino que tenga este en los ipe y en ellos mismos.
  */
  for (imp of ipe)
    for (a of imp.mp)
      for (imp2 of nipe) {
          if(searchMinterm(imp2.mp,a)) {
            //console.log("el ipe ",a,"esta en ",imp2);
            let index =imp2.mp.indexOf(a)
             if (index > -1)
               imp2.mp.splice(index, 1);
          }
      }

  console.log("nipe",nipe);
  /*
    SE ANALIZAN TRES CASO BASE PRINCIPALES
    * SI LONGITUD ES CERO (DE TODOS)
    * SI LONGITUD ES LA MISMA Y SUS ELEMENTOS SON IGUALES
    * SI LONGITUD ES DIF.
  */

  solv1 = []

  if (!allarraysEmpty(nipe)) {
     repeatedT=repeatedElements(nipe)
     for (r of repeatedT)
       for (m of nipe)
        if (searchMinterm(m.mp,r)){
          let index =m.mp.indexOf(a)
           if (index > -1)
             m.mp.splice(index, 1);
        }
    if (allarraysEmpty(nipe)){
      // regresar el que sea como la respuesta
      console.log("La minimizacion es el que sea!");
      solv1.push(cp_nipe[0])
    }else {
      for (let j = 0; j < nipe.length; j++)
        if (nipe[j].length > 0)
          solv1.push(cp_nipe[j])
    }
  }
  console.log("solv1!",solv1);

  complete_solv = ipe
  for (s of solv1) {
    complete_solv.push(s)
  }

  console.log("solucion completa",complete_solv);

  return complete_solv

}


/*
	printer.js
*/

function printIterations(iterations,minterm,dontcare) {
  var terminos = minterm.concat(dontcare);
  var numt = Math.ceil(Math.log2(terminos[terminos.length-1]))
  terminos.sort((a, b)=> a-b);
  console.log("imprimendo terminos",terminos);
  var output = `<div class="col" >
    <h2>Primera parte</h2>
  `;

  for (var it of iterations){
    var contador = 0
    output +=
    `
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
    for (var gp of it) if(gp !=null){
      contador ++
      for (var t of gp){
        var bin = t.mp[0].toString(2).padStart(numt, '0')
        var pos_fp = changeFPtoPos(t.fp)
        var nbin = changeBinNumber(bin,pos_fp)
        output +=
        `<tr>
            <th scope="row">`+contador+`</th>
            <td>`+nbin+`</td>
            <td>`+t.mp;

            if (t.used)
              output += '&#10004';
            else
              output += '&#x2718';

            output += `</td>
            <td>`+t.fp+`</td>
          </tr>`;
        }
        output +=
        `<tr><td style="border-bottom: 5px solid #ccc;" colspan="4"></td></tr>`

      }
      output +=
      `  </tbody>
      </table>`;
    }


  output += `</div>`;

  document.getElementById('solution').innerHTML = output

}

function changeFPtoPos(fp) {
  pos = []
  for (f of fp)
    pos.push(Math.log2(f))
  return pos;
}

function changeBinNumber(bin,pos_fp) {
  var bin_str = bin.split("");
  for (f of pos_fp) {
    bin_str[bin_str.length-1-f] = "_"
  }
  return bin_str.join("")
}


/*
	printer2.js
*/
function printIPEyNIP(ipe,nip,minterm) {
  var output = `<div class="col" ><h2>Segunda parte parte</h2>`;

  output +=
  `     <table class="table">
          <thead>
            <tr>
              <th scope="col">IP</th>`;
  for (m of minterm)
    output += `<th scope="col">`+m+`</th>`

  output +=
            `</tr>
          </thead>
          <tbody>`;

  for (ip of ipe) {
    output +=`
              <tr>
                <th scope="row">`+ip.mp+`</th>`;
    for (m of minterm){
      output += ` <td>`;
      if (isMinTinIP(ip.mp,m))
        output += 'X'

      output += `</td>`;
    }
    output +=`</tr>`;
  }
  for (ip of nip) {
    output +=`
              <tr>
                <th scope="row">`+ip.mp+`</th>`;
    for (m of minterm){
      output += ` <td>`;
      if (isMinTinIP(ip.mp,m))
        output += 'X';
      output += `</td>`;
    }
    output +=`</tr>`;
  }

  output += `
          </tbody>
        </table>`;

  output += `</div>`;
  document.getElementById('solution2').innerHTML = output

}

function isMinTinIP(mp,m) {
  for (it of mp){
    if (it == m)
      return true
  }
  return false;
}


/*
	printer3.js
*/

function printSolution(solution,minterm,dontcare) {
  var terminos = minterm.concat(dontcare);
  var numt = Math.ceil(Math.log2(terminos[terminos.length-1]))
  var repsolution = []

  terminos.sort((a, b)=> a-b);

  var output = `<div class="col" ><h2>Solución</h2>`;

  output += `
    <table class="table">
    <thead>
      <tr>
        <th scope="col">IP</th>
        <th scope="col">Minimización</th>
        <th scope="col">Variables</th>
      </tr>
    </thead>
    <tbody>
  `;

  for (s of solution) {
    var bin = s.mp[0].toString(2).padStart(numt, '0')
    var pos_fp = changeFPtoPos(s.fp)
    var nbin = changeBinNumber(bin,pos_fp)
    var lrep = getLogicRep(nbin)
    repsolution.push(lrep)
    output +=
    `<tr>
        <th scope="row">`+s.mp+`</th>
        <td>`+nbin+`</td>
        <td>`+lrep+`</td>
      </tr>`;
  }

  output +=
  `  </tbody>
   </table>`;

  output += `</div>`;

  document.getElementById('solution3').innerHTML = output

  return repsolution;

}

function getLogicRep(nbin) {
  var variables = ["A","B","C","D","E","F","G","H","I","J","K","L"]

  nbin_str = nbin.split("")

  var rep =[]

  for (let i = 0; i< nbin_str.length; i++) {
    if(nbin_str[i] == '0')
      rep.push(variables[i]+"'")
    else if (nbin_str[i] == '1')
      rep.push(variables[i])
  }


  return rep.join("");
}

function printSolRep(repsolution) {
  var output = `<div class="col text-center solution-container">`;
  output += `<h3 class="function-label" >f =`;

  for (let i = 0; i< repsolution.length; i++) {
    output += repsolution[i]
    if (i < repsolution.length - 1 )
      output += "+";
  }

  output += ` </h3></div>`;
  document.getElementById('solution4').innerHTML = output
}



/*
	Termino.js
*/

class Termino {

  constructor() {
    this.mp = [];
    this.fp = [];
    this.used = false;
  }

  add_mp(item){
    this.mp.push(item);
  }
  add_fp(item){
    this.fp.push(item);
  }
}

/** metodo auxliliares para obtener las iteraciones*/
function contarUnos(numero) {
  var contador = 0;
  while (numero) {
    numero &= (numero-1);
    contador++;
  }
  return contador;
}

function esPotencia2(n) {
	return n && (n & (n - 1)) === 0;
}

function addTerm(t,item,pos){
  if(item[pos] == null){
    /*This array is were our terms with
    n numbers of one are saved*/
    item[pos] = [];
    item[pos].push(t)
  }else{
      item[pos].push(t)
  }
}

function fp_equals(fp1,fp2) {
  for(let i = 0 ; i < fp1.length; i++)
    if(fp1[i] != fp2[i])
      return false;
  return true;
}

function diffsPotencia2(mp1,mp2) {
  diff = []
  for (let i = 0; i < mp1.length; i++) {
    diff.push(mp2[i] - mp1[i])
    if (!esPotencia2(diff[i])) {
      return false;
    }
  }
  if(diff.every( (val, i, arr) => val === arr[0] ))
    return true;
  else
    return false;
}

/**
  Métodos auxiliares para Buscar los implicantes primos
*/

function isInIPE(ipe,t) {
  for (const tipe of ipe)
    if(tipe != null)
      if (JSON.stringify(tipe.mp) === JSON.stringify(t.mp))
        return true;
  return false;
}

function deleteEmptyTerms(ip_wdc) {
  empty = []
  for (var i = 0; i < ip_wdc.length; i++)
    if(ip_wdc[i].mp.length == 0)
      empty.push(i)
  for (var i = 0; i < empty.length; i++)
    ip_wdc.splice(empty[0],1);

}

