import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useParams, useNavigate } from 'react-router-dom';

const EditQuestion = () => {
    const { id } = useParams(); // Get the question ID from the URL
    const navigate = useNavigate(); // For navigation after saving
    const [questionData, setQuestionData] = useState({
        questionType: 'text',
        question: '',
        options: ['', '', '', ''],
        subject: '',
        difficulty: '',
        chapter: '',
        answerKey: ''
    });
    const [chapters, setChapters] = useState({
        Physics: ['Chapter 1', 'Chapter 2'],
        Chemistry: ['Chapter 1', 'Chapter 2'],
        Biology: ['Chapter 1', 'Chapter 2'],
        Maths: ['Chapter 1', 'Chapter 2']
    });
    const [dynamicChapters, setDynamicChapters] = useState({
        Physics: [],
        Chemistry: [],
        Biology: [],
        Maths: []
    });

    useEffect(() => {
        // Fetch the question data when the component mounts
        const fetchQuestion = async () => {
            try {
                const result = await Axios.get(`http://localhost:3000/questions/${id}`);
                const data = result.data;

                // Set the fetched data to the state
                setQuestionData({
                    ...data
                });
            } catch (error) {
                console.error("Error fetching question data:", error);
            }
        };

        fetchQuestion();
    }, [id]);

    const handleChange = (e, index = null) => {
        const { name, value } = e.target;

        if (index !== null) {
            const optionsCopy = [...questionData.options];
            optionsCopy[index] = value;
            setQuestionData({ ...questionData, options: optionsCopy });
        } else {
            setQuestionData({ ...questionData, [name]: value });
        }
    };

    const handleSubjectChange = (e) => {
        const selectedSubject = e.target.value;
        setQuestionData({ ...questionData, subject: selectedSubject, chapter: '' });
    };

    const handleChapterChange = (e) => {
        setQuestionData({ ...questionData, chapter: e.target.value });
    };

    const addChapter = () => {
        if (questionData.subject && questionData.chapter) {
            const updatedDynamicChapters = {
                ...dynamicChapters,
                [questionData.subject]: [...dynamicChapters[questionData.subject], questionData.chapter]
            };
            setDynamicChapters(updatedDynamicChapters);
            setQuestionData({ ...questionData, chapter: '' });
        }
    };

    const saveQuestion = async (e) => {
        e.preventDefault();

        const questionPayload = {
            ...questionData
        };

        try {
            await Axios.put(`http://localhost:3000/questions/${id}`, questionPayload);
            alert('Question updated successfully!');
            navigate('/questions'); // Redirect to the question list
        } catch (error) {
            console.error("Error updating question:", error);
        }
    };

    return (
        <div className="container mt-4">
            <h2 className="text-center mb-4">Edit Question</h2>
            <form onSubmit={saveQuestion}>

                {/* Dropdown to select question type (Text only) */}
                <div className="form-group mb-3">
                    <label>Question Type:</label>
                    <select
                        name="questionType"
                        className="form-control"
                        value={questionData.questionType}
                        onChange={(e) => setQuestionData({ ...questionData, questionType: e.target.value })}
                        disabled
                    >
                        <option value="text">Text Question</option>
                    </select>
                </div>

                {/* Only render text question input */}
                <div className="form-group mb-3">
                    <label>Question:</label>
                    <input
                        type="text"
                        name="question"
                        className="form-control"
                        value={questionData.question}
                        onChange={handleChange}
                        placeholder="Enter the question"
                    />
                </div>

                <div className="form-group mb-3">
                    <label>Options:</label>
                    {questionData.options.map((option, index) => (
                        <input
                            key={index}
                            type="text"
                            className="form-control mb-2"
                            value={option}
                            onChange={(e) => handleChange(e, index)}
                            placeholder={`Option ${String.fromCharCode(97 + index)}`}
                        />
                    ))}
                </div>

                <div className="form-group mb-3">
                    <label>Answer Key:</label>
                    <select
                        name="answerKey"
                        className="form-control"
                        value={questionData.answerKey}
                        onChange={handleChange}
                    >
                        <option value="">Select an option</option>
                        <option value="a">a</option>
                        <option value="b">b</option>
                        <option value="c">c</option>
                        <option value="d">d</option>
                    </select>
                </div>

                <div className="form-group mb-3">
                    <label>Subject:</label>
                    <select
                        name="subject"
                        className="form-control"
                        value={questionData.subject}
                        onChange={handleSubjectChange}
                    >
                        <option value="">Select a subject</option>
                        <option value="Physics">Physics</option>
                        <option value="Chemistry">Chemistry</option>
                        <option value="Biology">Biology</option>
                        <option value="Maths">Maths</option>
                    </select>
                </div>

                <div className="form-group mb-3">
                    <label>Chapter Name:</label>
                    <div className="d-flex">
                        <select
                            className="form-control me-2"
                            value={questionData.chapter}
                            onChange={handleChapterChange}
                        >
                            <option value="">Select a chapter</option>
                            {(chapters[questionData.subject] || []).concat(dynamicChapters[questionData.subject] || []).map((chapter, index) => (
                                <option key={index} value={chapter}>{chapter}</option>
                            ))}
                        </select>
                        <input
                            type="text"
                            className="form-control me-2"
                            value={questionData.chapter}
                            onChange={handleChapterChange}
                            placeholder="Add new chapter"
                        />
                        <button type="button" className="btn btn-secondary" onClick={addChapter}>Add Chapter</button>
                    </div>
                </div>

                <div className="form-group mb-4">
                    <label>Exam</label>
                    <select
                        name="difficulty"
                        className="form-control"
                        value={questionData.difficulty}
                        onChange={handleChange}
                    >
                        <option value="">Select option</option>
                        <option value="CET">CET</option>
                        <option value="NEET">NEET</option>
                        <option value="JEE">JEE</option>
                    </select>
                </div>

                <button type="submit" className="btn btn-primary w-100">Update Question</button>
            </form>
        </div>
    );
};

export default EditQuestion;
