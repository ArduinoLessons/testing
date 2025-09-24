import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Plus, Trash2, ImageIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Navigation from "../../components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Checkbox } from "../../components/ui/checkbox";
import { toast } from "sonner";
import { mathSymbols } from "../../lib/data";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function CreateExam() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [examData, setExamData] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    pointsPerQuestion: 10,
    groups: [],
    questions: [
      {
        question: "",
        type: "multiple-choice",
        options: ["", "", "", "", ""],
        correctAnswer: "",
        imageUrl: null
      }
    ]
  });

  const textareaRefs = useRef([]);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await axios.get(`${API}/groups`);
      setGroups(response.data);
    } catch (error) {
      console.error("Failed to fetch groups:", error);
      toast.error("Xəta", {
        description: "Qruplar yüklənərkən xəta baş verdi."
      });
    }
  };

  const insertMathSymbol = (symbol, questionIndex) => {
    const textarea = textareaRefs.current[questionIndex];
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = examData.questions[questionIndex].question;
    const newValue = currentValue.substring(0, start) + symbol + currentValue.substring(end);

    setExamData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex ? { ...q, question: newValue } : q
      )
    }));

    // Set cursor position after the inserted symbol
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + symbol.length;
      textarea.focus();
    }, 0);
  };

  const handleImageUpload = (e, questionIndex) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setExamData(prev => ({
        ...prev,
        questions: prev.questions.map((q, i) => 
          i === questionIndex ? { ...q, imageUrl: e.target.result } : q
        )
      }));
    };
    reader.readAsDataURL(file);
  };

  const addQuestion = () => {
    setExamData(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          question: "",
          type: "multiple-choice",
          options: ["", "", "", "", ""],
          correctAnswer: "",
          imageUrl: null
        }
      ]
    }));
  };

  const removeQuestion = (index) => {
    if (examData.questions.length === 1) {
      toast.error("Xəta", {
        description: "Ən azı bir sual olmalıdır."
      });
      return;
    }
    
    setExamData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const handleQuestionChange = (index, field, value) => {
    setExamData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === index ? { ...q, [field]: value } : q
      )
    }));
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    setExamData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex 
          ? { 
              ...q, 
              options: q.options.map((opt, j) => j === optionIndex ? value : opt)
            } 
          : q
      )
    }));
  };

  const handleGroupToggle = (groupName) => {
    setExamData(prev => ({
      ...prev,
      groups: prev.groups.includes(groupName)
        ? prev.groups.filter(g => g !== groupName)
        : [...prev.groups, groupName]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (examData.groups.length === 0) {
      toast.error("Xəta", {
        description: "Ən azı bir qrup seçməlisiniz."
      });
      return;
    }

    if (examData.questions.some(q => !q.question.trim() || !q.correctAnswer.trim())) {
      toast.error("Xəta", {
        description: "Bütün sualları və düzgün cavabları doldurun."
      });
      return;
    }

    setLoading(true);
    
    try {
      const examPayload = {
        ...examData,
        questionsCount: examData.questions.length,
        status: "upcoming"
      };

      await axios.post(`${API}/exams`, examPayload);
      
      toast.success("Uğurludur", {
        description: "İmtahan uğurla yaradıldı."
      });
      
      navigate("/teacher/dashboard");
    } catch (error) {
      console.error("Failed to create exam:", error);
      toast.error("Xəta", {
        description: "İmtahan yaradılarkən xəta baş verdi."
      });
    } finally {
      setLoading(false);
    }
  };

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
              Yeni İmtahan Yarat
            </h1>
            <p className="text-muted-foreground mt-2">
              İmtahanınızı tərtib etmək üçün aşağıdakı məlumatları doldurun. Fərqli tiplərdə çoxsaylı suallar əlavə edə bilərsiniz.
            </p>
          </div>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">İmtahan Məlumatları</CardTitle>
            <CardDescription>
              İmtahanın əsas məlumatlarını və suallarını daxil edin.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Exam Details */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">İmtahan Adı</Label>
                  <Input
                    id="title"
                    value={examData.title}
                    onChange={(e) => setExamData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pointsPerQuestion">Hər Suala Düşən Bal</Label>
                  <Input
                    id="pointsPerQuestion"
                    type="number"
                    min="1"
                    value={examData.pointsPerQuestion}
                    onChange={(e) => setExamData(prev => ({ ...prev, pointsPerQuestion: parseInt(e.target.value) }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="startTime">Başlama Vaxtı</Label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    value={examData.startTime}
                    onChange={(e) => setExamData(prev => ({ ...prev, startTime: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endTime">Bitmə Vaxtı</Label>
                  <Input
                    id="endTime"
                    type="datetime-local"
                    value={examData.endTime}
                    onChange={(e) => setExamData(prev => ({ ...prev, endTime: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {/* Groups Selection */}
              <Card className="bg-muted/40">
                <CardHeader>
                  <CardTitle>Təyin Edilmiş Qruplar</CardTitle>
                  <CardDescription>
                    İmtahana daxil olmaq üçün qrupları seçin.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                    {groups.map((group) => (
                      <div key={group} className="flex items-center space-x-2">
                        <Checkbox
                          id={group}
                          checked={examData.groups.includes(group)}
                          onCheckedChange={() => handleGroupToggle(group)}
                        />
                        <Label htmlFor={group} className="text-sm font-medium">
                          {group}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Questions Section */}
              <Card className="bg-muted/20">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Suallar</CardTitle>
                    <CardDescription>
                      İmtahan suallarını əlavə edin və konfiqurasiya edin.
                    </CardDescription>
                  </div>
                  <Button type="button" onClick={addQuestion} variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Sual Əlavə Et
                  </Button>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {examData.questions.map((question, questionIndex) => (
                    <Card key={questionIndex} className="bg-muted/40">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-lg">Sual {questionIndex + 1}</CardTitle>
                        {examData.questions.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeQuestion(questionIndex)}
                            className="text-destructive hover:text-destructive/80"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        {/* Math Symbols Toolbar */}
                        <div>
                          <Label>Sual Mətni</Label>
                          <div className="flex flex-wrap gap-1 mb-2 p-2 bg-muted rounded border">
                            {mathSymbols.map((symbol) => (
                              <Button
                                key={symbol}
                                type="button"
                                variant="outline"
                                size="sm"
                                className="math-symbol-btn"
                                onClick={() => insertMathSymbol(symbol, questionIndex)}
                              >
                                {symbol}
                              </Button>
                            ))}
                          </div>
                          <Textarea
                            ref={el => textareaRefs.current[questionIndex] = el}
                            placeholder="Sual nədir?"
                            value={question.question}
                            onChange={(e) => handleQuestionChange(questionIndex, 'question', e.target.value)}
                            rows={3}
                            required
                          />
                        </div>

                        {/* Image Upload */}
                        <div className="flex items-center space-x-4">
                          <div>
                            <Label htmlFor={`image-${questionIndex}`}>Sual Şəkli (İstəyə bağlı)</Label>
                            <div className="flex items-center space-x-2 mt-1">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => document.getElementById(`image-${questionIndex}`).click()}
                              >
                                <ImageIcon className="mr-2 h-4 w-4" />
                                Şəkil Yüklə
                              </Button>
                              <input
                                id={`image-${questionIndex}`}
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, questionIndex)}
                                className="hidden"
                              />
                            </div>
                          </div>
                          {question.imageUrl && (
                            <div className="question-image">
                              <img
                                src={question.imageUrl}
                                alt="Question"
                                className="w-20 h-20 object-cover rounded"
                              />
                            </div>
                          )}
                        </div>

                        {/* Question Type */}
                        <div>
                          <Label>Sual Tipi</Label>
                          <Select
                            value={question.type}
                            onValueChange={(value) => handleQuestionChange(questionIndex, 'type', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="multiple-choice">Çoxvariantlı</SelectItem>
                              <SelectItem value="free-form">Açıq Tipli</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Options (for multiple choice) */}
                        {question.type === "multiple-choice" && (
                          <div className="space-y-2">
                            <Label>Variantlar</Label>
                            {question.options.map((option, optionIndex) => (
                              <Input
                                key={optionIndex}
                                placeholder={`Variant ${optionIndex + 1}`}
                                value={option}
                                onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                              />
                            ))}
                          </div>
                        )}

                        {/* Correct Answer */}
                        <div>
                          <Label>Düzgün Cavab</Label>
                          <Input
                            placeholder={
                              question.type === "multiple-choice" 
                                ? "Düzgün cavabı dəqiq daxil edin"
                                : "Düzgün cavabı dəqiq daxil edin"
                            }
                            value={question.correctAnswer}
                            onChange={(e) => handleQuestionChange(questionIndex, 'correctAnswer', e.target.value)}
                            required
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  className="bg-primary hover:bg-primary/90"
                  disabled={loading}
                >
                  {loading ? "İmtahan Yaradılır..." : "İmtahan Yarat"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}