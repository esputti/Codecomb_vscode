// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path  from 'path';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "hello-world1" is now active!');

	let filepath = "";
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	// let disposable = vscode.commands.registerCommand('extension.helloWorld', () => {
	// 	// The code you place here will be executed every time your command is executed

	// 	// Display a message box to the user
	// 	vscode.window.showInformationMessage('Hello VS Code!');
	// });

	context.subscriptions.push(
		vscode.commands.registerCommand('extension.helloWorld', () => {
		  // Create and show a new webview
		  const panel = vscode.window.createWebviewPanel(
			'Query', // Identifies the type of the webview. Used internally
			'Query', // Title of the panel displayed to the user
			vscode.ViewColumn.One, // Editor column to show the new webview panel in.
			{
				// Enable scripts in the webview
				enableScripts: true,
				retainContextWhenHidden: true
			} // Webview options. More on these later.
		  );

		  // And set its HTML content
		  var onDiskPath = vscode.Uri.file(
			path.join(context.extensionPath, 'codecomb.jpg')
		  );
		  const imgSrc = onDiskPath.with({ scheme: 'vscode-resource' });
		  panel.webview.html = getWebviewContent(imgSrc, "Choose Source Directory");

		  const openOptions: vscode.OpenDialogOptions = {
			canSelectMany: false,
			openLabel: 'Open',
			filters: {
				'Text files': ['txt'],
				'All files': ['*']
			}
		  };

		  // Handle messages from the webview
		  panel.webview.onDidReceiveMessage(
			message => {
				
			  switch (message.command) {
				case 'open':
				  //vscode.window.showErrorMessage(message.text);
				  var openPath = vscode.Uri.file(message.path);
				  vscode.workspace.openTextDocument(openPath).then(doc => {
			  	    vscode.window.showTextDocument(doc);
				  });
				  break;
				
				case 'choose':  
					vscode.window.showOpenDialog(openOptions).then(fileUri => {
						if (fileUri && fileUri[0]) {
							console.log('Selected file: ' + fileUri[0].fsPath);
							filepath = "Root Directory: " + fileUri[0].fsPath;
							const lastIndex = filepath.lastIndexOf("\\");
							var path = filepath.slice(0, lastIndex);
							panel.webview.html = getWebviewContent(imgSrc, path);
						}
					});
					break;
				case 'run':
					const spawn = require('child_process').spawn;
					console.log("calling python script");
					var process = spawn('python', ["C:\\Users\\esputti\\source\\Python\\codecomb\\tyscript.py"]);
					
					process.stdout.on('data', (data: string) => { console.log(`data: ${data}`);});
					process.stderr.on('data', (data: string) => { console.log(`error: ${data}`);});
					break;
				  
			  }
			},
			undefined,
			context.subscriptions
		  );

		})
	  );

	//context.subscriptions.push(disposable);

	
}

function getWebviewContent(imgSrc: vscode.Uri, filepath: string) {
	return `<!DOCTYPE html>
  <html lang="en">
  <head>
	  <meta charset="UTF-8">
	  <meta name="viewport" content="width=device-width, initial-scale=1.0">
	  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/css/bootstrap.min.css">
	  <!--<link rel="stylesheet" type="text/css" href="theme.css">-->
	  <title>Coding</title>
  </head>
  <body>
	<div>
	  <img src="${imgSrc}" width="500" height="300"/>
	</div>

	<div>
	  <button id="chooseButton" type="button">${filepath}</button>
	</div>

	<div>
	  <button id="runButton" type="button">Execute Python Script</button>
	</div>
	  <input type="text" id="myInput" placeholder="Search..." width="100">


	  <ul id="myUL" style="list-style-type:none" >

	  </ul>


	  <!--<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js" type="text/javascript"></script>-->
	  <script>

	  		const vscode = acquireVsCodeApi();
	  		function onEnterPressed(){
				// Declare variables
				var input, filter, ul, li, a, i, txtValue;
				//const vscode = acquireVsCodeApi();
				input = document.getElementById('myInput');
				filter = input.value;
				
				console.log("Before making http call");
				const userAction = async () => {
					//const vscode = acquireVsCodeApi();
					const response = await fetch('http://127.0.0.1:5000?searchString='+filter);
					const myJson = await response.json(); //extract JSON from the http response
					// do something with myJson
					console.log(myJson);

					ul = document.getElementById("myUL");
					while( ul.firstChild ){
						ul.removeChild( ul.firstChild );
					}
					for (i = 0; i < myJson.length; i++){
						console.log(myJson[i]);
						var li = document.createElement("li");
						  
						  var a = document.createElement("a");
						  a.setAttribute("href", "#");
						  //a.appendChild(document.createTextNode("C:/Users/esputti/source/React/codecomb/src/ResultItem.js"));
						  a.appendChild(document.createTextNode(myJson[i]["path"]));
						  li.appendChild(a);
  						ul.appendChild(li);
					}
					registerClickEvents();
					console.log("created 6 listitems");
				}

				userAction();
			}


			document.getElementById('myInput').onkeydown = function(event) {
				console.log("in Input");
				if (event.keyCode == 13) {
					onEnterPressed();
				}
			}

			document.getElementById('myInput').style.margin = "50px 0px 20px 0px";
			document.getElementById('myInput').style.padding = "5px 5px 5px 5px";
			document.getElementById('myInput').style.width = "500px";

			document.getElementById('chooseButton').onclick = function() {
				console.log("On click of choose Button");
				vscode.postMessage({
					command: 'choose'
				});
			}

			document.getElementById('chooseButton').style.margin = "25px 0px 10px 0px";
			document.getElementById('chooseButton').style.padding = "5px 5px 5px 5px";

			document.getElementById('runButton').onclick = function() {
				console.log("On click of run Button");
				vscode.postMessage({
					command: 'run'
				});
			}

			document.getElementById('runButton').style.margin = "25px 0px 10px 0px";
			document.getElementById('runButton').style.padding = "5px 5px 5px 5px";
			

			function registerClickEvents() {
				var elements = document.getElementsByTagName('a');
				for(var i = 0, len = elements.length; i < len; i++) {
					console.log('registering on click');
					elements[i].onclick = function () {
						console.log("On click of listitem");
						console.log(this.textContent);
						vscode.postMessage({
							command: 'open',
							path: this.textContent
						});
					}
				}

				var elements = document.getElementsByTagName('li');
				for(var i = 0, len = elements.length; i < len; i++) {
					elements[i].style.padding = "5px 5px 5px 5px";
					elements[i].style.margin = "5px 5px 5px 5px";
				}
			}

        
    </script>
  </body>
  </html>`;
  }

// this method is called when your extension is deactivated
export function deactivate() {}
