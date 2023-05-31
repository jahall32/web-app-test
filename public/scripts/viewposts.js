let recentPosts=[]

let recentPostsList=document.querySelector('#recent-posts')

fetch('/getposts')
    .then(response=>response.json())
    .then(fetchedData=>{
        recentPosts=fetchedData.posts
        console.log(fetchedData.posts)
        handleServerData()
    })

function handleServerData(){
    recentPostsList.innerHTML=''
    recentPosts.forEach(function(post){
        let li=renderPost(post)
        recentPostsList.appendChild(li)
    })
}

function renderPost(post){
    // console.log(post._id.toString(), post.likes);
    let li=document.createElement('li')
    let liText=document.createElement('p')
    liText.textContent=`Caption: ${post.message} User: ${post.postedBy} likes:${post.likes} Category:${post.category}`
    
    //create a 'like' button
    let button=document.createElement('button')
    button.textContent='like'
    button.addEventListener('click',processLike)
    //add a unique attribute for the like button so it knows which post it belongs to
    button.setAttribute('data-post-id',post._id.toString())

    //create a 'view and comment' button
    let viewButton=document.createElement('button')
    viewButton.textContent='view and comment'
    viewButton.addEventListener('click',processView)
    //add a unique attribute for the like button so it knows which post it belongs to
    viewButton.setAttribute('view-post-id',post._id.toString())

 


    
    // show image if present
    renderImage(li, post)
    li.appendChild(liText)
    li.appendChild(button)
    li.appendChild(viewButton)
    // grab the comments list
    let comments=post.comments
  
    return li
}

function renderImage(li, post){
    if(post.imagePath){
        let postImage=document.createElement('img')
        postImage.src=post.imagePath
        postImage.alt="temporary alt tag"
        postImage.classList.add("post-image-thumbnail")
        li.appendChild(postImage)
    } else {
        let noPostImage=document.createElement('p')
        noPostImage.textContent="alas, no image!"
        li.appendChild(noPostImage)
    }
}

function processLike(event){
    let likedPostId=event.target.getAttribute("data-post-id");
    // console.log('you liked '+likedPostId)
    let options={
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            likedPostID:likedPostId
        })
    }
    fetch('/like',options)
        .then(response=>response.json())
        .then(fetchedData=>{
            recentPosts=fetchedData.posts
            handleServerData()
        })
}

function processCategory(event){
    let category=event.target.getAttribute("data-category");
    console.log('you clicked '+category)
    let options={
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            category:category
        })
    }
    fetch('/category',options)
        .then(response=>response.json())
        .then(fetchedData=>{
            recentPosts=fetchedData.posts
            handleServerData()
        })
}

// If view post button is pressed, grab its post id attribute and 
// direct the user to the view post page with this added in 
// url search params
function processView(event){
    let viewPostId=event.target.getAttribute("view-post-id");
    console.log(window.location.origin+'/viewpost.html?post='+viewPostId)
    window.location=window.location.origin+'/viewpost.html?post='+viewPostId
}

//if user press 'new post' button, direct them to the new post page
function newPostPage(){
    window.location=window.location=window.location.origin+'/viewpost.html'
}




 
