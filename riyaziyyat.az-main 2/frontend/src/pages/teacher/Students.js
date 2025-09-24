import React, { useState, useEffect } from "react";
import { ArrowLeft, UserPlus, Users, KeyRound, Pencil, UserX, UserCheck, Trash2, Copy } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "../../components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../../components/ui/alert-dialog";
import { Badge } from "../../components/ui/badge";
import { toast } from "sonner";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function TeacherStudents() {
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingStudent, setEditingStudent] = useState(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [newStudent, setNewStudent] = useState({
    name: "",
    surname: "",
    class: "",
    parentContact: "",
    group: "",
    email: "",
    pass: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [studentsRes, groupsRes] = await Promise.all([
        axios.get(`${API}/students`),
        axios.get(`${API}/groups`)
      ]);
      setStudents(studentsRes.data);
      setGroups(groupsRes.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Xəta", {
        description: "Məlumatlar yüklənərkən xəta baş verdi."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/students`, newStudent);
      toast.success("Uğurludur", {
        description: "Şagird uğurla əlavə edildi."
      });
      setNewStudent({
        name: "",
        surname: "",
        class: "",
        parentContact: "",
        group: "",
        email: "",
        pass: ""
      });
      fetchData();
    } catch (error) {
      console.error("Failed to add student:", error);
      toast.error("Xəta", {
        description: "Şagird əlavə edilərkən xəta baş verdi."
      });
    }
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/students/${editingStudent.id}`, editingStudent);
      toast.success("Uğurludur", {
        description: "Şagird məlumatları yeniləndi."
      });
      setEditingStudent(null);
      fetchData();
    } catch (error) {
      console.error("Failed to update student:", error);
      toast.error("Xəta", {
        description: "Şagird məlumatları yenilənərkən xəta baş verdi."
      });
    }
  };

  const handleToggleStudentStatus = async (student) => {
    try {
      const updatedStudent = {
        ...student,
        status: student.status === "active" ? "disabled" : "active"
      };
      await axios.put(`${API}/students/${student.id}`, updatedStudent);
      toast.success("Uğurludur", {
        description: `Şagird hesabı ${updatedStudent.status === "active" ? "aktivləşdirildi" : "deaktivləşdirildi"}.`
      });
      fetchData();
    } catch (error) {
      console.error("Failed to toggle student status:", error);
      toast.error("Xəta", {
        description: "Şagird statusu dəyişərkən xəta baş verdi."
      });
    }
  };

  const handleDeleteStudent = async (studentId) => {
    try {
      await axios.delete(`${API}/students/${studentId}`);
      toast.success("Uğurludur", {
        description: "Şagird uğurla silindi."
      });
      fetchData();
    } catch (error) {
      console.error("Failed to delete student:", error);
      toast.error("Xəta", {
        description: "Şagird silinərkən xəta baş verdi."
      });
    }
  };

  const handleAddGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    
    try {
      await axios.post(`${API}/groups`, { name: newGroupName });
      toast.success("Uğurludur", {
        description: "Qrup uğurla əlavə edildi."
      });
      setNewGroupName("");
      fetchData();
    } catch (error) {
      console.error("Failed to add group:", error);
      toast.error("Xəta", {
        description: "Qrup əlavə edilərkən xəta baş verdi."
      });
    }
  };

  const handleDeleteGroup = async (groupName) => {
    try {
      await axios.delete(`${API}/groups/${groupName}`);
      toast.success("Uğurludur", {
        description: "Qrup uğurla silindi."
      });
      fetchData();
    } catch (error) {
      console.error("Failed to delete group:", error);
      if (error.response?.status === 400) {
        toast.error("Xəta", {
          description: "Qrupda şagird olduğu üçün silinə bilmir."
        });
      } else {
        toast.error("Xəta", {
          description: "Qrup silinərkən xəta baş verdi."
        });
      }
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Kopyalandı", {
        description: "Mətn buferə kopyalandı."
      });
    });
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
              Şagird İdarəetməsi
            </h1>
            <p className="text-muted-foreground mt-2">
              Şagirdləri və qrupları əlavə edin, baxın və idarə edin.
            </p>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Left Column - Management Forms */}
          <div className="md:col-span-1 space-y-6">
            {/* Add Student Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserPlus className="mr-2 h-5 w-5" />
                  Yeni Şagird Əlavə Et
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddStudent} className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="name">Ad</Label>
                      <Input
                        id="name"
                        value={newStudent.name}
                        onChange={(e) => setNewStudent(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="surname">Soyad</Label>
                      <Input
                        id="surname"
                        value={newStudent.surname}
                        onChange={(e) => setNewStudent(prev => ({ ...prev, surname: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="class">Sinif</Label>
                    <Input
                      id="class"
                      placeholder="məs., 10a"
                      value={newStudent.class}
                      onChange={(e) => setNewStudent(prev => ({ ...prev, class: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="parentContact">Valideyn Əlaqəsi (İstəyə bağlı)</Label>
                    <Input
                      id="parentContact"
                      placeholder="Valideynin telefon nömrəsi"
                      value={newStudent.parentContact}
                      onChange={(e) => setNewStudent(prev => ({ ...prev, parentContact: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">İstifadəçi Adı</Label>
                    <Input
                      id="email"
                      value={newStudent.email}
                      onChange={(e) => setNewStudent(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="pass">Şifrə</Label>
                    <Input
                      id="pass"
                      type="password"
                      value={newStudent.pass}
                      onChange={(e) => setNewStudent(prev => ({ ...prev, pass: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="group">Qrup</Label>
                    <Select 
                      value={newStudent.group} 
                      onValueChange={(value) => setNewStudent(prev => ({ ...prev, group: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Qrup seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {groups.map((group) => (
                          <SelectItem key={group} value={group}>
                            {group}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button type="submit" className="w-full">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Şagird Əlavə Et
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Manage Groups Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Qrupları İdarə Et
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddGroup} className="space-y-4">
                  <div>
                    <Label htmlFor="newGroup">Yeni Qrup Adı</Label>
                    <Input
                      id="newGroup"
                      placeholder="məs., 11S"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    <Users className="mr-2 h-4 w-4" />
                    Qrup Əlavə Et
                  </Button>
                </form>

                <div className="mt-6">
                  <Label>Mövcud Qruplar</Label>
                  <div className="mt-2 space-y-2">
                    {groups.map((group) => (
                      <div key={group} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{group}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteGroup(group)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Student List */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Şagird Siyahısı</CardTitle>
                <CardDescription>
                  Sistemdə qeydiyyatdan keçmiş bütün şagirdlərin siyahısı.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tam Ad</TableHead>
                      <TableHead>Qrup</TableHead>
                      <TableHead>İstifadəçi Adı</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Əməliyyatlar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow 
                        key={student.id} 
                        className={student.status === "disabled" ? "student-disabled" : ""}
                      >
                        <TableCell className="font-medium">
                          {student.name} {student.surname}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{student.group}</Badge>
                        </TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={student.status === "active" ? "default" : "destructive"}
                          >
                            {student.status === "active" ? "Aktiv" : "Deaktiv"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-1">
                            {/* View Credentials */}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <KeyRound className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Giriş Məlumatları</DialogTitle>
                                  <DialogDescription>
                                    {student.name} {student.surname} üçün giriş məlumatları
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between p-3 bg-muted rounded">
                                    <div>
                                      <Label className="text-sm font-medium">İstifadəçi Adı</Label>
                                      <p className="font-mono">{student.email}</p>
                                    </div>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => copyToClipboard(student.email)}
                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <div className="flex items-center justify-between p-3 bg-muted rounded">
                                    <div>
                                      <Label className="text-sm font-medium">Şifrə</Label>
                                      <p className="font-mono">{student.pass}</p>
                                    </div>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => copyToClipboard(student.pass)}
                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>

                            {/* Edit Student */}
                            <Dialog open={editingStudent?.id === student.id} onOpenChange={(open) => !open && setEditingStudent(null)}>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => setEditingStudent(student)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Şagird Məlumatlarını Redaktə Et</DialogTitle>
                                </DialogHeader>
                                {editingStudent && (
                                  <form onSubmit={handleUpdateStudent} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <Label>Ad</Label>
                                        <Input
                                          value={editingStudent.name}
                                          onChange={(e) => setEditingStudent(prev => ({ ...prev, name: e.target.value }))}
                                          required
                                        />
                                      </div>
                                      <div>
                                        <Label>Soyad</Label>
                                        <Input
                                          value={editingStudent.surname}
                                          onChange={(e) => setEditingStudent(prev => ({ ...prev, surname: e.target.value }))}
                                          required
                                        />
                                      </div>
                                    </div>
                                    <div>
                                      <Label>Sinif</Label>
                                      <Input
                                        value={editingStudent.class}
                                        onChange={(e) => setEditingStudent(prev => ({ ...prev, class: e.target.value }))}
                                        required
                                      />
                                    </div>
                                    <div>
                                      <Label>Valideyn Əlaqəsi</Label>
                                      <Input
                                        value={editingStudent.parentContact}
                                        onChange={(e) => setEditingStudent(prev => ({ ...prev, parentContact: e.target.value }))}
                                      />
                                    </div>
                                    <div>
                                      <Label>İstifadəçi Adı</Label>
                                      <Input
                                        value={editingStudent.email}
                                        onChange={(e) => setEditingStudent(prev => ({ ...prev, email: e.target.value }))}
                                        required
                                      />
                                    </div>
                                    <div>
                                      <Label>Şifrə</Label>
                                      <Input
                                        type="password"
                                        value={editingStudent.pass}
                                        onChange={(e) => setEditingStudent(prev => ({ ...prev, pass: e.target.value }))}
                                        required
                                      />
                                    </div>
                                    <div>
                                      <Label>Qrup</Label>
                                      <Select 
                                        value={editingStudent.group} 
                                        onValueChange={(value) => setEditingStudent(prev => ({ ...prev, group: value }))}
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {groups.map((group) => (
                                            <SelectItem key={group} value={group}>
                                              {group}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="flex justify-end space-x-2">
                                      <Button variant="outline" type="button" onClick={() => setEditingStudent(null)}>
                                        Ləğv et
                                      </Button>
                                      <Button type="submit">
                                        Yadda Saxla
                                      </Button>
                                    </div>
                                  </form>
                                )}
                              </DialogContent>
                            </Dialog>

                            {/* Toggle Status */}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  {student.status === "active" ? (
                                    <UserX className="h-4 w-4 text-destructive" />
                                  ) : (
                                    <UserCheck className="h-4 w-4 text-green-600" />
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Şagird hesabını {student.status === "active" ? "deaktivləşdir" : "aktivləşdir"}?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {student.status === "active" 
                                      ? "Deaktiv hesab ilə şagird sistemə daxil ola bilməyəcək."
                                      : "Aktiv hesab ilə şagird sistemə daxil ola biləcək."
                                    }
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Ləğv et</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleToggleStudentStatus(student)}
                                  >
                                    {student.status === "active" ? "Deaktivləşdir" : "Aktivləşdir"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>

                            {/* Delete Student */}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Şagirdi silmək istədiyinizə əminsiniz?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Bu əməliyyat geri alına bilməz. Şagird və onunla əlaqəli bütün məlumatlar silinəcək.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Ləğv et</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteStudent(student.id)}
                                    className="bg-destructive hover:bg-destructive/90"
                                  >
                                    Sil
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}