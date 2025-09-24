import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { UserCog, ShieldAlert, PlusCircle, ListChecks, Users, Clock, Eye, Megaphone, Trash2 } from "lucide-react";
import Navigation from "../../components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../../components/ui/alert-dialog";
import { Textarea } from "../../components/ui/textarea";
import { toast } from "sonner";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function TeacherDashboard() {
  const [exams, setExams] = useState([]);
  const [announcements, setAnnouncements] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await axios.get(`${API}/exams`);
      setExams(response.data);
    } catch (error) {
      console.error("Failed to fetch exams:", error);
      toast.error("Xəta", {
        description: "İmtahanları yükləyərkən xəta baş verdi."
      });
    } finally {
      setLoading(false);
    }
  };

  const getExamStatus = (exam) => {
    const now = new Date();
    const startTime = new Date(exam.startTime);
    const endTime = new Date(exam.endTime);

    if (now >= startTime && now <= endTime) {
      return { status: "live", text: "Canlı", className: "status-badge-live" };
    } else if (now > endTime) {
      return { status: "finished", text: "Bitmiş", className: "status-badge-finished" };
    } else {
      return { status: "upcoming", text: "Qarşıdan gələn", className: "status-badge-upcoming" };
    }
  };

  const handleDeleteExam = async (examId) => {
    try {
      await axios.delete(`${API}/exams/${examId}`);
      toast.success("Uğurludur", {
        description: "İmtahan uğurla silindi."
      });
      fetchExams();
    } catch (error) {
      console.error("Failed to delete exam:", error);
      toast.error("Xəta", {
        description: "İmtahan silinərkən xəta baş verdi."
      });
    }
  };

  const handleSaveAnnouncement = (examId, announcement) => {
    // Save announcement to localStorage so students can see it
    localStorage.setItem(`announcement_${examId}`, announcement);
    
    setAnnouncements(prev => ({
      ...prev,
      [examId]: announcement
    }));
    
    toast.success("Uğurludur", {
      description: "Elan uğurla yadda saxlanıldı və şagirdlər görə bilər."
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto py-8 px-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
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
      <Navigation />
      
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 space-y-4 lg:space-y-0">
          <div>
            <h1 className="font-headline text-4xl font-bold text-gray-800">
              Müəllim İdarə Paneli
            </h1>
            <p className="text-gray-600 mt-2">
              İmtahanlarınızı idarə edin və şagirdlərin irəliləyişini izləyin.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
              <Link to="/teacher/students">
                <UserCog className="mr-2 h-4 w-4" />
                Şagirdləri İdarə Et
              </Link>
            </Button>
            <Button variant="destructive" asChild>
              <Link to="/teacher/cheaters">
                <ShieldAlert className="mr-2 h-4 w-4" />
                Köçürənlərə Bax
              </Link>
            </Button>
            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
              <Link to="/teacher/create">
                <PlusCircle className="mr-2 h-4 w-4" />
                Yeni İmtahan Yarat
              </Link>
            </Button>
          </div>
        </div>

        {/* Exams Grid */}
        {exams.length === 0 ? (
          <Card className="text-center py-12">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">
                Heç Bir İmtahan Yaradılmayıb
              </CardTitle>
              <CardDescription>
                İlk imtahanınızı yaratmaq üçün aşağıdakı düyməni sıxın.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                <Link to="/teacher/create">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  İmtahan Yarat
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {exams.map((exam) => {
              const status = getExamStatus(exam);
              return (
                <Card key={exam.id} className={`card-hover flex flex-col exam-card-${status.status}`}>
                  <CardHeader className="flex-row items-start justify-between space-y-0 pb-2">
                    <div className="space-y-1">
                      <CardTitle className="font-headline text-2xl">
                        {exam.title}
                      </CardTitle>
                      <CardDescription>
                        {exam.description}
                      </CardDescription>
                    </div>
                    <Badge className={status.className}>
                      {status.text}
                    </Badge>
                  </CardHeader>
                  
                  <CardContent className="flex-1">
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <ListChecks className="mr-2 h-4 w-4" />
                        <span>{exam.questionsCount} sual</span>
                      </div>
                      
                      <div className="flex items-start text-sm text-muted-foreground">
                        <Users className="mr-2 h-4 w-4 mt-0.5" />
                        <div className="flex flex-wrap gap-1">
                          {exam.groups.map((group, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {group}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-2 h-4 w-4" />
                        <span>{new Date(exam.startTime).toLocaleString('az-AZ')}</span>
                      </div>
                    </div>
                  </CardContent>
                  
                  <div className="p-6 pt-0">
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/teacher/results/${exam.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Nəticələrə Bax
                        </Link>
                      </Button>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="secondary" size="sm">
                            <Megaphone className="mr-2 h-4 w-4" />
                            Elan ver
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Elan Əlavə Et</DialogTitle>
                            <DialogDescription>
                              "{exam.title}" imtahanı üçün elan yazın.
                            </DialogDescription>
                          </DialogHeader>
                          <Textarea
                            placeholder="Elanınızı bura yazın..."
                            value={announcements[exam.id] || ""}
                            onChange={(e) => setAnnouncements(prev => ({
                              ...prev,
                              [exam.id]: e.target.value
                            }))}
                          />
                          <div className="flex justify-end space-x-2">
                            <Button 
                              onClick={() => handleSaveAnnouncement(exam.id, announcements[exam.id] || "")}
                            >
                              Yadda Saxla
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" className="col-span-2">
                            <Trash2 className="mr-2 h-4 w-4" />
                            İmtahanı Sil
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>İmtahanı silmək istədiyinizə əminsiniz?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Bu əməliyyat geri alına bilməz. İmtahan və onunla əlaqəli bütün nəticələr silinəcək.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Ləğv et</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteExam(exam.id)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Sil
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}