function searchPosts(event) {
    event.preventDefault();

    const searchInput = document.getElementById('search-bar').value;

    fetch(`/search?category=${searchInput}`)
      .then((response) => response.json())
      .then((data) => {
        displaySearchResults(data.posts);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  function displaySearchResults(posts) {
    const searchResultsContainer = document.getElementById('search-results');
    searchResultsContainer.innerHTML = '';

    if (posts.length === 0) {
      searchResultsContainer.textContent = 'No results found.';
      return;
    }

    posts.forEach((post) => {
      const postElement = renderPost(post);
      searchResultsContainer.appendChild(postElement);
    });
  }

  function renderPost(post) {
    const postElement = document.createElement('div');
    postElement.classList.add('post');

    const postContent = document.createElement('div');
    postContent.classList.add('post-content');
    postContent.textContent = post.message;

    const postImage = document.createElement('img');
    postImage.src = post.imagePath || 'placeholder.png';
    postImage.alt = 'Post Image';
    postImage.classList.add('post-image');

    postElement.appendChild(postImage);
    postElement.appendChild(postContent);

    return postElement;
  }