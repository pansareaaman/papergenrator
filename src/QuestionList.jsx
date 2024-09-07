// src/QuestionList.js
import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const QuestionList = () => {
    const [questions, setQuestions] = useState([]);
    const [filteredQuestions, setFilteredQuestions] = useState([]);
    const [filter, setFilter] = useState('');
    const [filterType, setFilterType] = useState('chapter'); // Default filter type
    const [chapters, setChapters] = useState([]); // To store unique chapter names

    // Fetch questions from the backend
    const fetchQuestions = async () => {
        try {
            const result = await Axios.get('http://localhost:3000/questions');
            const sortedQuestions = result.data.sort((a, b) => {
                if (a.chapter < b.chapter) return -1;
                if (a.chapter > b.chapter) return 1;
                return 0;
            });
            setQuestions(sortedQuestions);
            setFilteredQuestions(sortedQuestions);
            
            // Extract unique chapters for dropdown
            const uniqueChapters = [...new Set(sortedQuestions.map(q => q.chapter))];
            setChapters(uniqueChapters);
        } catch (error) {
            console.error("Error fetching questions:", error);
        }
    };

    // Filter questions based on selected filter type and filter value
    const applyFilter = () => {
        const filtered = questions.filter(question => {
            if (filterType === 'chapter') {
                return filter ? question.chapter === filter : true;
            } else if (filterType === 'subject') {
                return filter ? question.subject.toLowerCase().includes(filter.toLowerCase()) : true;
            }
            return true;
        });
        setFilteredQuestions(filtered);
    };

    // Handle filter input changes
    const handleFilterChange = (e) => {
        setFilter(e.target.value);
    };

    // Handle filter type changes
    const handleFilterTypeChange = (e) => {
        setFilterType(e.target.value);
        setFilter(''); // Clear the filter input when changing filter type
    };

    // Handle chapter dropdown change
    const handleChapterChange = (e) => {
        setFilter(e.target.value);
    };

    // Apply filter whenever filter criteria or filter type changes
    useEffect(() => {
        applyFilter();
    }, [filter, filterType, questions]);

    // Fetch questions on component mount
    useEffect(() => {
        fetchQuestions();
    }, []);

    // Delete a question by id
    const deleteQuestion = async (id) => {
        try {
            await Axios.delete(`http://localhost:3000/questions/${id}`);
            fetchQuestions(); // Refresh the list
        } catch (error) {
            console.error("Error deleting question:", error);
        }
    };

    return (
        <div className="container mt-4">
            <h2 className="text-center mb-4">All Questions</h2>
            
            {/* Filter Section */}
            <div className="mb-4">
                <h4>Filter Questions</h4>
                <div className="form-group mb-3">
                    <label>Filter By:</label>
                    <select
                        className="form-control"
                        value={filterType}
                        onChange={handleFilterTypeChange}
                    >
                        <option value="chapter">Chapter</option>
                        <option value="subject">Subject</option>
                    </select>
                </div>
                {filterType === 'chapter' ? (
                    <div className="form-group">
                        <label>Chapter:</label>
                        <select
                            className="form-control"
                            value={filter}
                            onChange={handleChapterChange}
                        >
                            <option value="">Select a chapter</option>
                            {chapters.map((chapter, index) => (
                                <option key={index} value={chapter}>{chapter}</option>
                            ))}
                        </select>
                    </div>
                ) : (
                    <div className="form-group">
                        <label>Subject:</label>
                        <input
                            type="text"
                            className="form-control"
                            value={filter}
                            onChange={handleFilterChange}
                            placeholder="Enter subject name"
                        />
                    </div>
                )}
            </div>

            {/* Questions Table */}
            <table className="table table-bordered table-striped">
                <thead className="thead-dark">
                    <tr>
                        <th>Question</th>
                        <th>Subject</th>
                        <th>Exam</th>
                        <th>Chapter</th>
                        <th>Answer Key</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredQuestions.map((question) => (
                        <tr key={question.id}>
                            <td>{question.question}</td>
                            <td>{question.subject}</td>
                            <td>{question.difficulty}</td>
                            <td>{question.chapter}</td>
                            <td>{question.answerKey}</td>
                            <td>
                                <Link to={`/edit/${question.id}`} className="btn btn-warning btn-sm mr-2">Edit</Link>
                                <button className="btn btn-danger btn-sm" onClick={() => deleteQuestion(question.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default QuestionList;
