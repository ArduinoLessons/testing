import React, { useState, useEffect } from "react";
import { ArrowLeft, Eye } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Navigation from "../../components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { toast } from "sonner";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function TeacherResults() {
  const { examId } = useParams();
  const [exam, setExam] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExamResults();
  }, [examId]);

  const fetchExamResults = async () => {
    try {
      const [examRes, submissionsRes, studentsRes] = await Promise.all([
        axios.get(`${API}/exams/${examId}`),
        axios.get(`${API}/submissions/exam/${examId}`),
        axios.get(`${API}/students`)
      ]);

      setExam(examRes.data);
      setSubmissions(submissionsRes.data);
      setStudents(studentsRes.data);
    } catch (error) {
      console.error("Failed to fetch exam results:", error);
      toast.error("Xəta", {
        description: "İmtahan nəticələri yüklənərkən xəta baş verdi."
      });
    } finally {
      setLoading(false);
    }
  };

  const getStudentInfo = (studentId) => {
    return students.find(s => s.id === studentId) || {};
  };

  const calculateScore = (submission) => {
    if (!exam || !submission.answers) return 0;
    
    let correct = 0;
    exam.questions.forEach((question, index) => {
      const studentAnswer = submission.answers[index.toString()];
      if (studentAnswer && studentAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase()) {
        correct++;
      }
    });
    
    return correct * exam.pointsPerQuestion;
  };

  const groupSubmissionsByGroup = () => {
    const grouped = {};
    
    submissions.forEach(submission => {
      const student = getStudentInfo(submission.studentId);
      const group = student.group || "Naməlum";
      
      if (!grouped[group]) {
        grouped[group] = [];
      }
      
      grouped[group].push({
        ...submission,
        student,
        score: calculateScore(submission)
      });
    });
    
    // Sort each group by score (highest first)
    Object.keys(grouped).forEach(group => {
      grouped[group].sort((a, b) => b.score - a.score);
    });
    
    return grouped;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto py-8 px-4">
          <div className="loading-shimmer h-96 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto py-8 px-4">
          <Card>
            <CardContent className="text-center py-12">
              <h3 className="text-xl font-medium text-muted-foreground">
                İmtahan tapılmadı
              </h3>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const groupedSubmissions = groupSubmissionsByGroup();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button variant="ghost" size="sm" asChild className="mr-4">
            <Link to="/teacher/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="font-headline text-4xl font-bold text-foreground">
              "{exam.title}" üçün nəticələr
            </h1>
            <p className="text-muted-foreground mt-2">
              Şagirdlərin performansının və təqdimatlarının siniflərə görə qruplaşdırılmış icmalı.
            </p>
          </div>
        </div>

        {submissions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Eye className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium text-muted-foreground mb-2">
                Heç bir təqdimat yoxdur
              </h3>
              <p className="text-muted-foreground">
                Hələ heç bir şagird bu imtahanı təqdim etməyib.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedSubmissions).map(([group, groupSubmissions]) => (
              <Card key={group}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Qrup: {group}</span>
                    <Badge variant="secondary">
                      {groupSubmissions.length} şagird
                    </Badge>
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Şagird</TableHead>
                        <TableHead>Təhvil verilmə vaxtı</TableHead>
                        <TableHead>Bal</TableHead>
                        <TableHead>Köçürmə işarəsi</TableHead>
                        <TableHead className="text-right">Əməliyyatlar</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {groupSubmissions.map((submission) => (
                        <TableRow key={submission.id}>
                          <TableCell className="font-medium">
                            {submission.student.name} {submission.student.surname}
                          </TableCell>
                          <TableCell>
                            {new Date(submission.submittedAt).toLocaleString('az-AZ')}
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-lg">
                              {submission.score} / {exam.questionsCount * exam.pointsPerQuestion}
                            </span>
                          </TableCell>
                          <TableCell>
                            {submission.cheatingDetected ? (
                              <Badge variant="destructive">Köçürmə təsbit olunub</Badge>
                            ) : (
                              <Badge variant="secondary">Təmiz</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm">
                              <Eye className="mr-2 h-4 w-4" />
                              Profilli Bax
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}