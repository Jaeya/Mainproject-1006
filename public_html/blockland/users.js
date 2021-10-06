class Users{
    constructor(UserNiCK){
       
        const userList = document.getElementById('users');
        const socket = io.connect();
        const user = this;

        this.users = [];
        
        this.usernick = UserNiCK
        this.socket = socket;
        console.log('온다', this.usernick)
        
        this.socket.on('setId', function (data) {
			//user.id = data.id;

           
		});

        this.socket.emit('nickdata',  this.usernick, user.id)     
          
        
        this.socket.on('nicksave', (data)=>{

        
             userList.innerHTML = `
             ${data.map(data => `<span>${data}</span>`).join(',')}`
            // const user = data;
            // users.push(user)
            
            console.log('asd', data)
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





