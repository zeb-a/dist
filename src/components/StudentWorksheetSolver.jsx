
import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import api from '../services/api'; // Adjust the path if your folder structure is different

const StudentWorksheetSolver = ({ worksheet, onClose, studentName, studentId, classId, classes, setClasses }) => {
  const [answers, setAnswers] = useState({});

  const handleAnswerChange = (questionId, value, questionType) => {
    if (questionType === 'blank') {
      // For fill-in-blanks, we need to process the question text to extract blank positions
      const blanks = worksheet.questions.find(q => q.id === questionId)?.question.match(/\[blank\]/gi);
      if (blanks) {
        // Store array of answers for multiple blanks
        const currentAnswers = Array.isArray(answers[questionId]) ? [...answers[questionId]] : [];
        currentAnswers[value.index] = value.answer;
        setAnswers(prev => ({
          ...prev,
          [questionId]: currentAnswers
        }));
      }
    } else if (questionType === 'match') {
      // For matching questions, store object with pairs
      const currentMatches = answers[questionId] || {};
      setAnswers(prev => ({
        ...prev,
        [questionId]: {
          ...currentMatches,
          [value.key]: value.value
        }
      }));
    } else {
      setAnswers(prev => ({
        ...prev,
        [questionId]: value
      }));
    }
  };

const handleSubmit = async () => {
  // 1. Critical Check: Ensure classId is a string and not an object
  const cleanClassId = typeof classId === 'object' ? classId.id : classId;

const submissionData = {
  class_id: String(cleanClassId),         // Force to String
  student_id: String(studentId),         // Force to String
  student_name: String(studentName),     // Force to String
  assignment_id: String(worksheet.id),   // THIS WAS THE ERROR - Force to String
  assignment_title: String(worksheet.title || 'Untitled'),
  answers: answers || {},                // Keep as object (for JSON field)
  status: 'submitted'
};

  try {
    console.log("Attempting submission with data:", submissionData);
    
    await api.pbRequest('/collections/submissions/records', {
      method: 'POST',
      body: JSON.stringify(submissionData)
    });

    alert("Success! Your work has been submitted.");
    onClose();
  } catch (err) {
    console.error("SUBMISSION REJECTED BY POCKETBASE:");
    // This will print the exact field name that is failing
    console.table(err.body?.data || { error: err.message });
    alert("Submission failed. Check the 'Console' for the specific field error.");
  }
};
  const renderQuestionInput = (question) => {
    switch (question.type) {
      case 'choice':
        return (
          <div style={{ display: 'grid', gap: '10px' }}>
            {question.options.map((opt, oIdx) => (
              <button
                key={oIdx}
                onClick={() => handleAnswerChange(question.id, opt, question.type)}
                style={{
                  padding: '15px', borderRadius: '12px', textAlign: 'left', border: '2px solid',
                  borderColor: answers[question.id] === opt ? '#6366F1' : '#E2E8F0',
                  background: answers[question.id] === opt ? '#EEF2FF' : '#fff',
                  fontWeight: 600, cursor: 'pointer'
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        );

      case 'blank':
        // Process the question text to find blanks
        const parts = question.question.split('[blank]');
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
              {parts.map((part, index) => (
                <React.Fragment key={index}>
                  <span style={{ marginRight: '5px' }}>{part}</span>
                  {index < parts.length - 1 && (
                    <input
                      style={{
                        width: '80px',
                        padding: '8px',
                        margin: '0 5px',
                        borderRadius: '8px',
                        border: '2px solid #E2E8F0',
                        fontSize: '16px'
                      }}
                      placeholder="Answer"
                      onChange={(e) => handleAnswerChange(question.id, { index, answer: e.target.value }, question.type)}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        );

      case 'match':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {question.pairs.map((pair, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ flex: 1, padding: '10px', background: '#F1F5F9', borderRadius: '8px' }}>
                  {pair.left}
                </div>
                <div style={{ width: '30px', textAlign: 'center' }}>→</div>
                <input
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: '2px solid #E2E8F0',
                    fontSize: '16px'
                  }}
                  placeholder={`Match for "${pair.left}"`}
                  onChange={(e) => handleAnswerChange(question.id, { key: pair.left, value: e.target.value }, question.type)}
                />
              </div>
            ))}
          </div>
        );

      case 'comprehension':
        return (
          <textarea
            style={{
              width: '100%',
              padding: '15px',
              borderRadius: '12px',
              border: '2px solid #E2E8F0',
              fontSize: '16px',
              minHeight: '120px',
              resize: 'vertical'
            }}
            placeholder="Type your answer here..."
            onChange={(e) => handleAnswerChange(question.id, e.target.value, question.type)}
          />
        );

      default: // text and other types
        return (
          <input
            style={{
              width: '100%',
              padding: '15px',
              borderRadius: '12px',
              border: '2px solid #E2E8F0',
              fontSize: '16px'
            }}
            placeholder="Type your answer here..."
            onChange={(e) => handleAnswerChange(question.id, e.target.value, question.type)}
          />
        );
    }
  };

  return (
    <div style={{ background: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ 
  padding: '15px 30px', 
  background: '#fff', 
  borderBottom: '1px solid #E2E8F0', 
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'center',
  position: 'sticky',
  top: 0,
  zIndex: 10
}}>
  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
      <ChevronLeft size={24} />
    </button>
    <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#1E293B' }}>{worksheet.title}</h2>
  </div>

  <button 
    onClick={handleSubmit} 
    className="submit-pulse-button"
    style={{ 
      background: '#4F46E5', 
      color: '#fff', 
      border: 'none', 
      padding: '12px 28px', 
      borderRadius: '14px', 
      fontWeight: 800, 
      cursor: 'pointer',
      fontSize: '15px',
      boxShadow: '0 4px 14px 0 rgba(79, 70, 229, 0.39)',
      transition: 'all 0.2s ease'
    }}
  >
    Finish & Submit
  </button>

  <style>{`
    @keyframes pulse-indigo {
      0% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.7); }
      70% { box-shadow: 0 0 0 10px rgba(79, 70, 229, 0); }
      100% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0); }
    }
    .submit-pulse-button:hover {
      transform: scale(1.05);
      background: #4338CA;
    }
    /* Optional: Make it pulse only when they reach the end */
    .submit-pulse-button {
      animation: pulse-indigo 2s infinite;
    }
  `}</style>
</header>

     
<main style={{ flex: 1, overflowY: 'auto', padding: '40px 20px', background: '#F8FAFC' }}>
  <div style={{ maxWidth: '720px', margin: '0 auto' }}>
    {worksheet.questions.map((q, idx) => (
      <div key={q.id} style={{ 
        background: '#fff', 
        borderRadius: '32px', // Ultra-rounded
        padding: '40px', 
        marginBottom: '30px', 
        border: '1px solid #E2E8F0',
        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.02)' 
      }}>
        {/* Question Number Badge */}
        <div style={{ 
          display: 'inline-block',
          background: '#F1F5F9',
          padding: '4px 12px',
          borderRadius: '10px',
          fontSize: '12px',
          fontWeight: 900,
          color: '#64748B',
          marginBottom: '20px'
        }}>
          QUESTION {idx + 1}
        </div>

        {q.paragraph && (
          <div style={{ 
            background: '#F8FAFC', 
            padding: '24px', 
            borderRadius: '20px', 
            borderLeft: '4px solid #6366F1',
            marginBottom: '20px',
            fontSize: '17px',
            lineHeight: '1.7',
            color: '#334155'
          }}>
            {q.paragraph}
          </div>
        )}

        <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', marginBottom: '24px' }}>
          {q.question}
        </h3>

        {/* Input fields/Options should follow the same border-radius (16px) */}
      </div>
    ))}
  </div>
</main>
    </div>
  );
};

export default StudentWorksheetSolver;