import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import Quill styles
import 'react-quill/dist/quill.bubble.css'; // Optional: Bubble theme styles

// Custom toolbar options
const modules = {
    toolbar: [
        [{ 'size': ['small', 'medium', 'large', 'huge'] }],
        ['bold', 'italic', 'underline'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'align': [] }],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'script': 'sub' }, { 'script': 'super' }],
        ['link', 'image'],
        ['clean'], // Remove the default bullet and numbering options
        ['math'], // Add math button
        ['symbol'] // Add symbol button
    ]
};

const formats = [
    'size',
    'bold', 'italic', 'underline',
    'list', 'bullet',
    'align', 'color', 'background',
    'script',
    'link', 'image',
    'math', // Add math format
    'symbol' // Add symbol format
];

const QuestionForm = () => {
    const [questionData, setQuestionData] = useState({
        questionType: 'text',
        question: '',
        options: ['', '', '', ''],
        subject: '',
        difficulty: '',
        chapter: '',
        answerKey: '',
        standard: ''
    });

    const [chapters, setChapters] = useState({
        Physics: { '11th': [], '12th': [] },
        Chemistry: { '11th': [], '12th': [] },
        Biology: { '11th': [], '12th': [] },
        Maths: { '11th': [], '12th': [] }
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchChapters = async () => {
            setLoading(true);
            try {
                const result = await Axios.get('http://localhost:3000/chapters'); // Replace with your actual endpoint
                const data = result.data;

                const updatedChapters = {
                    Physics: { '11th': [], '12th': [] },
                    Chemistry: { '11th': [], '12th': [] },
                    Biology: { '11th': [], '12th': [] },
                    Maths: { '11th': [], '12th': [] }
                };

                data.forEach(chapter => {
                    if (updatedChapters[chapter.subject]) {
                        updatedChapters[chapter.subject][chapter.standard].push(chapter.name);
                    }
                });

                setChapters(updatedChapters);
            } catch (error) {
                console.error("Error fetching chapters:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchChapters();
    }, []);

    const handleChange = (value, index = null) => {
        if (index !== null) {
            const optionsCopy = [...questionData.options];
            optionsCopy[index] = value;
            setQuestionData({ ...questionData, options: optionsCopy });
        } else {
            setQuestionData({ ...questionData, question: value });
        }
    };

    const handleSubjectChange = (e) => {
        const selectedSubject = e.target.value;
        setQuestionData({ ...questionData, subject: selectedSubject, chapter: '', standard: '' });
    };

    const handleChapterChange = (e) => {
        setQuestionData({ ...questionData, chapter: e.target.value });
    };

    const handleStandardChange = (e) => {
        setQuestionData({ ...questionData, standard: e.target.value, chapter: '' });
    };

    const saveQuestion = async (e) => {
        e.preventDefault();

        const questionPayload = {
            questionType: questionData.questionType,
            question: questionData.question,
            options: questionData.options,
            subject: questionData.subject,
            difficulty: questionData.difficulty,
            chapter: questionData.chapter,
            answerKey: questionData.answerKey,
            standard: questionData.standard
        };

        try {
            await Axios.post('http://localhost:3000/questions', questionPayload);
            alert('Question added successfully!');
            setQuestionData({
                questionType: 'text',
                question: '',
                options: ['', '', '', ''],
                subject: '',
                difficulty: '',
                chapter: '',
                answerKey: '',
                standard: ''
            });
        } catch (error) {
            console.error("Error saving question:", error);
            alert('Failed to add question.');
        }
    };

    // Filter chapters based on selected subject and standard
    const getFilteredChapters = () => {
        if (questionData.subject && questionData.standard) {
            return chapters[questionData.subject][questionData.standard] || [];
        }
        return [];
    };

    return (
        <div className="container mt-4">
            <h2 className="text-center mb-4">Add a New Question</h2>
            <form onSubmit={saveQuestion}>

                {/* Dropdown to select question type (Text only) */}
                <div className="form-group mb-3">
                    <label>Question Type:</label>
                    <select
                        name="questionType"
                        className="form-control"
                        value={questionData.questionType}
                        onChange={(e) => setQuestionData({ ...questionData, questionType: e.target.value })}
                    >
                        <option value="text">Text Question</option>
                    </select>
                </div>

                {/* Conditional rendering based on question type */}
                <div className="form-group mb-3">
                    <label>Question:</label>
                    <ReactQuill
                        value={questionData.question}
                        onChange={(value) => handleChange(value)}
                        placeholder="Enter the question"
                        modules={modules}
                        formats={formats}
                    />
                </div>

                <div className="form-group mb-3">
                    <label>Options:</label>
                    {questionData.options.map((option, index) => (
                        <ReactQuill
                            key={index}
                            value={option}
                            onChange={(value) => handleChange(value, index)}
                            placeholder={`Option ${String.fromCharCode(97 + index)}`}
                            className="mb-2"
                            modules={modules}
                            formats={formats}
                        />
                    ))}
                </div>

                <div className="form-group mb-3">
                    <label>Answer Key:</label>
                    <select
                        name="answerKey"
                        className="form-control"
                        value={questionData.answerKey}
                        onChange={(e) => setQuestionData({ ...questionData, answerKey: e.target.value })}
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
                        <option value="">Select Subject</option>
                        <option value="Chemistry">Chemistry</option>
                        <option value="Physics">Physics</option>
                        <option value="Biology">Biology</option>
                        <option value="Maths">Maths</option>
                    </select>
                </div>

                <div className="form-group mb-3">
                    <label>Standard:</label>
                    <select
                        name="standard"
                        className="form-control"
                        value={questionData.standard}
                        onChange={handleStandardChange}
                    >
                        <option value="">Select Standard</option>
                        <option value="11th">11th</option>
                        <option value="12th">12th</option>
                    </select>
                </div>

                <div className="form-group mb-3">
                    <label>Chapter:</label>
                    {loading ? (
                        <p>Loading chapters...</p>
                    ) : (
                        <select
                            name="chapter"
                            className="form-control"
                            value={questionData.chapter}
                            onChange={handleChapterChange}
                        >
                            <option value="">Select Chapter</option>
                            {getFilteredChapters().map((chapter, index) => (
                                <option key={index} value={chapter}>
                                    {chapter}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                <div className="form-group mb-4">
                    <label>Difficulty Level:</label>
                    <select
                        name="difficulty"
                        className="form-control"
                        value={questionData.difficulty}
                        onChange={(e) => setQuestionData({ ...questionData, difficulty: e.target.value })}
                    >
                        <option value="">Select Level</option>
                        <option value="CET">CET</option>
                        <option value="NEET">NEET</option>
                        <option value="JEE">JEE</option>
                    </select>
                </div>

                <button type="submit" className="btn btn-primary w-100">Save Question</button>
            </form>
        </div>
    );
};

export default QuestionForm;
