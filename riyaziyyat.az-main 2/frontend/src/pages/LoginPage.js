import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calculator } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { getInitialStudents } from "../lib/data";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Initialize localStorage with students data if it doesn't exist
  useEffect(() => {
    if (!localStorage.getItem("students")) {
      localStorage.setItem("students", JSON.stringify(getInitialStudents()));
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(`${API}/auth/login`, {
        email,
        password
      });

      const { success, userType, user, message } = response.data;

      if (success) {
        if (userType === "teacher") {
          localStorage.setItem("currentUser", JSON.stringify({ userType: "teacher", ...user }));
          toast.success("Giriş uğurludur", {
            description: "Xoş gəlmisiniz, Dr. Anar Hüseynov!"
          });
          navigate("/teacher/dashboard");
        } else if (userType === "student") {
          localStorage.setItem("currentStudent", JSON.stringify(user));
          toast.success("Giriş uğurludur", {
            description: `Xoş gəlmisiniz, ${user.name} ${user.surname}!`
          });
          navigate("/student/dashboard");
        }
      } else {
        toast.error("Xəta", {
          description: message
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Xəta", {
        description: "Giriş zamanı xəta baş verdi."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 opacity-10"
        style={{
          backgroundImage: "url('https://picsum.photos/seed/mathformulas/1200/800')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      />
      
      {/* Login Card */}
      <div className="relative z-10 w-full max-w-sm mx-auto px-4">
        <Card className="bg-white/90 backdrop-blur-sm border-blue-200/50 shadow-xl">
          <CardHeader className="text-center space-y-4">
            {/* Icon Circle */}
            <div className="mx-auto h-16 w-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Calculator className="h-8 w-8 text-blue-600" />
            </div>
            
            <div className="space-y-2">
              <CardTitle className="font-headline text-3xl text-gray-800">
                Riyaziyyat İmtahanı Giriş
              </CardTitle>
              <CardDescription className="text-gray-600">
                Sistemə daxil olmaq üçün məlumatlarınızı daxil edin.
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Username Field */}
              <div className="space-y-2">
                <Label htmlFor="email">İstifadəçi adı</Label>
                <Input
                  id="email"
                  type="text"
                  placeholder="İstifadəçi adı"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Şifrə</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Şifrə"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Daxil olunur..." : "Giriş"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}