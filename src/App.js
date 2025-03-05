import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MovieFilter from './MovieFilter';
import MovieResults from './MovieResults';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MovieFilter />} />
        <Route path="/results" element={<MovieResults />} />
      </Routes>
    </Router>
  );
}

export default App;