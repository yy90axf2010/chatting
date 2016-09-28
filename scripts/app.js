
  var config = {
    apiKey: "AIzaSyCmEyiQQFZMu8Up8h554-XIj0sm05c_6HI",
    authDomain: "chatting-a08f6.firebaseapp.com",
    databaseURL: "https://chatting-a08f6.firebaseio.com",
    storageBucket: "chatting-a08f6.appspot.com",
  };
  firebase.initializeApp(config);


  firebase.auth().onAuthStateChanged(function (user){
	if (user) {
		if (user.displayName == null) {
				var user = firebase.auth().currentUser;
			user.updateProfile({
			  displayName: username.value,
			}).then(function() {
			  //put user in the user pool
			  var data = {
			  		username: username.value,
			  		uid: user.uid,
			  		email: email.value
			  	};
			  	var userREF = firebase.database().ref().child('UserPool');
			  	var newPostREF = userREF.push();
			  	newPostREF.update(data);

			}, function(error) {
			  // An error happened.
			});
		}
		document.getElementById('signup').style.visibility = "hidden";
		document.getElementById('login').style.visibility = "hidden";
		document.getElementById('email').style.visibility = "hidden";
		document.getElementById('pass').style.visibility = "hidden";
		document.getElementById('username').style.visibility = "hidden";
		document.getElementById('logout').style.visibility = "visible";
	}else{
		document.getElementById('signup').style.visibility = "visible";
		document.getElementById('login').style.visibility = "visible";
		document.getElementById('email').style.visibility = "visible";
		document.getElementById('pass').style.visibility = "visible";
		document.getElementById('logout').style.visibility = "hidden";
		console.log('not Logged in');
	}
});

  var email = document.getElementById('email');
  var pass = document.getElementById('pass');
  var message = document.getElementById('message');
  var username = document.getElementById('username');

  var database = firebase.database();

  // create account
  document.getElementById('signup').addEventListener('click', function(){
  		firebase.auth().createUserWithEmailAndPassword(email.value,pass.value).catch(function(error){
  			alert(error.message);
  		});
  });

  //log into the system
  document.getElementById('login').addEventListener('click', function(){
  		firebase.auth().signInWithEmailAndPassword(email.value,pass.value).catch(function(error){
  			alert(error.message);
  		});
  });

  //log out 
  document.getElementById('logout').addEventListener('click',function(){
  		firebase.auth().signOut();
  });

  //send message
  document.getElementById('send').addEventListener('click',function(){
  		
  		console.log(firebase.auth().currentUser);
  		if (firebase.auth().currentUser.uid != null) {
  			postmessage(firebase.auth().currentUser.uid,firebase.auth().currentUser.displayName,message.value);
  		}else{
  			alert("Please sign in first!");
  		};
  		
  });

  //push message
  function postmessage(uid, username, message){
  	var data = {
  		username: username,
  		uid: uid,
  		message: message
  	};
  	var userREF = firebase.database().ref().child('Message');
  	var newPostREF = userREF.push();
  	newPostREF.update(data);
  };


 firebase.database().ref().child('Message').limitToLast(12).on("child_added",function(snapshot){
 	var DATAFROMSERVER = JSON.stringify(snapshot.val(),null,3);
 	var newData = DATAFROMSERVER.split("\"");
 	//console.log(newData);
 	for (var i = 0; i < newData.length; i++) {
 		if (newData[i] == "message") {
 			//console.log("Message: " + newData[i+2]);
 			document.getElementById('data').innerHTML = document.getElementById('data').value + "Message: " + newData[i+2] + "\n";
 		}else if (newData[i] == "username") {
 			//console.log("Sender: " + newData[i+2]);
 			document.getElementById('data').innerHTML = document.getElementById('data').value + "Sender: " + newData[i+2]+ "\n";
 		}
 	}
 });





 // send friends request
 document.getElementById('sendreq').addEventListener('click', function(){
 	firebase.database().ref().child('UserPool').once("value", function(snapshot){
 		var DATAFROMSERVER = JSON.stringify(snapshot.val(),null,3);
 		var newData = DATAFROMSERVER.split("\"");
 		var postion = 0;
 		for (var i = 0; i < newData.length; i++) {
 			if (newData[i] == document.getElementById('addfriend').value) {
 				postion = i+4;
 				break;
 			}
 		}
 		//check if already send the request
 		firebase.database().ref().child('User').child(newData[postion]).once("value", function(snapshot){
 			if ((JSON.stringify(snapshot.val())).includes(firebase.auth().currentUser.email)) {
 				alert("Dont spam request");
 			}else{
 				var data = {Request: firebase.auth().currentUser.email};
			  	var userREF = firebase.database().ref().child('User').child(newData[postion]);
			  	var newPostREF = userREF.push();
			  	newPostREF.update(data);
 			}
 		});
 	});
 });



 //accept friends

firebase.auth().onAuthStateChanged(function(user){
	var x = 0;
	firebase.database().ref().child('User').child(user.uid).on("child_added", function(snapshot){
 	var DATAFROMSERVER = JSON.stringify(snapshot.val(),null,3);
 	var newData = DATAFROMSERVER.split("\"");
 		 for (var i = 0; i < newData.length; i++) {
 		 		if (newData[i] == "Request") {
 		 			var requestID = "requestEmail".concat(i.toString());
 		 			var acceptID = "accept".concat(i.toString());
 		 			var declineID = "decline".concat(i.toString());

 		 			creatButtonAccept(acceptID,declineID,requestID,newData[i+2],user.uid,x);
 		 			x++;
 		 		}else if (newData[i] == "Friend") {
					var requestID = "requestEmail".concat(i.toString());
 		 			var acceptID = "accept".concat(i.toString());
 		 			var declineID = "decline".concat(i.toString());

 		 			chatButton(acceptID,declineID,requestID,newData[i+2],user.uid,x);
 		 			x++;
 		 		}
 		 }
    });
});

function creatButtonAccept(button1,button2,requestID,requestData,userID,postion){
					var para = document.createElement("P");
				    var t = document.createTextNode(requestData);
				    para.appendChild(t);
				    para.setAttribute("id",requestID);
				    document.getElementById("FriendsRequest").appendChild(para);

				    var accept = document.createElement("Button");
				    	t = document.createTextNode("Accept");
				    accept.appendChild(t);
				    accept.setAttribute("id",button1);
				    accept.addEventListener('click', function(){
				    	ADDFRIENDS(requestData,userID,postion);
				    });
				    document.getElementById('FriendsRequest').appendChild(accept);


				    var decline = document.createElement("Button");
				    	t = document.createTextNode("Delete");
				    decline.appendChild(t);
				    decline.setAttribute("id",button2);
				    decline.addEventListener('click', function(){
				    	DECLINEFRIENDS(requestData,userID,postion);
				    });
				    document.getElementById('FriendsRequest').appendChild(decline);
};

function chatButton(button1,button2,requestID,requestData,userID,postion){
					var para = document.createElement("P");
				    var t = document.createTextNode(requestData);
				    para.appendChild(t);
				    para.setAttribute("id",requestID);
				    document.getElementById("FriendsRequest").appendChild(para);

				    var accept = document.createElement("Button");
				    	t = document.createTextNode("Chat");
				    accept.appendChild(t);
				    accept.setAttribute("id",button1);
				    accept.addEventListener('click', function(){
				    	//chat Function here...

				    });
				    document.getElementById('FriendsRequest').appendChild(accept);


				    var decline = document.createElement("Button");
				    	t = document.createTextNode("Delete");
				    decline.appendChild(t);
				    decline.setAttribute("id",button2);
				    decline.addEventListener('click', function(){
				    	DECLINEFRIENDS(requestData,userID,postion);
				    });
				    document.getElementById('FriendsRequest').appendChild(decline);
}

function ADDFRIENDS(requestData,uid,postion){
	var key = [];
	firebase.database().ref().child('User').child(uid).on("child_added", function(snapshot){
		key.push(snapshot.key);
	});

	firebase.database().ref().child('User').child(uid).child(key[postion]).remove();
	var data = {Friend: requestData};
	var userREF = firebase.database().ref().child('User').child(uid);
	var newPostREF = userREF.push();
	newPostREF.update(data);
	location.reload();

}


//decline friends
function DECLINEFRIENDS(requestData,uid,postion){
	var key = [];
	firebase.database().ref().child('User').child(uid).on("child_added", function(snapshot){
		key.push(snapshot.key);
	});
	firebase.database().ref().child('User').child(uid).child(key[postion]).remove();
	location.reload();
}


//Make friedns List and Chat box.