var currentViewFileBaseName;
w3.includeHTML();

function w3_open() {
    document.getElementById("mySidebar").style.display = "block";
  // alert(sha256("testing"));
}
function w3_close() {
    document.getElementById("mySidebar").style.display = "none";
}
document.getElementById('viewFilesModal').style.display='';


function socket_request(msg) {
document.getElementById("loader").style.display = "block";
  let socket = connect_socket();
  socket.onopen = function (event) {
      socket.send(msg + " " + chosenViewDate());

      var args = msg.split(' ');
      if (args[0] === "FILES") {
	  delete args[0];
	      currentDirectory = args.join(' ');
	      localStorage.setItem("currentDirectory", currentDirectory); 
	      history.pushState(null, null, '?section=' + getParameterByName("section") + '&date=' + getParameterByName("date") + '&directory=' + currentDirectory);
	      document.getElementById("loader3").style.display = "block";
	  }
	  if (args[0] === "DETAILS") {
	      delete args[0];
	      currentDirectory = args.join(' ');
	      document.getElementById("detailsOutput").innerHTML = "Please wait while the files are extracted...\n (this may take a while depending on the size of the archive)";
	  }
	  if (args[0] === "FILEVIEW") {
	      delete args[0];
	      currentViewFile = args.join(' ');
		document.getElementById("loader2").style.display = "block";
	      localStorage.setItem("currentViewFile", currentViewFile);
	      
	  }
      
  };
  socket.onmessage = function (event) {
    handleMessage(event)
  };
  console.log("Sent Message: " + msg);
}
var currentViewFile;
var currentDirectory;
function connect_socket() {
    var wsUri = "ws://127.0.0.1:43432";
    var _socket = new WebSocket(wsUri );
  lastSocket = _socket;
  
  return _socket;
}

  /*  var wsUri = "ws://127.0.0.1:43431";
    var socket = new WebSocket(wsUri); */
  
  function handleMessage(event) {
    var  rawData = event.data;
    var args = rawData.split(" ");
    var socket = lastSocket;
    if (args.length >= 1) {
      var cmd = args[0];
      
      
      if (cmd.indexOf("LOGIN") > -1) { 
	  
	var token = localStorage.getItem("token");
	if (token !== null) { 
	  console.log("sent token " + token);
	  socket.send("TOKEN " + token);
	} else {
	   var pw = prompt("Please Enter the Password"); 
	   socket.send("TOKEN " + pw);
	 // localStorage.setItem("token", hex_sha512(pw));
	}
	   
      }
      if (cmd === "OK") { 
          
          localStorage.setItem("token", args[1]);
      }
      if (cmd === "FAIL") { 
	  var pw = prompt("Please Enter the Password"); 
	  socket.send("PASSSWORD " + pw);
      }
      if (cmd === "BLOCKED") { 
	  alert("You have entered the wrong password and have triggered an alert to the system administrator. Thank you. We prosecute any and all unauthorized activity as per U.S. Code § 1030. You have been warned.");
      }
	 
      if (cmd === "END") { 
	  socket.close();
      }
      if (cmd === "DIRECTORIES") {
	//args.pop()
	delete args[0];
	console.log(args + " " + args.join(' '));
	directoriesObject = JSON.parse(args.join(' '));
	w3.displayObject("id01", directoriesObject);
      }
      if (cmd === "FILES") {
	delete args[0];
	filesObject = JSON.parse(args.join(' '));
	document.getElementById('viewFilesModal').style.display='block';
	w3.displayObject("viewFilesTable", filesObject);
	document.getElementById("loader3").style.display = "none";
	
      }
      if (cmd === "LIMITS") {
        delete args[0];
        limitsObject = JSON.parse(args.join(' ')).limits;
        w3.displayObject("limitsTable", limitsObject);
      }
      if (cmd === "FILEVIEW") {
	delete args[0];
	var obj = args.join(' ');
	document.getElementById("section_view_files").style.display = "none";
	document.getElementById("section_view_url").style.display = "block";
	document.getElementById("view_url").innerHTML = "<a href=" + obj + ">" + currentViewFile + "</a>"
	document.getElementById("loader2").style.display = "none";
    

      
      }
      
      if (cmd === "DETAILS") {
	document.getElementById("detailsModal").style.display = "block";
	delete args[0];
	document.getElementById("detailsOutput").innerHTML = args.join(' ');
      }
    }
    
    document.getElementById("loader").style.display = "none";
    console.log("Server said: " + event.data);
    localStorage.setItem("lastState", encodeURIComponent(document.getElementsByTagName("body")[0].outerHTML));
    
  }
  var directoriesObject;
  var filesObject;
  var limitsObject;

  function return_to_files_list() {
  document.getElementById("section_view_files").style.display = "block";
	document.getElementById("section_view_url").style.display = "none";
  }
  
  var lastSocket;
window.addEventListener("load", function() {
  var stored_state = localStorage.getItem("lastState");
  if (typeof(stored_state) === 'string') {
      //document.getElementsByTagName("body")[0].outerHTML = decodeURIComponent(stored_state);
  }
  currentViewFile = localStorage.getItem("currentViewFile");
  currentDirectory = localStorage.getItem("currentDirectory");
  if (typeof(localStorage.getItem("currentDate")) === 'string') {
      document.getElementById("currentDate").value = localStorage.getItem("currentDate");
  } else {
      document.getElementById("currentDate").valueAsDate = new Date;
    }
    
    var loadSection = getParameterByName("section");
    var loadDate = getParameterByName("date");
    var loadDirectory = getParameterByName("directory");
    if (loadDate !== null) { document.getElementById("currentDate").value = loadDate; }
    if (loadSection !== null) { viewPage(loadSection); }
    if (loadDirectory !== null) { socket_request('FILES ' + loadDirectory); }
  
}, false);


function viewPage(pageURL) {

  var sel = "#" + pageURL;
  var mw = document.querySelector(sel);
  w3.show(sel);
  var new_sel = ".w3-section:not(" + sel + ")" 
  var a = document.querySelectorAll(new_sel);
  for (var i=0; i<a.length; i++) {
      var elem = a[i];
      if (elem.attributes.id !== pageURL) {
	a[i].style.display = 'none';	
      } else {
	a[i].style.display = 'block';	
      }
  }
  socket_request("REQUEST " + pageURL + " " + chosenViewDate());
  
  w3_close();
  
  history.pushState(null, null, '?section=' + pageURL + '&date=' + chosenViewDate());
  
  


}
function handle_date_changed() {
document.getElementById("directories_update_note").style.display = "block";
document.getElementById("directories_main").style.display = "none";
localStorage.setItem("currentDate", chosenViewDate());
}
function hide_date_update_note() {
document.getElementById("directories_update_note").style.display = "none";
document.getElementById("directories_main").style.display = "block";
}

function chosenViewDate() {
  return document.getElementById('currentDate').value;
}
function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
	results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
