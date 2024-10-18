// FETCH BOOKS
function fetchBooks() {
  fetch('https://readly-kappa.vercel.app/books')
    .then(response => response.json())
    .then(books => {
      const bookGrid = document.getElementById('book-grid');
      books.forEach(book => {
        const { id, title, author, status, genre, thumbnail } = book;

        const bookCard = document.createElement('div');
        bookCard.classList.add('book-card');

        const bookImage = document.createElement('img');
        bookImage.classList.add('book-image');
        bookImage.src = thumbnail
        bookImage.alt = `${title} Cover`;

        const bookDetails = document.createElement('div');
        bookDetails.classList.add('book-details');

        const bookTitle = document.createElement('h5');
        bookTitle.classList.add('title');
        bookTitle.textContent = title;

        const bookAuthor = document.createElement('p');
        bookAuthor.classList.add('author');
        bookAuthor.textContent = author || 'No author available';

        const bookGenre = document.createElement('p');
        bookGenre.classList.add('genre');
        bookGenre.innerHTML = `Genre: <span>${Array.isArray(genre) ? genre.join(', ') : 'No genre available'}
        </span>`;

        const statusLabel = document.createElement('label');
        statusLabel.setAttribute('for', `status-select-${id}`);
        statusLabel.classList.add('status-label');
        statusLabel.textContent = 'Status:';

        const statusSelect = document.createElement('select');
        statusSelect.id = `status-select-${id}`;
        statusSelect.classList.add('status-select');

        const defaultValue = document.createElement('option');
        defaultValue.textContent = 'Select a status';
        defaultValue.disabled = true;

        if (!status) defaultValue.selected = true;

        const wantToRead = document.createElement('option');
        wantToRead.value = 'want-to-read';
        wantToRead.textContent = 'Want to Read';
        if (status === 'want-to-read') wantToRead.selected = true;

        const currentlyReading = document.createElement('option');
        currentlyReading.value = 'currently-reading';
        currentlyReading.textContent = 'Currently Reading';
        if (status === 'currently-reading') currentlyReading.selected = true;

        const finished = document.createElement('option');
        finished.value = 'finished';
        finished.textContent = 'Finished';
        if (status === 'finished') finished.selected = true;

        statusSelect.append(defaultValue, wantToRead, currentlyReading, finished);

        const statusSpan = document.createElement('span');
        statusSpan.classList.add('status');

        if (status === 'finished') {
          statusSpan.classList.add('finished');
        } else if (status === 'currently-reading') {
          statusSpan.classList.add('currently-reading');
        } else if (status === 'want-to-read') {
          statusSpan.classList.add('want-to-read');
        }

        statusSpan.textContent = status ? status.replace('-', ' ') : '';

        // Event listener to handle status change
        statusSelect.addEventListener('change', (event) => {
          event.preventDefault()
          const selectedValue = event.target.value;
          handleStatusChange(id, selectedValue);
          statusSpan.textContent = selectedValue.replace('-', ' ');
        });

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-btn');
        deleteButton.innerHTML = `<i class="fa-solid fa-trash"></i>`;

        deleteButton.addEventListener('click', (event) => {
          event.preventDefault()
          deleteBook(id, bookCard, title);
        });

        bookDetails.append(bookTitle, bookAuthor, bookGenre, statusLabel, statusSelect, statusSpan, deleteButton);
        bookCard.append(bookImage, bookDetails);

        bookGrid.appendChild(bookCard);
      });
    })
    .catch(error => console.error('Error fetching books:', error));
}


// HANDLE SEARCH
function handleSearch() {
  const searchInput = document.getElementById('search-input');
  const searchTerm = searchInput.value;
  const closeIcon = document.querySelector('.close-icon');


  closeIcon.addEventListener('click', () => {
    searchInput.value = '';
    const searchIcon = document.querySelector('.search-icon');
    const searchSection = document.querySelector('#search')
    searchSection.classList.add('hidden')
    closeIcon.classList.add('hidden');
    searchIcon.classList.remove('hidden');
  });

  fetch(`https://www.googleapis.com/books/v1/volumes?q=${searchTerm}`)
    .then(response => response.json())
    .then(data => {
      const bookGrid = document.getElementById('search-result');
      bookGrid.innerHTML = ''; // Clear previous search results

      const books = data.items || [];
      books.forEach(book => {
        const title = book.volumeInfo.title || 'No title available';
        const subtitle = book.volumeInfo.subtitle || '';
        const author = book.volumeInfo.authors ? book.volumeInfo.authors.join(', ') : 'No author available';
        const genre = book.volumeInfo.categories ? book.volumeInfo.categories.join(', ') : 'No genre available';
        const thumbnail = book.volumeInfo.imageLinks ? book.volumeInfo.imageLinks.thumbnail : 'https://via.placeholder.com/128x195?text=No+Image';

        const bookCard = document.createElement('div');
        bookCard.classList.add('book-card');

        const bookImage = document.createElement('img');
        bookImage.classList.add('book-image');
        bookImage.src = thumbnail;
        bookImage.alt = title;

        const bookDetails = document.createElement('div');
        bookDetails.classList.add('book-details');

        const bookTitle = document.createElement('h5');
        bookTitle.classList.add('title');
        bookTitle.textContent = title;

        if (subtitle) {
          const bookSubtitle = document.createElement('p');
          bookSubtitle.classList.add('subtitle');
          bookSubtitle.textContent = subtitle;
          bookDetails.appendChild(bookSubtitle);
        }

        const bookAuthor = document.createElement('p');
        bookAuthor.classList.add('author');
        bookAuthor.textContent = `Author: ${author}`;

        const bookGenre = document.createElement('p');
        bookGenre.classList.add('genre');
        bookGenre.innerHTML = `Genre: <span>${genre}</span>`;

        const addButton = document.createElement('button')
        addButton.innerText = 'Add Book'

        addButton.addEventListener('click', (event) => {
          event.preventDefault()
          addBook(title, author, genre, thumbnail)
        })

        bookDetails.append(bookTitle, bookAuthor, bookGenre, addButton);
        bookCard.append(bookImage, bookDetails);

        bookGrid.appendChild(bookCard);
      });
    })
    .catch(error => console.error('Error during search:', error));
}

// ADD BOOK FUNCTION
function addBook(title, author, genre, thumbnail) {
  const body = {
    title: title,
    author: author,
    status: "",
    genre: [genre],
    thumbnail: thumbnail
  }
  fetch('https://readly-kappa.vercel.app/books/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(body)
  })
    .then(response => response.json())
    .then(addedBook => {
      console.log('Added Book: ', addedBook)
    })
    .catch(error => {
      alert(`Error adding ${title}`)
    })

}

// DELETE BOOK FUNCTION
function deleteBook(id, bookCard, title) {
  fetch(`https://readly-kappa.vercel.app/books/${id}`, {
    method: 'DELETE',
  })
    .then(response => {
      if (response.ok) {
        bookCard.remove();
        alert(`${title} deleted`);
      } else {
        alert('Failed to delete the book');
      }
    })
    .catch(error => console.error('Error deleting book:', error));
}


// EDIT BOOK SATUS FUNCTION
function handleStatusChange(bookId, status) {
  const body = {
    status: status
  };
  fetch(`https://readly-kappa.vercel.app/books/${bookId}`, {  // Use the book ID to target the right book
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })
    .then(response => response.json())  // Ensure the response is correctly parsed as JSON
    .then(updatedStatus => {
      console.log('Updated Status:', updatedStatus);
    })
    .catch(error => {
      alert('Error updating book status');
    });
}


// RECOMMEND BOOKS BASED ON WHAT THE USER LOVES
function findTopGenres() {
  fetch('https://readly-kappa.vercel.app/books')
    .then(response => response.json())
    .then(books => {
      const genreCount = {};

      // Loop through all books and count genres
      books.forEach(book => {
        book.genre.forEach(genre => {
          genre = genre.toLowerCase();  
          genreCount[genre] = (genreCount[genre] || 0) + 1;
        });
      });

      // Convert genreCount object to an array of [genre, count] and sort by count
      const topGenres = Object.entries(genreCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(genre => genre[0]);
      console.log(topGenres)

      if (topGenres.length > 0) {
        fetchRecommendations(topGenres)
      } else {
        console.log('No genres found')
      }
     
    })
    .catch(error => console.error('Error fetching books:', error));
}

function fetchRecommendations(genres) {
  const genreQuery = genres.map(genre => `subject:${genre}`).join('+');
  console.log(genreQuery)
  
  fetch(`https://www.googleapis.com/books/v1/volumes?q=${genreQuery}`)
  .then(response => response.json())
  .then(data => {
    console.log(data)
    const bookGrid = document.getElementById('recommendation-grid');
    bookGrid.innerHTML = ''; // Clear previous search results

    const books = data.items || [];
    
    books.forEach(book => {
      const title = book.volumeInfo.title || 'No title available';
      const subtitle = book.volumeInfo.subtitle || '';
      const author = book.volumeInfo.authors ? book.volumeInfo.authors.join(', ') : 'No author available';
      const genre = book.volumeInfo.categories ? book.volumeInfo.categories.join(', ') : 'No genre available';
      const thumbnail = book.volumeInfo.imageLinks ? book.volumeInfo.imageLinks.thumbnail : 'https://via.placeholder.com/128x195?text=No+Image';

      const bookCard = document.createElement('div');
      bookCard.classList.add('book-card');

      const bookImage = document.createElement('img');
      bookImage.classList.add('book-image');
      bookImage.src = thumbnail;
      bookImage.alt = title;

      const bookDetails = document.createElement('div');
      bookDetails.classList.add('book-details');

      const bookTitle = document.createElement('h5');
      bookTitle.classList.add('title');
      bookTitle.textContent = title;

      if (subtitle) {
        const bookSubtitle = document.createElement('p');
        bookSubtitle.classList.add('subtitle');
        bookSubtitle.textContent = subtitle;
        bookDetails.appendChild(bookSubtitle);
      }

      const bookAuthor = document.createElement('p');
      bookAuthor.classList.add('author');
      bookAuthor.textContent = `Author: ${author}`;

      const bookGenre = document.createElement('p');
      bookGenre.classList.add('genre');
      bookGenre.innerHTML = `Genre: <span>${genre}</span>`;

      const addButton = document.createElement('button')
      addButton.innerText = 'Add Book'

      addButton.addEventListener('click', (event) => {
        event.preventDefault()
        addBook(title, author, genre, thumbnail)
      })

      bookDetails.append(bookTitle, bookAuthor, bookGenre, addButton);
      bookCard.append(bookImage, bookDetails);

      bookGrid.appendChild(bookCard);
    });
  })
  .catch(error => console.error('Error during search:', error));
}



document.addEventListener('DOMContentLoaded', () => {
  fetchBooks();
  findTopGenres()


  const searchInput = document.getElementById('search-input');

  // Search functionality on pressing Enter
  searchInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      const searchSection = document.querySelector('#search')
      const searchIcon = document.querySelector('.search-icon');
      const closeIcon = document.querySelector('.close-icon');
      searchSection.classList.remove('hidden')
      searchIcon.classList.add('hidden');
      closeIcon.classList.remove('hidden');

      handleSearch();
    }
  });

  // Search functionality for search icon click
  const searchIcon = document.querySelector('.search-icon');
  searchIcon.addEventListener('click', () => {
    const searchSection = document.querySelector('#search')
    const searchIcon = document.querySelector('.search-icon');
    const closeIcon = document.querySelector('.close-icon');
    searchSection.classList.remove('hidden')
    searchIcon.classList.add('hidden');
    closeIcon.classList.remove('hidden');

    handleSearch();
  });
});
