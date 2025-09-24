import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Send, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { toast } from "sonner";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Timer Component
const ExamTimer = ({ endTime, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const difference = end - now;
      
      if (difference > 0) {
        return Math.floor(difference / 1000);
      }
      return 0;
    };

    const updateTimer = () => {
      const seconds = calculateTimeLeft();
      setTimeLeft(seconds);
      
      if (seconds <= 0) {
        onTimeUp();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [endTime, onTimeUp]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isUrgent = timeLeft <= 300; // 5 minutes or less

  return (
    <Card className={`sticky top-24 ${isUrgent ? 'border-destructive bg-destructive/5 timer-urgent' : ''}`}>
      <CardHeader className="pb-3">
        <CardTitle className={`text-center font-mono text-2xl ${isUrgent ? 'text-destructive' : ''}`}>
          {formatTime(timeLeft)}
        </CardTitle>
        <CardDescription className="text-center">
          {isUrgent ? "Vaxt bitir!" : "Qalan vaxt"}
        </CardDescription>
      </CardHeader>
    </Card>
  );
};

export default function StudentExam() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const currentStudent = JSON.parse(localStorage.getItem("currentStudent") || "{}");
  const cheatingDetectedRef = useRef(false);

  useEffect(() => {
    fetchExam();
    initializeAntiCheat();
    
    return () => {
      // Cleanup event listeners
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [examId]);

  const fetchExam = async () => {
    try {
      const response = await axios.get(`${API}/exams/${examId}`);
      setExam(response.data);
      
      // Check for announcements
      const savedAnnouncement = localStorage.getItem(`announcement_${examId}`);
      if (savedAnnouncement) {
        setAnnouncement(savedAnnouncement);
      }
    } catch (error) {
      console.error("Failed to fetch exam:", error);
      toast.error("Xəta", {
        description: "İmtahan yüklənərkən xəta baş verdi."
      });
      navigate("/student/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const initializeAntiCheat = () => {
    // Request fullscreen
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn("Could not enter fullscreen:", err);
      });
    }

    // Add event listeners for anti-cheating
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    // Prevent right-click context menu
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    
    // Prevent common keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Prevent Alt+Tab, Ctrl+Tab, F11, etc.
      if (
        (e.altKey && e.key === 'Tab') ||
        (e.ctrlKey && e.key === 'Tab') ||
        e.key === 'F11' ||
        (e.ctrlKey && (e.key === 'r' || e.key === 'R')) || // Refresh
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i')) // Dev tools
      ) {
        e.preventDefault();
        handleCheatingDetected();
      }
    });
  };

  const handleVisibilityChange = () => {
    if (document.hidden) {
      handleCheatingDetected();
    }
  };

  const handleFullscreenChange = () => {
    if (!document.fullscreenElement) {
      handleCheatingDetected();
    }
  };

  const handleCheatingDetected = () => {
    if (!cheatingDetectedRef.current) {
      cheatingDetectedRef.current = true;
      handleFinishExam(true);
    }
  };

  const handleFinishExam = async (cheating = false) => {
    if (submitting) return; // Prevent double submission
    
    setSubmitting(true);
    
    try {
      const submission = {
        examId,
        studentId: currentStudent.id,
        answers,
        submittedAt: new Date().toISOString(),
        cheatingDetected: cheating
      };

      console.log("Submitting exam:", submission); // Debug log

      const response = await axios.post(`${API}/submissions`, submission);
      console.log("Submission response:", response.data); // Debug log

      if (cheating) {
        toast.error("Köçürmə Təsbit Olundu!", {
          description: "Köçürdüyünüz təsbit olundu, bu səbəbdən imtahandan xaric olundunuz. Müəllim bu barədə məlumatlandırılacaq.",
          duration: 10000
        });
      } else {
        toast.success("Cavablarınız qəbul edildi!", {
          description: "Nəticələr açıqlandıqda müəlliminiz sizi məlumatlandıracaq."
        });
      }

      // Clean up event listeners
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('contextmenu', (e) => e.preventDefault());

      // Exit fullscreen before navigating
      if (document.exitFullscreen && document.fullscreenElement) {
        await document.exitFullscreen().catch(() => {});
      }

      // Small delay to ensure cleanup
      setTimeout(() => {
        navigate("/student/dashboard");
      }, 1000);
      
    } catch (error) {
      console.error("Failed to submit exam:", error);
      toast.error("Xəta", {
        description: "Cavablar təqdimatı zamanı xəta baş verdi. Yenidən cəhd edin."
      });
      setSubmitting(false);
    }
  };

  const handleAnswerChange = (questionIndex, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const handleTimeUp = () => {
    toast.warning("Vaxt bitdi!", {
      description: "İmtahan vaxtı bitdi, cavablarınız avtomatik təqdim edildi."
    });
    handleFinishExam(false);
  };

  const handleGoBack = () => {
    // Exit fullscreen before navigating
    if (document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
    navigate("/student/dashboard");
  };

  if (loading) {
    return (
      <div className="exam-fullscreen">
        <div className="container mx-auto py-8 px-4">
          <div className="loading-shimmer h-96 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="exam-fullscreen">
        <div className="container mx-auto py-8 px-4">
          <Card>
            <CardContent className="text-center py-12">
              <h3 className="text-xl font-medium text-muted-foreground">
                İmtahan tapılmadı
              </h3>
              <Button onClick={handleGoBack} className="mt-4">
                Geri Qayıt
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="exam-fullscreen">
      {/* Announcement Banner */}
      {announcement && (
        <div className="bg-blue-500 text-white p-4 text-center relative">
          <div className="font-medium">📢 Elan</div>
          <div className="mt-1">{announcement}</div>
          <button 
            onClick={() => setAnnouncement("")}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-200"
          >
            ✕
          </button>
        </div>
      )}
      
      <div className="container mx-auto py-4 px-4">
        <div className="grid gap-4 lg:grid-cols-4">
          {/* Main Content Area */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-2xl">{exam.title}</CardTitle>
                <CardDescription>
                  Sualları diqqətlə oxuyun və cavablarınızı daxil edin. Şəkil olan suallar üçün şəkli diqqətlə incələyin.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-8">
                {exam.questions.map((question, index) => (
                  <Card key={index} className="p-6">
                    <div className="space-y-4">
                      {/* Question Text */}
                      <Label className="text-base font-medium">
                        Sual {index + 1}: {question.question}
                      </Label>
                      
                      {/* Question Image */}
                      {question.imageUrl && (
                        <div className="relative h-64 question-image">
                          <img
                            src={question.imageUrl}
                            alt={`Sual ${index + 1}`}
                            className="w-full h-full object-contain rounded"
                          />
                        </div>
                      )}
                      
                      {/* Answer Input */}
                      {question.type === 'multiple-choice' ? (
                        <RadioGroup
                          value={answers[index] || ""}
                          onValueChange={(value) => handleAnswerChange(index, value)}
                        >
                          {question.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center space-x-2">
                              <RadioGroupItem value={option} id={`q${index}-o${optionIndex}`} />
                              <Label htmlFor={`q${index}-o${optionIndex}`} className="flex-1">
                                {option}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      ) : (
                        <Textarea
                          placeholder="Cavabınızı bura yazın..."
                          value={answers[index] || ""}
                          onChange={(e) => handleAnswerChange(index, e.target.value)}
                          className="min-h-[120px]"
                        />
                      )}
                    </div>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4 order-1 lg:order-2">
            {/* Timer */}
            <div className="timer-mobile lg:timer-desktop">
              <ExamTimer endTime={exam.endTime} onTimeUp={handleTimeUp} />
            </div>
            
            {/* Finish Button */}
            <Button
              onClick={() => handleFinishExam(false)}
              className="w-full bg-primary hover:bg-primary/90"
              disabled={submitting}
            >
              <Send className="mr-2 h-4 w-4" />
              {submitting ? "Təhvil verilir..." : "İmtahanı bitir & Təhvil ver"}
            </Button>
            
            {/* Back Button */}
            <Button
              variant="outline"
              onClick={handleGoBack}
              className="w-full"
              disabled={submitting}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Geri Qayıt
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}