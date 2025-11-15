/**
 * @file Gestor para obtener las Funciones Booleanas de Min & Max terminos.
 * @author Alexander Enrique Escobar  <alexander.enrique.escobar@gmail.com>
 * @version 1.2
 * @since 2024
 * @copyright Alexander Enrique Escobar 2024
 */

export function draw_table(a_object)
{
	let tabla="<table border=\"0\" > ";
	let col_i = a_object.col_in;
	let col_o = a_object.col_out;
	let col =  a_object.cols;
	let filas = a_object.rows;
	let cadena_DecToBin = '';
	let id_control = '';
	
	// Encabezado
	tabla+="<tr><td>m</td>";
    for(let j=0;j<col;j++)
	{ 
		if (j< col_i)
		{ tabla+="<td>" + String.fromCharCode(65 + j) + "</td>"; }
		else
		{ 
			tabla+="<td>" + String.fromCharCode(91 - col_o - col_i + j) + "</td>";
			// list_variables = String.fromCharCode(91 - col_o - col_i + j);
			// option.text = list_variables;
			// document.getElementById("seleccion_var").add(option);
		};
    }
    tabla+="</tr>";
	
    for(let i=0;i<filas;i++){
        tabla+="<tr>";
		cadena_DecToBin = (i).toString(2).padStart(col_i, '0')

        tabla+="<td>"+(i)+ '-'+ cadena_DecToBin + "</td>";
		
        for(let j=0;j<col;j++)
		{
			if (j < col_i)
			{ tabla+="<td>"+"<input type=\"text\" size=\"1\" value=\""+ cadena_DecToBin[j] +"\" disabled >"+ "</td>"; }
			else
			{

				id_control = String.fromCharCode(91 - col_o - col_i + j) + i ;
				tabla+="<td>"+ //"<input type=\"text\" size=\"1\" value=\"0\" >"+ 
			
				"<select id=" + id_control + " name=" + id_control + " onchange='myOnChange(this.id)' >" +
				"<option value='0' selected>0</option>" +
				"<option value='1' >1</option>" +
				"<option value='X'>X</option>" +
				"</select>" +
				"</td>";
			};
        }
        tabla+="</tr>";
    }
    tabla+="</table>";
	
	document.getElementById("resultado").innerHTML=tabla;
	
	// console.log(a_object);
	// console.log(a_object.matrix[2]);
}

