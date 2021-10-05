class Users{
    constructor(UserNiCK){
       
        const socket = io.connect();

        this.users = [];
        this.usernick = UserNiCK
        this.socket = socket;
        console.log('온다', this.usernick)
        
        this.socket.emit('nickdata', this.usernick)        

    }

userJoin(id, usernick){

    const user = {id, usernick};

    users.push(user);
    

    return user;
}

getCurrentUser(id){
    return users.find(user => user.id === id);
}

userLeave(id){
    const index = users.findIndex(user => user.id === id);

    if(index !== -1){
        return users.splice(index , 1)[0];
        
    }
}

}


// module.exports = {
//     userJoin,
//     getCurrentUser,
//     userLeave
// }





