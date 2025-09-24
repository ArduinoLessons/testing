import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Lock, CheckCircle, XCircle, Clock, ListChecks, Timer } from "lucide-react";
import StudentNav from "../../components/StudentNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { toast } from "sonner";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function StudentDashboard() {
  const [exams, setExams] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentStudent = JSON.parse(localStorage.getItem("currentStudent") || "{}");

  useEffect(() => {
    fetchData();
    
    // Show welcome toast
    if (currentStudent.name) {
      toast.success("Giriş uğurludur", {
        description: `Xoş gəlmisiniz, ${currentStudent.name} ${currentStudent.surname}!`
      });
    }
  }, []);

  const fetchData = async () => {
    try {
      const [examsRes, submissionsRes] = await Promise.all([
        axios.get(`${API}/exams`),
        axios.get(`${API}/submissions`)
      ]);

      // Filter exams for current student's group
      const studentExams = examsRes.data.filter(exam => 
        exam.groups.includes(currentStudent.group)
      );

      setExams(studentExams);
      setSubmissions(submissionsRes.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Xəta", {
        description: "Məlumatlar yüklənərkən xəta baş verdi."
      });
    } finally {
      setLoading(false);
    }
  };

  const getExamStatus = (exam) => {
    const now = new Date();
    const startTime = new Date(exam.startTime);
    const endTime = new Date(exam.endTime);
    
    // Check if student has submitted
    const submission = submissions.find(s => s.examId === exam.id && s.studentId === currentStudent.id);
    
    if (submission) {
      if (submission.cheatingDetected) {
        return {
          status: "cheating",
          text: "Köçürmə Təsbit Olundu!",
          buttonText: "Köçürmə Təsbit Olundu",
          buttonVariant: "destructive",
          buttonDisabled: true,
          icon: XCircle,
          description: "Köçürdüyünüz təsbit olundu, bu səbəbdən imtahandan xaric olundunuz."
        };
      }
      
      if (now > endTime) {
        return {
          status: "finished",
          text: "Təhvil verilib",
          buttonText: "Nəticələrə bax",
          buttonVariant: "outline",
          buttonDisabled: false,
          icon: CheckCircle,
          description: "İmtahan bitib, nəticələrə baxa bilərsiniz."
        };
      } else {
        return {
          status: "submitted",
          text: "Təhvil verilib",
          buttonText: "Nəticələr bağlıdır",
          buttonVariant: "secondary",
          buttonDisabled: true,
          icon: Lock,
          description: "İmtahan təhvil verilib, nəticələr hələ açıqlanmayıb."
        };
      }
    }
    
    if (now < startTime) {
      return {
        status: "upcoming",
        text: "Başlamayıb",
        buttonText: "Başlamayıb",
        buttonVariant: "secondary",
        buttonDisabled: true,
        icon: Clock,
        description: `İmtahan ${startTime.toLocaleString('az-AZ')} tarixində başlayacaq.`
      };
    } else if (now >= startTime && now <= endTime) {
      return {
        status: "live",
        text: "Canlı",
        buttonText: "İmtahana başla",
        buttonVariant: "default",
        buttonDisabled: false,
        icon: Timer,
        description: "İmtahan canlıdır, başlaya bilərsiniz."
      };
    } else {
      return {
        status: "missed",
        text: "Qaçırılıb",
        buttonText: "Qaçırılıb",
        buttonVariant: "destructive",
        buttonDisabled: true,
        icon: XCircle,
        description: "İmtahan vaxtı keçib."
      };
    }
  };

  const formatTimeRemaining = (exam) => {
    const now = new Date();
    const startTime = new Date(exam.startTime);
    const endTime = new Date(exam.endTime);
    
    if (now < startTime) {
      const diff = startTime - now;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (days > 0) return `${days} gün sonra`;
      if (hours > 0) return `${hours} saat sonra`;
      return `${minutes} dəqiqə sonra`;
    } else if (now >= startTime && now <= endTime) {
      const diff = endTime - now;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours > 0) return `${hours} saat ${minutes} dəqiqə qalıb`;
      return `${minutes} dəqiqə qalıb`;
    }
    
    return "Bitib";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <StudentNav />
        <div className="container mx-auto py-8 px-4">
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2].map((i) => (
              <Card key={i} className="card-hover">
                <div className="loading-shimmer h-48 rounded-lg" />
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentNav />
      
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-headline text-4xl font-bold text-gray-800">
            Xoş gəlmisən, {currentStudent.name} {currentStudent.surname}!
          </h1>
          <p className="text-gray-600 mt-2">
            Mövcud imtahanlarınız bunlardır. Uğurlar!
          </p>
        </div>

        {/* Exams Grid */}
        {exams.length === 0 ? (
          <Card className="text-center py-12">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">
                Heç Bir İmtahan Yoxdur
              </CardTitle>
              <CardDescription>
                Sizin qrupunuz üçün hazırda heç bir imtahan təyin edilməyib.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {exams.map((exam) => {
              const status = getExamStatus(exam);
              const IconComponent = status.icon;
              
              return (
                <Card key={exam.id} className={`card-hover exam-card-${status.status}`}>
                  <CardHeader className="flex-row items-start justify-between space-y-0 pb-2">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="font-headline text-2xl">
                        {exam.title}
                      </CardTitle>
                      <CardDescription>
                        {exam.description}
                      </CardDescription>
                    </div>
                    <Badge className={`status-badge-${status.status === 'cheating' ? 'finished' : status.status}`}>
                      {status.text}
                    </Badge>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <ListChecks className="mr-2 h-4 w-4" />
                        <span>{exam.questionsCount} sual</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-2 h-4 w-4" />
                        <div className="space-y-1">
                          <div>Müddət: {formatTimeRemaining(exam)}</div>
                          <div className="text-xs">
                            {new Date(exam.startTime).toLocaleString('az-AZ')} - {new Date(exam.endTime).toLocaleString('az-AZ')}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-sm text-muted-foreground">
                        <IconComponent className="mr-2 h-4 w-4" />
                        <span>{status.description}</span>
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      {status.status === "live" ? (
                        <Button 
                          asChild 
                          className="w-full"
                          variant={status.buttonVariant}
                        >
                          <Link to={`/student/exam/${exam.id}`}>
                            <Timer className="mr-2 h-4 w-4" />
                            {status.buttonText}
                          </Link>
                        </Button>
                      ) : status.status === "finished" ? (
                        <Button 
                          className="w-full"
                          variant={status.buttonVariant}
                          onClick={() => {
                            toast.info("Nəticələr", {
                              description: "Nəticələr müəllim tərəfindən açıqlanacaq."
                            });
                          }}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          {status.buttonText}
                        </Button>
                      ) : status.status === "cheating" ? (
                        <div className="space-y-2">
                          <Button 
                            className="w-full"
                            variant={status.buttonVariant}
                            disabled={status.buttonDisabled}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            {status.buttonText}
                          </Button>
                          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">
                            Köçürdüyünüz təsbit olundu, bu səbəbdən imtahandan xaric olundunuz. Müəllim bu barədə məlumatlandırılacaq.
                          </div>
                        </div>
                      ) : (
                        <Button 
                          className="w-full"
                          variant={status.buttonVariant}
                          disabled={status.buttonDisabled}
                        >
                          <IconComponent className="mr-2 h-4 w-4" />
                          {status.buttonText}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}