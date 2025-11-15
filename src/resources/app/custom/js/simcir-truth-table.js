/**
 * @file Gestor para obtener la Tabla de verdad y las ecuaciones Min & Max terminos.
 * @author Alexander Enrique Escobar  <alexander.enrique.escobar@gmail.com>
 * @version 1.2
 * @since 2024
 * @copyright Alexander Enrique Escobar 2024
 */

import * as classes from './class_table.js';
import * as display from './simcir-display.js';

document.getElementById("enviar").onclick =  // function(){ alert('blah'); };     //.attr("onclick", "alert('Hi!')");
function fx_crear()
{
	let col_i = parseInt(document.getElementById("icols").value, 10);
	let col_o = parseInt(document.getElementById("ocols").value , 10);
	
	let my_table = new classes.table(col_i, col_o);
	let z = my_table.table_data;
	let zz;
	
	console.log("in :" + col_i);
	console.log("out :" + col_o);
	console.log("matriz z, table_data");
	console.log(z);
	
	// Verficando datos guardados
	zz = JSON.parse(sessionStorage.getItem("matrix"));
	console.log("matriz zz getItem");
	console.log(zz);
	
	// let h;
	// 
	// zz.col_in = 20;
	// h = Object.assign(my_table.algo, zz);
	// console.log(h);

	display.draw_table(z);
}

//document.getElementById("b_minmax").onclick =
function fx_minmax()
{
	let col_i = parseInt(document.getElementById("icols").value, 10);
	let col_o = parseInt(document.getElementById("ocols").value , 10);
	let l_manager_data;
	let my_table = new classes.table(col_i, col_o);
	
	l_manager_data = JSON.parse(sessionStorage.getItem("matrix"));
	

	
	
	// 
	// zz.col_in = 20;
	l_manager_data = Object.assign(my_table, l_manager_data);
	console.log(l_manager_data);
	

}




