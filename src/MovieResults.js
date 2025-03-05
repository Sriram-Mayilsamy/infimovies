import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './styles/MovieResults.css';

const MovieResults = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { searchCriteria } = location.state || { searchCriteria: {} };
    
    const [filteredMovies, setFilteredMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalMoviesCount, setTotalMoviesCount] = useState(0);
    
    const moviesPerPage = 20; // Increased results per page
    
    useEffect(() => {
        if (!searchCriteria) {
            navigate('/');
            return;
        }
        
        loadAndFilterMovies();
    }, [searchCriteria, currentPage]);
    
    const loadAndFilterMovies = async () => {
        setLoading(true);
        
        try {
            // Construct comprehensive query parameters
            const queryParams = new URLSearchParams({
                page: currentPage,
                limit: moviesPerPage,
                // Convert search criteria to query parameters
                ...(searchCriteria.language ? { language: searchCriteria.language } : {}),
                ...(searchCriteria.minRating ? { minRating: searchCriteria.minRating } : {}),
                ...(searchCriteria.adult !== undefined ? { adult: searchCriteria.adult } : {}),
                ...(searchCriteria.country ? { country: searchCriteria.country } : {}),
                ...(searchCriteria.releaseYear ? { year: searchCriteria.releaseYear } : {}),
                ...(searchCriteria.runtime ? { runtime: searchCriteria.runtime } : {}),
                ...(searchCriteria.genre ? { genre: searchCriteria.genre } : {}),
                ...(searchCriteria.sortBy ? { sortBy: searchCriteria.sortBy } : {})
            });
            
            const response = await fetch(`https://infimovies.onrender.com/api/movies?${queryParams}`);
            // Development
            //const response = await fetch(`http://localhost:5000/api/movies?${queryParams}`);

            
            if (!response.ok) throw new Error(`Failed to fetch movies: ${response.status}`);
            
            const jsonData = await response.json();
            
            console.log('Total movies found:', jsonData.total);
            console.log('Movies in current page:', jsonData.movies.length);
            
            setFilteredMovies(jsonData.movies || []);
            setTotalMoviesCount(jsonData.total || 0);
            setLoading(false);
        } catch (error) {
            console.error('Error loading movies:', error);
            setError('Failed to load movies. Please try again.');
            setLoading(false);
        }
    };
    
    const totalPages = Math.ceil(totalMoviesCount / moviesPerPage);
    
    const goToPage = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
            window.scrollTo(0, 0);
        }
    };
    
    const goBack = () => {
        navigate('/');
    };
    
    // Format search criteria for display
    const formatCriteriaForDisplay = () => {
        const displayCriteria = [];
        
        if (searchCriteria.language) displayCriteria.push(`Language: ${searchCriteria.language}`);
        if (searchCriteria.minRating > 0) displayCriteria.push(`Min Rating: ${searchCriteria.minRating}`);
        displayCriteria.push(`Adult Content: ${searchCriteria.adult ? 'Yes' : 'No'}`);
        if (searchCriteria.country) displayCriteria.push(`Country: ${searchCriteria.country}`);
        if (searchCriteria.releaseYear) displayCriteria.push(`Year: ${searchCriteria.releaseYear} (±3)`);
        if (searchCriteria.runtime) displayCriteria.push(`Runtime: ${searchCriteria.runtime} min (±15)`);
        if (searchCriteria.genre) displayCriteria.push(`Genre: ${searchCriteria.genre}`);
        
        return displayCriteria;
    };

    if (error) {
        return (
            <div className="error-container">
                <div className="error-card">
                    <h2 className="error-title">Error Loading Movies</h2>
                    <p className="error-message">{error}</p>
                    <div className="button-group">
                        <button 
                            className="primary-button"
                            onClick={() => loadAndFilterMovies()}
                        >
                            Try Again
                        </button>
                        <button 
                            className="secondary-button"
                            onClick={goBack}
                        >
                            Back to Filters
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="header">
                <div className="header-content">
                    <h1 className="title">Movie Results</h1>
                    <div className="header-buttons">
                        <button 
                            className="secondary-button"
                            onClick={goBack}
                        >
                            Back to Filters
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="main-container">
                <div className="content-wrapper">
                    {/* Sidebar with search criteria */}
                    <div className="sidebar">
                        <div className="sidebar-header">
                            <h2 className="sidebar-title">Search Criteria</h2>
                        </div>
                        <div className="sidebar-content">
                            {formatCriteriaForDisplay().map((criterion, index) => (
                                <span key={index} className="badge">
                                    {criterion}
                                </span>
                            ))}
                        </div>
                    </div>
                    
                    <div className="main">
                        {/* Results header */}
                        <div className="results-header">
                            <h2 className="results-title">
                                Found {totalMoviesCount} {totalMoviesCount === 1 ? 'movie' : 'movies'}
                            </h2>
                        </div>
                        
                        {/* Loading indicator */}
                        {loading && (
                            <div className="loading-container">
                                <div className="loading-content">
                                    <p className="loading-text">Finding the perfect movies for you...</p>
                                    <div className="spinner"></div>
                                </div>
                            </div>
                        )}
                        
                        {/* Movie results grid */}
                        {!loading && filteredMovies.length > 0 && (
                            <div className="movie-grid">
                                {filteredMovies.map(movie => (
                                    <div key={movie._id} className="movie-card">
                                        {/* Movie poster placeholder */}
                                        <div className="poster-container">
                                            {movie.poster_path ? (
                                                <img 
                                                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
                                                    alt={movie.title}
                                                    className="poster"
                                                />
                                            ) : (
                                                <div className="poster" style={{backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                                    <span style={{color: '#555'}}>Poster not found</span>
                                                </div>
                                            )}
                                            <div className="rating-badge">
                                                ⭐ {movie.average_rating ? movie.average_rating.toFixed(1) : 'N/A'}
                                            </div>
                                        </div>
                                        
                                        {/* Movie details */}
                                        <div className="movie-content">
                                            <h3 className="movie-title">{movie.title}</h3>
                                            
                                            <div className="movie-meta">
                                                <span className="meta-item">{movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}</span>
                                                <span className="meta-item">{movie.runtime ? `${movie.runtime} min` : 'N/A'}</span>
                                                <span className="meta-item">{movie.original_language || 'N/A'}</span>
                                            </div>
                                            
                                            {/* Genres */}
                                            <div className="genre-container">
                                                {(typeof movie.genres === 'string' ? movie.genres.split(', ') : 
                                                Array.isArray(movie.genres) ? movie.genres : []).slice(0, 3).map((g, i) => (
                                                    <span key={i} className="genre-badge">
                                                        {g}
                                                    </span>
                                                ))}
                                            </div>
                                            
                                            {/* Overview/description truncated */}
                                            <p className="overview">
                                                {movie.overview || 'No description available.'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {/* Pagination */}
                        {!loading && totalMoviesCount > moviesPerPage && (
                            <div className="pagination">
                                <div className="pagination-controls">
                                    <button 
                                        className="pagination-button"
                                        onClick={() => goToPage(currentPage - 1)}
                                        disabled={currentPage === 1}
                                    >
                                        Previous
                                    </button>
                                    
                                    {/* Page numbers */}
                                    <div className="page-numbers">
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            // Show 5 pages around current page
                                            let pageNum;
                                            if (totalPages <= 5) {
                                                pageNum = i + 1;
                                            } else if (currentPage <= 3) {
                                                pageNum = i + 1;
                                            } else if (currentPage >= totalPages - 2) {
                                                pageNum = totalPages - 4 + i;
                                            } else {
                                                pageNum = currentPage - 2 + i;
                                            }
                                            
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => goToPage(pageNum)}
                                                    className={`page-number-button ${
                                                        currentPage === pageNum ? 'active-page-button' : ''
                                                    }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    
                                    <button 
                                        className="pagination-button"
                                        onClick={() => goToPage(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        {/* No results message */}
                        {!loading && filteredMovies.length === 0 && (
                            <div className="no-results">
                                <h2 className="no-results-title">No Movies Found</h2>
                                <p className="no-results-text">Try adjusting your search criteria to find more movies.</p>
                                <button 
                                    className="primary-button"
                                    onClick={goBack}
                                >
                                    Modify Filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MovieResults;