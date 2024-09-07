import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './printStyles.css';
import htmlDocx from 'html-docx-js/dist/html-docx';

const GeneratePaper = () => {
    const [questions, setQuestions] = useState([]);
    const [criteria, setCriteria] = useState({ subject: '', difficulty: '', chapter: '' });
    const [filteredQuestions, setFilteredQuestions] = useState([]);
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [showAnswerKey, setShowAnswerKey] = useState(false);
    const [chapters, setChapters] = useState([]);
    const [title, setTitle] = useState('');
    const [marksPerQuestion, setMarksPerQuestion] = useState(1); // Marks per question
    const [time, setTime] = useState('');
    const [font, setFont] = useState('Arial');
    const [fontSize, setFontSize] = useState('12px');
    const [maxQuestions, setMaxQuestions] = useState(10); // State for dynamic maximum questions

    const fetchQuestions = async () => {
        const result = await Axios.get('http://localhost:3000/questions');
        setQuestions(result.data);
        const uniqueChapters = Array.from(new Set(result.data.map(q => q.chapter)));
        setChapters(uniqueChapters);
    };

    useEffect(() => {
        fetchQuestions();
    }, []);

    useEffect(() => {
        if (criteria.subject) {
            const subjectChapters = questions
                .filter(question => question.subject === criteria.subject)
                .map(question => question.chapter);
            setChapters(Array.from(new Set(subjectChapters)));
        } else {
            setChapters([]);
        }
    }, [criteria.subject, questions]);

    const filterQuestions = () => {
        const filtered = questions.filter((question) => {
            return (
                (criteria.subject ? question.subject === criteria.subject : true) &&
                (criteria.difficulty ? question.difficulty === criteria.difficulty : true) &&
                (criteria.chapter ? question.chapter === criteria.chapter : true)
            );
        });

        const sortedFiltered = criteria.chapter
            ? filtered.sort((a, b) => a.chapter.localeCompare(b.chapter))
            : filtered;

        setFilteredQuestions(sortedFiltered);
    };

    const toggleQuestionSelection = (question) => {
        if (selectedQuestions.length >= maxQuestions && !selectedQuestions.find((q) => q.id === question.id)) {
            alert(`You can select a maximum of ${maxQuestions} questions.`);
            return;
        }
        const exists = selectedQuestions.find((q) => q.id === question.id);
        if (exists) {
            setSelectedQuestions(selectedQuestions.filter((q) => q.id !== question.id));
        } else {
            setSelectedQuestions([...selectedQuestions, question]);
        }
    };

    const handleRemoveQuestion = (questionId) => {
        setSelectedQuestions(selectedQuestions.filter(q => q.id !== questionId));
    };

    const calculateTotalMarks = () => {
        return selectedQuestions.length * marksPerQuestion;
    };

    const generateDocx = (content, title) => {
        const doc = htmlDocx.asBlob(content);
        const link = document.createElement('a');
        link.href = URL.createObjectURL(doc);
        link.download = `${title}.docx`;
        link.click();
    };

    const handleDownloadDocx = (type) => {
        const contentId = type === 'questions' ? 'print-questions' : 'print-answer-key';
        const content = document.getElementById(contentId).innerHTML;
        const formattedContent = `
            <html>
                <head>
                    <style>
                        body { font-family: ${font}; font-size: ${fontSize}; }
                    </style>
                </head>
                <body>
                    ${content}
                </body>
            </html>
        `;
        generateDocx(formattedContent, type === 'questions' ? 'Question_Paper' : 'Answer_Key');
    };

    const handlePrint = (type) => {
        const printContent = document.getElementById(type === 'questions' ? 'print-questions' : 'print-answer-key').innerHTML;
        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write('<html><head><title>Print</title>');
        printWindow.document.write(`<style>body { font-family: ${font}; font-size: ${fontSize}; }</style>`);
        printWindow.document.write('</head><body >');
        printWindow.document.write(printContent);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };

    const toggleAnswerKeyDisplay = () => {
        setShowAnswerKey(!showAnswerKey);
    };

    const formatAnswerKey = () => {
        return (
            <div style={{ padding: '10px' }}>
                {selectedQuestions.map((question, index) => (
                    <div
                        key={index}
                        style={{
                            border: '1px solid black',
                            padding: '8px',
                            marginBottom: '4px',
                            display: 'inline-block',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {index + 1}) {question.answerKey}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="container mt-4">
            <h2 className="text-center mb-4">Generate Question Paper</h2>
            <div className="row mb-4">
                <div className="col-md-4">
                    <div className="form-group">
                        <label>Subject:</label>
                        <select
                            className="form-control"
                            value={criteria.subject}
                            onChange={(e) => setCriteria({ ...criteria, subject: e.target.value, chapter: '' })}
                        >
                            <option value="">Select a subject</option>
                            <option value="Physics">Physics</option>
                            <option value="Chemistry">Chemistry</option>
                            <option value="Biology">Biology</option>
                            <option value="Maths">Maths</option>
                        </select>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="form-group">
                        <label>Chapter:</label>
                        <select
                            className="form-control"
                            value={criteria.chapter}
                            onChange={(e) => setCriteria({ ...criteria, chapter: e.target.value })}
                        >
                            <option value="">Select a chapter</option>
                            {chapters.map((chapter, index) => (
                                <option key={index} value={chapter}>{chapter}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="form-group">
                        <label>Exam:</label>
                        <select
                            className="form-control"
                            value={criteria.difficulty}
                            onChange={(e) => setCriteria({ ...criteria, difficulty: e.target.value })}
                        >
                            <option value="">All</option>
                            <option value="CET">CET</option>
                            <option value="NEET">NEET</option>
                            <option value="JEE">JEE</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="row mb-4">
                <div className="col-md-4">
                    <div className="form-group">
                        <label>Max Questions:</label>
                        <input
                            type="number"
                            className="form-control"
                            value={maxQuestions}
                            onChange={(e) => setMaxQuestions(Number(e.target.value))}
                        />
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="form-group">
                        <label>Marks Per Question:</label>
                        <input
                            type="number"
                            className="form-control"
                            value={marksPerQuestion}
                            onChange={(e) => setMarksPerQuestion(Number(e.target.value))}
                        />
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="form-group">
                        <label>Title:</label>
                        <input
                            type="text"
                            className="form-control"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                </div>
                <div className="col-md-6 mt-2">
                    <div className="form-group">
                        <label>Time:</label>
                        <input
                            type="text"
                            className="form-control"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                        />
                    </div>
                </div>
                <div className="col-md-6 mt-2">
                    <div className="form-group">
                        <label>Font:</label>
                        <select
                            className="form-control"
                            value={font}
                            onChange={(e) => setFont(e.target.value)}
                        >
                            <option value="Arial">Arial</option>
                            <option value="Times New Roman">Times New Roman</option>
                            <option value="Courier New">Courier New</option>
                            <option value="Georgia">Georgia</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Font Size:</label>
                        <select
                            className="form-control"
                            value={fontSize}
                            onChange={(e) => setFontSize(e.target.value)}
                        >
                            <option value="12px">12px</option>
                            <option value="14px">14px</option>
                            <option value="16px">16px</option>
                            <option value="18px">18px</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="text-center mb-4">
                <button className="btn btn-primary" onClick={filterQuestions}>Filter Questions</button>
            </div>

            <h3 className="text-center">Select Questions ({selectedQuestions.length}/{maxQuestions})</h3>
            <ul className="list-group">
                {filteredQuestions.map((question, index) => (
                    <li key={question.id} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            <strong>{index + 1}. </strong>
                            <span dangerouslySetInnerHTML={{ __html: question.question }}></span>
                            <ol type='1'>
                                {question.options.map((option, idx) => (
                                    <li key={idx} dangerouslySetInnerHTML={{ __html: option }}></li>
                                ))}
                            </ol>
                            <div><strong>Chapter:</strong> {question.chapter}</div>
                            <div><strong>Answer Key:</strong> {question.answerKey}</div>
                        </div>
                        <input
                            type="checkbox"
                            onChange={() => toggleQuestionSelection(question)}
                            checked={selectedQuestions.find((q) => q.id === question.id) ? true : false}
                        />
                    </li>
                ))}
            </ul>

            <div className="mt-4">
                <h3 className="text-center">Preview of Selected Questions</h3>
                <div
                    style={{
                        fontFamily: font,
                        fontSize: fontSize
                    }}
                >
                    <center>
                        <h2 className="text-center mt-4">{title}</h2>
                    </center>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <p><strong>Marks Per Question:</strong> {marksPerQuestion}</p>
                        <p><strong>Total Marks:</strong> {calculateTotalMarks()}</p>
                        <p><strong>Time:</strong> {time}</p>
                    </div>

                    <hr />
                    <ul>
                        {selectedQuestions.map((question, index) => (
                            <li key={question.id} className="d-flex justify-content-between align-items-center">
                                <div>
                                    <strong>{index + 1}. </strong>
                                    <span dangerouslySetInnerHTML={{ __html: question.question }}></span>
                                    <ol type='a'>
                                        {question.options.map((option, idx) => (
                                            <li key={idx} dangerouslySetInnerHTML={{ __html: option }}></li>
                                        ))}
                                    </ol>
                                </div>
                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleRemoveQuestion(question.id)}
                                >
                                    Remove
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="mt-4 text-center">
                <button className="btn btn-success mr-2" onClick={() => handleDownloadDocx('questions')}>Download Question Paper Word</button>
                <button className="btn btn-secondary mr-2" onClick={() => handlePrint('questions')}>Print Question Paper</button>
                <button className="btn btn-secondary" onClick={() => handlePrint('answerKey')}>Print Answer Key</button>
                <button className="btn btn-info" onClick={toggleAnswerKeyDisplay}>{showAnswerKey ? 'Hide Answer Key' : 'Show Answer Key'}</button>
            </div>

            {showAnswerKey && (
                <div
                    id="print-answer-key"
                    style={{
                        fontFamily: font,
                        fontSize: fontSize,
                        border: '1px solid black',
                        padding: '10px',
                        marginTop: '20px'
                    }}
                >
                    <h2 className="text-center mt-4">Answer Key</h2>
                    <div>
                        {formatAnswerKey()}
                    </div>
                </div>
            )}

            <div
                id="print-questions"
                style={{
                    display: 'none',
                    fontFamily: font,
                    fontSize: fontSize
                }}
            >
                <center>
                    <h2 className="text-center mt-4">{title}</h2>
                </center>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <p><strong>Marks Per Question:</strong> {marksPerQuestion}</p>
                    <p><strong>Total Marks:</strong> {calculateTotalMarks()}</p>
                    <p><strong>Time:</strong> {time}</p>
                </div>

                <hr />
                <ul>
                    {selectedQuestions.map((question, index) => (
                        <li key={question.id}>
                            <strong>{index + 1}. </strong>
                            <span dangerouslySetInnerHTML={{ __html: question.question }}></span>
                            <ol type='a'>
                                {question.options.map((option, idx) => (
                                    <li key={idx} dangerouslySetInnerHTML={{ __html: option }}></li>
                                ))}
                            </ol>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default GeneratePaper;
