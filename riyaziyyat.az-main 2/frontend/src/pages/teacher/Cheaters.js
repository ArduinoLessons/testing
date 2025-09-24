import React, { useState, useEffect } from "react";
import { ArrowLeft, ShieldAlert, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "../../components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../../components/ui/alert-dialog";
import { toast } from "sonner";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function TeacherCheaters() {
  const [cheatingReports, setCheatingReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCheatingReports();
  }, []);

  const fetchCheatingReports = async () => {
    try {
      const response = await axios.get(`${API}/cheating-reports`);
      setCheatingReports(response.data);
    } catch (error) {
      console.error("Failed to fetch cheating reports:", error);
      toast.error("Xəta", {
        description: "Köçürmə hesabatları yüklənərkən xəta baş verdi."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCheatingFlag = async (submissionId) => {
    try {
      await axios.delete(`${API}/cheating-reports/${submissionId}`);
      toast.success("Uğurludur", {
        description: "Köçürmə bayrağı silindi."
      });
      fetchCheatingReports();
    } catch (error) {
      console.error("Failed to remove cheating flag:", error);
      toast.error("Xəta", {
        description: "Köçürmə bayrağı silinərkən xəta baş verdi."
      });
    }
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
              Köçürmə Hesabatları
            </h1>
            <p className="text-muted-foreground mt-2">
              İmtahanlar zamanı köçürməyə cəhd edən şagirdlərin siyahısı.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <ShieldAlert className="h-10 w-10 text-destructive" />
              <div>
                <CardTitle className="font-headline text-4xl">Köçürmə Hesabatları</CardTitle>
                <CardDescription className="text-lg">
                  İmtahanlar zamanı köçürməyə cəhd edən şagirdlərin siyahısı.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {cheatingReports.length === 0 ? (
              <div className="text-center py-12">
                <ShieldAlert className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium text-muted-foreground mb-2">
                  Köçürmə hesabatı yoxdur
                </h3>
                <p className="text-muted-foreground">
                  Heç bir şagird köçürməyə cəhd etməyib.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Şagirdin Adı</TableHead>
                    <TableHead>Qrup</TableHead>
                    <TableHead>İmtahan</TableHead>
                    <TableHead>Tarix və Vaxt</TableHead>
                    <TableHead className="text-right">Əməliyyatlar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cheatingReports.map((report) => (
                    <TableRow key={report.id} className="bg-destructive/5">
                      <TableCell className="font-medium">
                        {report.studentName}
                      </TableCell>
                      <TableCell>{report.group}</TableCell>
                      <TableCell>{report.examTitle}</TableCell>
                      <TableCell>
                        {new Date(report.submittedAt).toLocaleString('az-AZ')}
                      </TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Köçürmə bayrağını silmək istədiyinizə əminsiniz?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Bu əməliyyat köçürmə bayrağını siləcək və şagirdin nəticəsi normal kimi görünəcək.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Ləğv et</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleRemoveCheatingFlag(report.id)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Sil
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}