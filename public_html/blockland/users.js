class Users{
    constructor(UserNiCK){
       
        const userList = document.getElementById('users');
        const socket = io.connect();

        var users = [];
        
        var usernick = UserNiCK;
        var userid;

        socket.on('setId', function (data) {
            userid = data.id;
            console.log('들고와진다' + userid);

           socket.emit('nickdata', {nick: usernick, id: userid});
      });

        
          
        
        socket.on('nicksave', (data)=>{
             userList.innerHTML = `
             ${data.map(data => `<span>${data.nick}</span>`).join(',')}`
            // const user = data;
            // users.push(user)
            
            console.log('배열 확인', data)
        })

        

    }

    

// userJoin(id, usernick){

//     const user = {id, usernick};

//     users.push(user);
    

//     return user;
// }

// getCurrentUser(id){
//     return users.find(user => user.id === id);
// }

// userLeave(id){
//     const index = users.findIndex(user => user.id === id);

//     if(index !== -1){
//         return users.splice(index , 1)[0];
        
//     }
// }



}


// module.exports = {
//     userJoin,
//     getCurrentUser,
//     userLeave
// }









