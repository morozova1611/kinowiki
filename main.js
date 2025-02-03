const API_KEY = 'API_KEY';
const SERVER_URL = 'https://api.themoviedb.org/3';

// DOM-элементы
const categoriesList = document.querySelector('.nav');
const genreSelect = document.getElementById('genre-select');
const sectionMovie = document.getElementById('items');
const moviesList = document.querySelector('.items');
const moviePage = document.querySelector('.movie-page');
const favoritesPage = document.getElementById('favorites-page');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const pagination = document.querySelector('.pagination');
const openFavoritesButton = document.getElementById('open-favorites');
const favoriteList = document.getElementById('favorite-list');

// Хранилище избранного
let favoriteMovies = JSON.parse(localStorage.getItem('favoriteMovies')) || [];

// Универсальная функция запроса данных
const fetchData = async (url) => {
    try {
        const res = await fetch(url);
        return await res.json();
    } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
    }
};

// Список фильмов
const getMovie = (category, page = 1) => fetchData(`${SERVER_URL}/movie/${category}?api_key=${API_KEY}&page=${page}&language=ru-RU`);

// Поиск фильма
const searchMovie = (query, category) => fetchData(`${SERVER_URL}/search/${category}?api_key=${API_KEY}&query=${query}`);

// Список жанров
const getGenres = () => fetchData(`${SERVER_URL}/genre/movie/list?api_key=${API_KEY}&language=ru-RU`);

// получение фильмов по жанру 
const getMoviesByGenre = (genreId, page = 1) => fetchData(`${SERVER_URL}/discover/movie?api_key=${API_KEY}&language=ru-RU&with_genres=${genreId}&sort_by=popularity.desc&page=${page}`);

// Получение информации о фильме
const getMovieDetails = (movieId) => fetchData(`${SERVER_URL}/movie/${movieId}?api_key=${API_KEY}`);
const getTrailers = (movieId) => fetchData(`${SERVER_URL}/movie/${movieId}/videos?api_key=${API_KEY}`);
const getReviews = (movieId) => fetchData(`${SERVER_URL}/movie/${movieId}/reviews?api_key=${API_KEY}`);


// функция для списка жанров
const populateGenreSelect = (genres) => {
    genres.forEach((genre) => {
        genreSelect.insertAdjacentHTML('beforeend', `
            <option class='genre' value="${genre.id}">${genre.name}</option>
        `);
    });
};

// Функция для отображения фильмов
const insertMovieCards = async (content) => {
    moviesList.innerHTML = "";
    content.forEach(item => {
        moviesList.insertAdjacentHTML(
            "beforeend",
            `<div class="item" data-item-id="${item.id}" data-item-type="${item.media_type || 'movie'}">
                <img src="${item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'default-image.jpg'}" alt="картинка" class="img">
                <h2 class="item-title">${item.title || item.name}</h2>
                <p><strong>Дата выхода:</strong> ${item.release_date || item.first_air_date}</p>
                <p><strong>Рейтинг:</strong> ${item.vote_average}</p>
                
                <div class="item-buttons">
                    <button class="btn-details">Подробнее</button>
                    <button class="btn-favorite">${favoriteMovies.includes(item.id.toString()) ? 'Удалить из избранного' : 'Добавить в избранное'}</button>
                </div>
            </div>`
        );
    });
};

// Отображение детальной страницы
const showMoviePage = async (itemId) => {
    const item = await getMovieDetails(itemId);
    const trailers = await getTrailers(itemId);
    const reviews = await getReviews(itemId);
    sectionMovie.classList.add('hide');
    moviePage.classList.remove('hide');
    if (!item) return;
    moviePage.innerHTML = `
        <div class="movie-details">
            <h1 class="movie-title">${item.title || item.name}</h1>
            <p><strong>Рейтинг:</strong> ${item.vote_average} (${item.vote_count} голосов)</p>
            <p><strong>Дата выхода:</strong> ${item.release_date || item.first_air_date}</p>
            <p><strong>Описание:</strong> ${item.overview || 'Нет описания'}</p>
            <p><strong>Жанры:</strong> ${item.genres.map(genre => genre.name).join(', ')}</p>
        
            <div class="trailer">
                <h2 class="movie-title">Трейлер</h2>
                ${trailers.results.length > 0 
                    ? `<iframe width="560" height="315" src="https://www.youtube.com/embed/${trailers.results[0].key}" frameborder="0" allowfullscreen></iframe>` 
                    : `<p>Трейлер не доступен</p>`
                }
            </div>
        </div>
    `;
    const movieDetails = document.querySelector('.movie-details');
    const reviewsContainer = document.createElement('div'); 
    reviewsContainer.classList.add('reviews');
    if (reviews.results.length) {
        reviews.results.forEach(review => {
            reviewsContainer.insertAdjacentHTML('beforeend', `
                <div class="review">
                    <p><strong>${review.author}</strong></p>
                    <p>${review.content}</p>
                </div>
            `);
        });
    } else {
        reviewsContainer.insertAdjacentHTML('beforeend', '<p>Отзывов еще нет</p>');
    }
    
    movieDetails.appendChild(reviewsContainer);
};

// Обновление избранного
const updateFavoritePage = async () => {
    sectionMovie.classList.add('hide');
    favoriteList.classList.remove('hide');
    favoriteList.innerHTML = '';
    favoriteMovies.forEach(async (movieId) => {
        const movie = await getMovieDetails(movieId);
        if (movie) {
            favoriteList.insertAdjacentHTML('beforeend', `
                <div class="favorite-item">
                    <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="poster" class="favorite-poster" />
                    <div class="favorite-info">
                        <h3>${movie.title || movie.name}</h3>
                        <p><strong>Рейтинг:</strong> ${movie.vote_average.toFixed(1)}</p>
                        <p><strong>Год:</strong> ${movie.release_date ? movie.release_date.split('-')[0] : '—'}</p>
                    </div>
                </div>`);
        }
    });
    
};

// Изменение избранного
const toggleFavorite = (itemId, itemTitle) => {
    const index = favoriteMovies.indexOf(itemId);
    if (index === -1) {
        favoriteMovies.push(itemId);
        alert(`${itemTitle} добавлен в избранное!`);
    } else {
        favoriteMovies.splice(index, 1);
        alert(`${itemTitle} удален из избранного.`);
    }
    localStorage.setItem('favoriteMovies', JSON.stringify(favoriteMovies));
    updateFavoritePage();
};

// Создание пагинации
const createPagination = (totalPages, currentPage, category, genreId) => {
    pagination.innerHTML = '';

    const page = Number(currentPage);
    const maxVisiblePages = 5; // Количество отображаемых страниц до многоточия

    // Кнопка "Назад"
    if (page > 1) {
        pagination.insertAdjacentHTML('beforeend', `
            <span class="pagination-btn" data-page-number="${page - 1}" data-category="${category}" data-genre-id="${genreId}">Назад</span>
        `);
    }

    // Первая страница
    if (page > 2) {
        pagination.insertAdjacentHTML('beforeend', `
            <span class="pagination-btn" data-page-number="1" data-category="${category}" data-genre-id="${genreId}">1</span>
        `);
    }

    // Многоточие перед текущей страницей
    if (page > maxVisiblePages) {
        pagination.insertAdjacentHTML('beforeend', `<span class="pagination-dots">...</span>`);
    }

    // Центральные страницы (вокруг текущей)
    let start = page - 2;
    if (start < 1) start = 1;

    let end = page + 2;
    if (end > totalPages) end = totalPages;

    for (let i = start; i <= end; i++) {
        pagination.insertAdjacentHTML('beforeend', `
            <span class="pagination-btn ${i === page ? 'active' : ''}" data-page-number="${i}" data-category="${category}" data-genre-id="${genreId}">${i}</span>
        `);
    }

    // Многоточие после текущей страницы
    if (page < totalPages - maxVisiblePages) {
        pagination.insertAdjacentHTML('beforeend', `<span class="pagination-dots">...</span>`);
    }

    // Последняя страница
    if (page < totalPages - 1) {
        pagination.insertAdjacentHTML('beforeend', `
            <span class="pagination-btn" data-page-number="${totalPages}" data-category="${category}" data-genre-id="${genreId}">${totalPages}</span>
        `);
    }

    // Кнопка "Вперед"
    if (page < totalPages) {
        pagination.insertAdjacentHTML('beforeend', `
            <span class="pagination-btn" data-page-number="${page + 1}" data-category="${category}" data-genre-id="${genreId}">Вперед</span>
        `);
    }
};



// Обработчики событий
categoriesList.addEventListener('click', async (e) => {
    const target = e.target;
    if (target.closest('.nav')) {
        const categoryName = target.dataset.category;
        let data;
        if (categoryName === 'now_playing') {
            data = await getMovie('now_playing');
        } else if (categoryName === 'top_rated') {
            data = await getMovie('top_rated');
        } else if (categoryName === 'upcoming') {
            data = await getMovie('upcoming');
        }
        
        insertMovieCards(data.results);
        createPagination(data.total_pages, 1, categoryName);
    }
});

genreSelect.addEventListener('change',async (e) => {
    const genreId = e.target.value;
    if (genreId) {
        data = await getMoviesByGenre(genreId);
        insertMovieCards(data.results);
        createPagination(data.total_pages, 1, null, genreId);
    }
});

searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const searchString = searchInput.value;
    if (searchString) {
        const content = await searchMovie(searchString, 'movie');
        insertMovieCards(content.results);
    }
});

pagination.addEventListener('click', async (e) => {
    const target = e.target;
    if (target.closest('.pagination-btn')) {
        const pageNumber = target.dataset.pageNumber;
        const category = target.dataset.category; 
        const genreId = target.dataset.genreId;    
        let data;
        if (category) {
            data = await getMovie(category, pageNumber);
        } else if (genreId) {
            data = await getMoviesByGenre(genreId, pageNumber);
        }
        insertMovieCards(data.results);
        createPagination(data.total_pages, pageNumber, category, genreId);
    }
});

moviesList.addEventListener('click', (e) => {
    const itemCard = e.target.closest('.item');
    if (!itemCard) return;

    const itemId = itemCard.dataset.itemId;
    const itemTitle = itemCard.querySelector('.item-title').textContent;
    
    if (e.target.classList.contains('btn-details')) showMoviePage(itemId, 'movie');
    if (e.target.classList.contains('btn-favorite')) toggleFavorite(itemId, itemTitle);
});

openFavoritesButton.addEventListener('click', updateFavoritePage);

// Запуск приложения
document.addEventListener('DOMContentLoaded', async () => {
    const genres = await getGenres();
    const content = await getMovie('popular');
    populateGenreSelect(genres.genres);
    insertMovieCards(content.results);
    createPagination(content.total_pages, 1, 'popular');
});
