const {app, BrowserWindow, Menu, nativeImage} = require('electron')
const path = require('path')
const url = require('url')
const iconPath = path.join(__dirname, './custom/img/favicon.ico');

// Mantenga una referencia global del objeto de ventana, si no lo hace, 
// la ventana se cerrará automáticamente cuando el objeto JavaScript sea recolectado.
let win

let template = [{
  label: 'Aplicacion',
  submenu: [{
    label: 'Salir',
    accelerator: 'CmdOrCtrl+W',
    role: 'close'
  }]
}, {
  label: 'Vista',
  submenu: [{
    label: 'Reload',
    accelerator: 'CmdOrCtrl+R',
    click: function (item, focusedWindow) {
      if (focusedWindow) {
        // on reload, start fresh and close any old
        // open secondary windows
        if (focusedWindow.id === 1) {
          BrowserWindow.getAllWindows().forEach(function (win) {
            if (win.id > 1) {
              win.close()
            }
          })
        }
        focusedWindow.reload()
      }
    }
  }, {
    label: 'Pantalla Completa',
    accelerator: (function () {
      if (process.platform === 'darwin') {
        return 'Ctrl+Command+F'
      } else {
        return 'F11'
      }
    })(),
    click: function (item, focusedWindow) {
      if (focusedWindow) {
        focusedWindow.setFullScreen(!focusedWindow.isFullScreen())
      }
    }
  }, {
    type: 'separator'
  }]
}, {
  label: 'Ventana',
  role: 'window',
  submenu: [{
    label: 'Minimizar',
    accelerator: 'CmdOrCtrl+M',
    role: 'minimize'
  }, {
    label: 'Cerrar',
    accelerator: 'CmdOrCtrl+W',
    role: 'close'
  }]
}
// Bloque 'Toogle Developer Tools'
,
{
  label: 'Debug',
  accelerator: (function () {
      if (process.platform === 'darwin') {
        return 'Alt+Command+I'
      } else {
        return 'Ctrl+Shift+I'
      }
    })(),
	click: function (item, focusedWindow) {
      if (focusedWindow) {
        focusedWindow.toggleDevTools()
      }
    }
}
// Ayuda
,{
  label: 'Ayuda',
  submenu: [
    {
      label: 'Manual de Usuario',
	  accelerator: 'F1',
      click: () => createHelpWindow()
    },
    {
      label: 'Acerca de UESimCir',
      click: () => {
        const about = new BrowserWindow({
          width: 400,
          height: 300,
          title: 'Acerca de UESimCir',
          autoHideMenuBar: true,
          resizable: false
        });
        about.loadURL('data:text/html;charset=utf-8,' +
          encodeURIComponent(`
            <html>
              <head><title>Acerca de UESimCir</title></head>
              <body style="font-family:sans-serif;padding:20px;">
                <h2>UESimCir</h2>
                <p>UES Simulador de Circuitos Digitales<br>
                Universidad de El Salvador</p>
                <p>Versión 1.0</p>
				Términos y condiciones
				This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License.

				This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details. You should have received a copy of the GNU General Public License along with this program. If not, see http://www.gnu.org/licenses.
              </body>
            </html>`));
      }
    }
  ]
}
// Ayuda - fin

]

function createWindow () {
	const menu = Menu.buildFromTemplate(template)
	
	Menu.setApplicationMenu(menu)
	
	// Crea una Ventana del Browser.
	 win = new BrowserWindow({
		 width: 1024, 
		 height: 720, 
		 frame: true, 
		 webPreferences: {nodeIntegration: false},
		 icon: iconPath
		 })
	 
 
	// Carga la pagina index.html de nuestra aplicacion.
	win.loadURL(url.format({
	pathname: path.join(__dirname, 'index.html'),
	protocol: 'file:',
	slashes: true
	}))

	// Abre el DevTools (Herramientas de Desarrollo).
	// win.webContents.openDevTools()
 
	// Emite cuando la ventana es cerrada.
	win.on('closed', () => {
		// Diferencia el objeto de la ventana, generalmente se almacenaría las ventanas
		// en una matriz si su aplicación es compatible con varias ventanas o multi ventana,
		// este es el momento cuando debe eliminar el elemento correspondiente.
		win = null
	})
}






// === Ventana de Ayuda ===
let helpWindow = null;

function createHelpWindow() {
  if (helpWindow) {
    helpWindow.focus();
    return;
  }

  helpWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    title: 'Manual de Usuario - UESimCir',
    autoHideMenuBar: true,
    resizable: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  });

  // Cargar el manual HTML
  helpWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'custom', 'help', 'manual_uesimcir.html'),
    protocol: 'file:',
    slashes: true
  }));

  helpWindow.on('closed', () => {
    helpWindow = null;
  });
}
// === Ventana de Ayuda === FIN













app.allowRendererProcessReuse = true

// Este método será llamado cuando Electron haya terminado
// inicialización y está listo para crear ventanas de navegador.
// Algunas API sólo se pueden utilizar después de que se produzca este evento.
app.on('ready', createWindow)

// Salir cuando todas las ventanas estan cerradas.
app.on('window-all-closed', () => {
	// En los Sistemas Operativos Mac es comun para sus aplicaciones y barras de menus
	// que este permanecer activo hasta que el usuario cierra explicita mente 
	// usando la combinación Cmd + Q
	if (process.platform !== 'darwin') {
		app.quit()
	}
})
 
app.on('activate', () => {
	// En MacOS es común volver a crear una ventana en la aplicación cuando
	// se hace clic en el icono y no hay otras ventanas abiertas.
	if (win === null) {
		createWindow()
	}
})

// En este archivo puede incluir el resto del proceso principal específico de su aplicación
// el código. También puede ponerlos en archivos separados y requerirlos aquí.







