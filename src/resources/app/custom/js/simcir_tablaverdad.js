/**
 * @file Gestor para obtener las Funciones Booleanas de Min & Max terminos.
 * @author Alexander Enrique Escobar  <alexander.enrique.escobar@gmail.com>
 * @version 1.2
 * @since 2024
 * @copyright Alexander Enrique Escobar 2024
 */


function fx_crear()
{
	var col_i = parseInt(document.getElementById("icols").value, 10);
	var col_o = parseInt(document.getElementById("ocols").value , 10);
    var col =  col_i  + col_o;
    var filas = Math.pow(2, document.getElementById("icols").value);
    var tabla="<table id=\"tablaVerdad\" class=\"table table-bordered text-center table-sm compact-table\" > ";
	var cadena_DecToBin = '';
	var id_control = '';
	var aux_termino = '';
	
	sessionStorage.clear();
	document.getElementById("seleccion_var").innerHTML = '';
	

//      <tbody>
//        <tr>
//          <td>0-00</td>
//          <td>0</td>
//          <td>0</td>
//          <td>
//            <select class="form-control form-control-sm">
//              <option>0</option>
//              <option>1</option>
//              <option>X</option>
//            </select>
//          </td>
//          <td >
//            <select class="form-control form-control-sm">
//              <option>0</option>
//              <option>1</option>
//              <option>X</option>
//            </select>
//          </td>
//        </tr>
//        <tr>
//          <td>1-01</td>
//          <td>0</td>
//          <td>1</td>
//          <td>
//            <select class="form-control form-control-sm">
//              <option>0</option>
//              <option>1</option>
//              <option>X</option>
//            </select>
//          </td>
//          <td >
//            <select class="form-control form-control-sm">
//              <option>0</option>
//              <option>1</option>
//              <option>X</option>
//            </select>
//          </td>
//        </tr>
//        <tr>
//          <td>2-10</td>
//          <td>1</td>
//          <td>0</td>
//          <td>
//            <select class="form-control form-control-sm">
//              <option>0</option>
//              <option>1</option>
//              <option>X</option>
//            </select>
//          </td>
//          <td>
//            <select class="form-control form-control-sm">
//              <option>0</option>
//              <option>1</option>
//              <option>X</option>
//            </select>
//          </td>
//        </tr>
//        <tr>
//          <td>3-11</td>
//          <td>1</td>
//          <td>1</td>
//          <td>
//            <select class="form-control form-control-sm">
//              <option>0</option>
//              <option>1</option>
//              <option>X</option>
//            </select>
//          </td>
//          <td >
//            <select class="form-control form-control-sm">
//              <option>0</option>
//              <option>1</option>
//              <option>X</option>
//            </select>
//          </td>
//        </tr>
//      </tbody>
//    </table>
	
	


	
	// Encabezado   
	// Formato 
	// <thead class="thead-light">
	// 		<tr>
	//      	<th>m</th>
	//          <th>A</th>
	//          <th>B</th>
	//          <th class="col-Z">Z</th>
	// 		  	<th class="col-Z col-out">Y</th>
	//       </tr>
	// </thead>
    tabla+="<thead class=\"thead-light\"><tr><th>m</th>";
    for(j=0;j<col;j++)
	{ 
		if (j< col_i)
		// Hasta las Variables de Entrada
		{ tabla+="<th>" + String.fromCharCode(65 + j) + "</th>"; }
		else
		{ 
			// Variables de Salida
			var option = document.createElement('option');
			
			aux_termino = String.fromCharCode(91 - col_o - col_i + j);
			tabla+="<th class=\"col-Z\">" + aux_termino + "</th>";
			
			option.value = aux_termino;
			option.textContent = aux_termino;
			document.getElementById("seleccion_var").appendChild(option);
		};
    }
    tabla+="</tr></thead>";
	
    for(i=0;i<filas;i++){
        tabla+="<tr>";
		cadena_DecToBin = (i).toString(2).padStart(col_i, '0')

        tabla+="<td>"+(i)+ '-'+ cadena_DecToBin + "</td>";
		
        for(j=0;j<col;j++)
		{
			if (j < col_i)
			{ //tabla+="<td>"+"<input type=\"text\" size=\"1\" value=\""+ cadena_DecToBin[j] +"\" disabled >"+ "</td>"; 
				tabla+="<td>"+ cadena_DecToBin[j] +"</td>"; 
			}
			else
			{

				id_control = String.fromCharCode(91 - col_o - col_i + j) + i ;
				tabla+="<td>"+
					"<select id=" + id_control + " name=" + id_control + " class=\"form-control form-control-sm\" onchange='myOnChange(this.id)' >" +
					"<option value='0' selected>0</option>" +
					"<option value='1' >1</option>" +
					"<option value='X'>X</option>" +
					"</select>" +
					"</td>";
				sessionStorage.setItem(id_control, JSON.stringify(["0", cadena_DecToBin]));
			};
        }
        tabla+="</tr>";
    }
    tabla+="</table>";
    document.getElementById("resultado").innerHTML=tabla;
}


function myOnChange(a_myselect) 
{
  var x = document.getElementById(a_myselect).id;
  var y = document.getElementById(a_myselect).value;
  var z = JSON.parse(sessionStorage.getItem(x));
  document.getElementById("variables").innerHTML = "Usted Seleccióno: " + x + " , con el Valor: " + y;
  z[0] = y;
  sessionStorage.setItem(x, JSON.stringify(z));
  console.log("x:" + x);
}