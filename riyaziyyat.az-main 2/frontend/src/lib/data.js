// Initial data for the math exam system
export const getInitialStudents = () => {
  return [
    {
      id: "1",
      name: "Nijat",
      surname: "Qəsynli", 
      email: "nijatqəsynli59",
      pass: "nijat123",
      group: "10(1,3)",
      class: "10a",
      parentContact: "+994501234567",
      status: "active"
    },
    {
      id: "2", 
      name: "Aynur",
      surname: "Məmmədova",
      email: "aynur.mammadova",
      pass: "aynur123",
      group: "10(1,3)", 
      class: "10a",
      parentContact: "+994501234568",
      status: "active"
    },
    {
      id: "3",
      name: "Fuad", 
      surname: "Əliyev",
      email: "fuad.aliyev",
      pass: "fuad123",
      group: "11S",
      class: "11a", 
      parentContact: "+994501234569",
      status: "disabled"
    }
  ];
};

export const getInitialGroups = () => {
  return [
    "10(1,3)",
    "11S", 
    "9A",
    "10B"
  ];
};

export const getInitialExams = () => {
  return [
    {
      id: "exam1",
      title: "Quiz",
      description: "Bacarıqlarınızın qiymətləndirilməsi.",
      questionsCount: 1,
      groups: ["10(1,3)"],
      startTime: "2025-09-21T23:44:00",
      endTime: "2025-09-22T00:44:00",
      pointsPerQuestion: 10,
      status: "live", // live, finished, upcoming
      questions: [
        {
          question: "x² + 5x + 6 = 0 tənliyinin köklərini tapın",
          type: "multiple-choice",
          options: ["x = -2, x = -3", "x = 2, x = 3", "x = -1, x = -6", "x = 1, x = 6"],
          correctAnswer: "x = -2, x = -3",
          imageUrl: null
        }
      ]
    },
    {
      id: "exam2", 
      title: "3",
      description: "Bacarıqlarınızın qiymətləndirilməsi.",
      questionsCount: 1,
      groups: ["10(1,3)"],
      startTime: "2025-09-23T10:00:00", 
      endTime: "2025-09-23T12:00:00",
      pointsPerQuestion: 10,
      status: "upcoming",
      questions: [
        {
          question: "İnteqralı hesablayın: ∫x²dx",
          type: "free-form", 
          correctAnswer: "x³/3 + C",
          imageUrl: null
        }
      ]
    }
  ];
};

export const getInitialSubmissions = () => {
  return [
    {
      id: "sub1",
      examId: "exam1", 
      studentId: "1",
      answers: {0: "x = -2, x = -3"},
      submittedAt: "2025-09-21T23:45:38",
      cheatingDetected: false,
      score: 0
    }
  ];
};

export const mathSymbols = [
  '√', '∛', '²', '³', 'π', 'Σ', '∫', '≠', '≤', '≥', '+', '-', '×', '÷', '∞', '°', '±'
];