import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Navbar';
import QuestionForm from './QuestionForm';
import QuestionList from './QuestionList';
import GeneratePaper from './GeneratePaper';
import EditQuestion from './EditQuestion'; // Import the new EditQuestion component
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<QuestionForm />} />
                <Route path="/questions" element={<QuestionList />} />
                <Route path="/generate" element={<GeneratePaper />} />
                <Route path="/edit/:id" element={<EditQuestion />} /> {/* Add the route for editing questions */}
            </Routes>
        </Router>
    );
};

export default App;
