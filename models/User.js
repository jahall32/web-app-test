
    // const users=[
    //     {username:'user1', password:'123', loggedin:false},
    //     {username:'user2', password:'123', loggedin:false}
    // ]

    const mongoose=require('mongoose');
    const { Schema, model } = mongoose;
    
    const userSchema = new Schema({
        username: String,
        password: String,
        loggedin: Boolean,
        bio: String
    });
    
    const User = model('User', userSchema);
    
   
        async function newUser(username, password){
            const user={username:username, password:password, loggedin:false}
            // users.push(user)
            await User.create(user)
            .catch(err=>{
                console.log('Error:'+err)
            });
        }
    
        async function getUsers(){
            let data=[];
            await User.find({})
                .exec()
                .then(mongoData=>{
                    data=mongoData;
                })
                .catch(err=>{
                    console.log('Error:'+err)
                });
            return data;
        }

    
        async function findUser(userToFind){
            let user=null
            await User.findOne({username:userToFind}).exec()
                .then(mongoData=>{
                    user=mongoData;
                })
                .catch(err=>{
                    console.log('Error:'+err)
                });
            return user;
        }
    
        async function checkPassword(username, password){
            let user=await findUser(username)
            if(user){
                // console.log(user, password)
                return user.password==password
            }
            return false
        }
    
        async function setLoggedIn(username, state){
            let user=await findUser(username)
            if(user){
                user.loggedin=state
                user.save()
            }
        }
    
        async function isLoggedIn(username){
            let user=await findUser(username)
            if(user){
                return user.loggedin=state
            }
            return false
        }
//----------
        async function updateBio(user, data){
            console.log(user,data)
            await User.findOneAndUpdate(
                {username:user},
                {bio:data.bio}
            ).exec()
        }
          
          
        
    
          module.exports = {
            newUser,
            getUsers,
            findUser,
            checkPassword,
            setLoggedIn,
            isLoggedIn,
            updateBio,
          };