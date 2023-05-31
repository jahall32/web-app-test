
window.addEventListener('DOMContentLoaded', () => {
    fetch('/search?category=food')
      .then((response) => response.json())
      .then((data) => {
        const recentPosts = data.posts;
        handleServerData(recentPosts);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  });

  function handleServerData(recentPosts) {
    const recentPostsList = document.getElementById('recent-posts');
    recentPostsList.innerHTML = '';

    recentPosts.forEach((post) => {
      const li = renderPost(post);
      recentPostsList.appendChild(li);
    });
  }

  function renderPost(post) {
    let li = document.createElement('li');
    let liText = document.createElement('p');
    liText.textContent = `Caption: ${post.message} User: ${post.postedBy} likes:${post.likes} Category:${post.category}`;

    let button = document.createElement('button');
    button.textContent = 'like';
    button.addEventListener('click', processLike);
    button.setAttribute('data-post-id', post._id.toString());

    let viewButton = document.createElement('button');
    viewButton.textContent = 'view and comment';
    viewButton.addEventListener('click', processView);
    viewButton.setAttribute('view-post-id', post._id.toString());

    renderImage(li, post);
    li.appendChild(liText);
    
    return li;
  }

  function renderImage(li, post) {
    if (post.imagePath) {
      let postImage = document.createElement('img');
      postImage.src = post.imagePath;
      postImage.alt = 'temporary alt tag';
      postImage.classList.add('post-image-thumbnail');
      li.appendChild(postImage);
    } else {
      let noPostImage = document.createElement('p');
      noPostImage.textContent = 'alas, no image!';
      li.appendChild(noPostImage);
    }
  }

  function processLike(event) {
let likedPostId = event.target.getAttribute('data-post-id');
let category = event.target.getAttribute('data-category'); // Get the category value from the data attribute of the button
let options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    likedPostID: likedPostId,
    category: category
  })
};

fetch('/like', options)
  .then(response => response.json())
  .then(fetchedData => {
    const recentPosts = fetchedData.posts;
    handleServerData(recentPosts);
  });
}

  function processCategory(event) {
    let category = event.target.getAttribute('data-category');
    console.log('you clicked ' + category);
    let options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        category: category
      })
    };

    fetch('/category', options)
      .then(response => response.json())
      .then(fetchedData => {
        const recentPosts = fetchedData.posts;
        handleServerData(recentPosts);
      });
  }

  function processView(event) {
    let viewPostId = event.target.getAttribute('view-post-id');
    console.log(window.location.origin + '/viewpost.html?post=' + viewPostId);
    window.location = window.location.origin + '/viewpost.html?post=' + viewPostId;
  }

  function newPostPage() {
    window.location = window.location.origin + '/viewpost.html';
  }