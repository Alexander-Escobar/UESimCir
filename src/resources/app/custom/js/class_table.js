/**
 * @file Gestor para obtener las Funciones Booleanas de Min & Max terminos.
 * @author Alexander Enrique Escobar  <alexander.enrique.escobar@gmail.com>
 * @version 1.2
 * @since 2024
 * @copyright Alexander Enrique Escobar 2024
 */

export class data
{
	col_in = 1;
	col_out = 1;
	cols = this.col_in + this.col_out;
	rows = Math.pow(2, this.col_in);
	matriz = new Array();
	sop = new Array();
	pos = '';

	constructor(a_in, a_out)
	{
		this.col_in = a_in;
		this.col_out = a_out;
		this.cols = a_in + a_out;
		this.rows = Math.pow(2, a_in);
		this.row_init(a_in, a_out);
	}
	
	// var_out(a_id_row, a_id_control, a_value) // no se esta ocupando
	// {
	// 	this.matriz[a_id_row][a_id_control] = a_value.toString();
	// }
	
	row_init(a_col_in, a_col_out)
	{
		let l_filas = this.rows;
		let l_cadena_DecToBin = '';
		let l_id_control;
		let l_rows_array;
		let l_obj;
		let l_obj_acum;
		
		// Recorriendo las filas
		for (let i=0; i<l_filas; i++)
		{
			l_cadena_DecToBin = (i).toString(2).padStart(a_col_in, '0');
			l_rows_array = new Array(); // Un array por fila
			l_obj_acum = {["m"]: l_cadena_DecToBin,};	// Identificador de fila
			
			// Recorriendo las variables de Salida
			for(let j=0; j<a_col_out; j++)
			{
				l_id_control = String.fromCharCode(91 - a_col_out + j) + i ;
				l_obj = {[l_id_control]: "0",};	// Un objeto por Variable de Salida y Fila

				l_obj_acum = { ...l_obj_acum, ...l_obj};
			}
			
			// this.matriz.push(l_rows_array);
			// l_obj_acum = this.row_minmaxterm(l_obj_acum); // Adicionando las Ecuaciones Min & Max Terminos
			this.matriz.push(l_obj_acum);
		}
		
		this.set_minmax();
	}
	
	set_minmax()
	{
		let l_filas = this.rows;
		let l_sop = new Map();
		let l_pos = new Map();
		let l_cadena_DecToBin = '';
		let l_col_out = this.col_out;
		let l_id_control = '';
		let l_id = '';
		let l_sop_sentence = "";
		let l_pos_sentence = "";
		let l_assess = '';
		let l_temp_sop;
		let l_temp_pos;
		let l_obj_sop;
		let l_obj_pos;

		this.sop = new Array();
		this.pos = new Array();
		
		// Recorriendo las variables de Salida
		for(let j=0; j<l_col_out; j++)
		{
			l_id = String.fromCharCode(91 - l_col_out + j);
			
			// Recorriendo las filas
			for (let l_IdRow=0; l_IdRow<this.matriz.length; l_IdRow++)
			{
				l_cadena_DecToBin = this.matriz[l_IdRow].m;
				l_id_control = String.fromCharCode(91 - l_col_out + j) + l_IdRow ;
				l_assess = this.matriz[l_IdRow][l_id_control];
				l_sop_sentence = "";
				l_pos_sentence = "";
				
				console.log("Variable:" + l_id_control + " valor:" +l_assess);
				
				// Evaluando SOP
				if (l_assess == 1 || l_assess == "X")
				{ 
					console.log("l_cadena_DecToBin:"+ l_cadena_DecToBin);
					
					for (let l_letterIndex=0; l_letterIndex<l_cadena_DecToBin.length; l_letterIndex++) 
					{
						if (l_cadena_DecToBin[l_letterIndex] == 1)
						{
							l_sop_sentence += String.fromCharCode(65 + l_letterIndex);
						}
						else
						{
							l_sop_sentence += String.fromCharCode(65 + l_letterIndex) + "'";
						}
						console.log("l_letterIndex:" + l_letterIndex + " Sentence SOP:" + l_sop_sentence);
					}
				}
				else
				{
					l_sop_sentence += "";
				}
				
				// Evaluando POS
				if (l_assess == 0 || l_assess == "X")
				{ 
					console.log("l_cadena_DecToBin:"+ l_cadena_DecToBin);
					
					for (let l_letterIndex=0; l_letterIndex<l_cadena_DecToBin.length; l_letterIndex++) 
					{
						if (l_cadena_DecToBin[l_letterIndex] == 0)
						{
							l_pos_sentence += String.fromCharCode(65 + l_letterIndex) + "+";
						}
						else
						{
							l_pos_sentence += String.fromCharCode(65 + l_letterIndex) + "'+";
						}
						console.log("l_letterIndex:" + l_letterIndex + " Sentence POS:" + l_pos_sentence);
					}
					
					if (l_pos_sentence.length > 0) { l_pos_sentence = l_pos_sentence.slice(0, l_pos_sentence.length - 1);}
				}
				else
				{
					l_pos_sentence += "";
				}
				
				if (l_sop.has(l_id))
				{ 
					let l_temp;
					
					l_temp = l_sop.get(l_id);
					l_temp.push(l_sop_sentence);
					l_sop.set(l_id, l_temp);
				}
				else
				{ 
					if (l_sop_sentence.length > 0)
					{ l_sop.set(l_id, new Array(l_sop_sentence)); }
				}
				
				if (l_pos.has(l_id))
				{ 
					let l_temp;
					
					l_temp = l_pos.get(l_id);
					l_temp.push(l_pos_sentence);
					l_pos.set(l_id, l_temp);
				}
				else
				{ 
					if (l_pos_sentence.length > 0)
					{ l_pos.set(l_id, new Array(l_pos_sentence)); }
				}
				
				// console.log("l_sop");
				// console.log(JSON.stringify(Object.fromEntries(l_sop)));
				// 
				// console.log("l_pos");
				// console.log(JSON.stringify(Object.fromEntries(l_pos)));
			}
			
			if (l_sop.size != 0)
			{	
				l_temp_sop = l_sop.get(l_id).join(" + ");
			
				l_obj_sop = {[l_id]: l_temp_sop,};
				this.sop.push(l_obj_sop);
			}

			if (l_pos.size != 0)
			{	
				l_temp_pos = "(" + l_pos.get(l_id).join(") (") + ")";
			
				l_obj_pos = {[l_id]: l_temp_pos,};
				this.pos.push(l_obj_pos);
			}
			
		}

	}
	
	// row_minmaxterm(a_obj_row)
	// {
	// 	console.log("a_obj_row");
	// 	console.log(a_obj_row);
	// 	
	// 	let l_sop_sentence = row_sop(a_obj_row.m, 'F');
	// 	
	// 	let l_obj = {["SOP"]: l_sop_sentence,};
	// 	
	// 	return { ...a_obj_row, ...l_obj};
	// }

	// BAJO REVISION
	//row_sop(a_string_DecToBin, a_letter)
	//{
	//	let l_sop = "";
	//
	//	for(let i=0; i<a_string_DecToBin.length; i++)
	//	{
	//		if (a_string_DecToBin[i] == 1 || a_string_DecToBin[i] == "X")
	//		{
	//			l_sop += String.fromCharCode(65 + i);
	//		}
	//		else
	//		{
	//			l_sop += String.fromCharCode(65 + i) + "'";
	//		}
	//	}
	//
	//	return l_sop;
	//}
	
	//BAJO REVISION
	//get_eval_sop(a_string, a_letter)
	//{
	//var l_sop = "";
	//
	//for(z=0; z<a_string.length; z++)
	//{
	//	if (a_string[z] == 1 || a_string[z] == "X")
	//	{
	//		l_sop += String.fromCharCode(65 + z);
	//	}
	//	else
	//	{
	//		l_sop += String.fromCharCode(65 + z) + "'";
	//	}
	//}
	//
	//return l_sop;
	//} //get_eval_sop
	
	
	
	
	
}

export class row
{
	#string_DecToBin;
	#col_in = 0;
	#col_out = new Map();
	#row;
	
	constructor(var_row, var_in, var_out)
	{
		this.#string_DecToBin = var_row.toString(2).padStart(var_in, '0');
		this.#col_in = row_init(this.#string_DecToBin);
		// this.#col_out = new Array(var_out).fill(0);
		this.#col_out = row_init_o(var_row, var_out);
		this.#row = var_row;
	}

	get idrow(){ return this.#row; }
	get row_binary() { return this.#string_DecToBin; }
	get col_sout() { return this.#col_out;}
	
	get sop()
	{
		let l_sop = "";
		let l_string = this.#string_DecToBin;
	
		for(let z=0; z<l_string.length; z++)
		{
			if (l_string[z] == 1 || l_string[z] == "X")
			{
				l_sop += String.fromCharCode(65 + z);
			}
			else
			{
				l_sop += String.fromCharCode(65 + z) + "'";
			}
		}

		return l_sop;
	}
	
	get pos()
	{
		let l_pos = "";
		let l_string = this.#string_DecToBin;
	
		for(let z=0; z<l_string.length; z++)
		{
			if (l_string[z] == 0 || l_string[z] == "X")
			{
				l_pos += String.fromCharCode(65 + z) + " + ";
			}
			else
			{
				l_pos += String.fromCharCode(65 + z) + "' + ";
			}
		}
		l_pos = l_pos.slice(0, l_pos.length - 3);

		return l_pos;
	}
}


function row_init_o(a_row, a_column_out)
{
	let myMap = new Map();
	let x = '';
	
	for(let j=0;j<a_column_out;j++)
	{
		x = String.fromCharCode(91 - a_column_out + j) + a_row ;
		myMap.set(x, 0);
	}

	return myMap;
}

function row_init(a_array_column)
{
	let l_array_column = new Array(a_array_column.length);
	
	for (let j=0; j<a_array_column.length; j++)
	{
		l_array_column[j] = a_array_column[j];
	}
	return l_array_column;
}

function set_matrix(a_in, a_out)
{
	let l_rows = Math.pow(2, a_in);
	let l_matrix = new Array(l_rows);
	
	for (let i=0; i<l_rows; i++)
	{
		l_matrix[i] = new row(i, a_in, a_out);
	}

	return l_matrix;
}

export class table
{
	#col_in = 0;
	#col_out = 0;
	#col = 0;
	#matrix;
	
	constructor(var_input, var_output)
	{
		this.#col_in = var_input;
		this.#col_out = var_output;
		this.#col = var_input + var_output;
		this.#matrix = set_matrix(this.#col_in, this.#col_out);
	}
	
	static class(obj) { return new table(obj.col_in, obj.col_out); }
	
	get col_in(){ return this.#col_in; }
	get col_out(){ return this.#col_out; }
	get col(){ return this.#col; }
	get sop(){ return 'z'; }
	get pos(){ return 'z'; }
	get qm(){ return 'qm'; }
	get matrix() { return this.#matrix; }
	get map_in() 
	{
		
	}
	
	get map_out()
	{
		let l_rows = Math.pow(2, this.#col_in);
		let l_matrix = new Array(l_rows);
		
		for (let i=0; i<l_rows; i++)
		{
			l_matrix[i] = this.#matrix[i].col_sout;
		}

		return l_matrix;
	}
	
	get table_data()
	{
		return new data(this.#col_in, this.#col_out);
	}
}

