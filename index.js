var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);
server.listen(3000);
playerName=[];
var num=[5], sum, number ="", quest = "", temp;
var client = {user: "", score:0, start:0};

app.get('/',function (req, res) {
    res.sendfile(__dirname + '/index.html');
});

//var c = 0;
var roomno=1;
var rooms=[];

io.sockets.on('connection',function (socket) {
    socket.on('req', function () {
    console.log('ramdom');
    // io.sockets.emit('displayUser',data);
    });
    socket.on('send username',function (data, callback) {   //receive user name -> check duplicate
        if(playerName.indexOf(data)!=-1) {
            callback(false);
        }else{
            callback(true);
            socket.name = data;  //push name[]
            playerName.push(socket.name);
            io.sockets.emit('listOfUser',playerName);  //update
            client.user = socket.name; //keep name of client in server
        }

    });
    socket.on('disconnect',function (data) {  //cut name out when disconnect
        if(!socket.name) return;
        playerName.splice(playerName.indexOf(socket.name),1);
        io.sockets.emit('listOfUser',playerName);
    });
    send();
    clients = [];

    socket.on('pair',function () {
       // clients.push(client);

        temp = roomno;
        if(io.nsps['/'].adapter.rooms["room-"+roomno] && io.nsps['/'].adapter.rooms["room-"+roomno].length > 1) {
            roomno++;
        }
        if(roomno!=temp){
            send();
        }
        socket.join("room-"+roomno);
        console.log('number of user in the room = '+io.nsps['/'].adapter.rooms["room-"+roomno].length);
        console.log(socket.name+" in room "+roomno);

        //Random who start first, after
        if(io.nsps['/'].adapter.rooms["room-" + roomno].length == 1) {
            strt = Math.floor(Math.random()*10)+1;
            console.log('Random Number to find starter :'+strt);
            rooms[roomno-1]= new Object();
            rooms[roomno-1].first =new Object();
            rooms[roomno-1].second =new Object();
            if(strt<=5){
                rooms[roomno-1].first.id = socket.id;
                rooms[roomno-1].first.name = socket.name;
                console.log(socket.name + ' plays first');
            }else{
                rooms[roomno-1].second.id = socket.id;
                rooms[roomno-1].second.name = socket.name;
                console.log(socket.name + ' plays second');
            }
        }else if (io.nsps['/'].adapter.rooms["room-" + roomno].length == 2) {
            if(rooms[roomno-1].first.id!=null){
                rooms[roomno-1].second.id = socket.id;
                rooms[roomno-1].second.name = socket.name;
                console.log(socket.name + ' plays second');
            }else{
                rooms[roomno-1].first.id = socket.id;
                rooms[roomno-1].first.name = socket.name;
                console.log(socket.name + ' plays first');
            }

            //Send this event to everyone in the room.
            //If there 2 ppl clicked button , emit sum
           // if (io.nsps['/'].adapter.rooms["room-" + roomno].length == 2) {
                numnull = ['x','x','x','x','x','x'];
                io.to(rooms[roomno-1].first.id).emit('connectToRoom', {
                    descriptions: '1st player',num : num, sum: sum, playturn : true
                });
                io.to(rooms[roomno-1].second.id).emit('connectToRoom', {
                    descriptions: '2nd player',num : numnull , sum: 'x', playturn : false
                });

                socket.on('showit',function () {
                    io.to(rooms[roomno-1].second.id).emit('play', {
                        descriptions: '2nd player',num : num , sum: sum,playturn : true
                    });
                    console.log('2nd player turn');
                });
            }


        console.log('======================END=======================');
     //   socket.leave("room-"+roomno);
    });

});

function send(){
    for(i=0;i<5;i++){
        num[i] = Math.floor((Math.random() * 9)+1);
        number += " "+num[i];
        if(i==0){
            sum = num[i];
            quest = ""+num[i];
        }else {
            var op = Math.floor((Math.random() * 4) + 1);
            if (op == 1) {
                sum += num[i];
                quest += "+ " + num[i];
            } else if (op == 2) {
                sum -= num[i];
                quest += "-" + num[i];
            } else if (op == 3) {
                sum *= num[i];
                quest += "*" + num[i];
            } else {
                temp = sum;
                sum /= num[i];
                if(sum%num[i]==0) {
                    quest += "/" + num[i];
                }else{
                    sum =temp;
                    i--;
                }
            }
        }

    }

}

function checkscore(){

}
