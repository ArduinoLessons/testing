import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Calculator, UserCog, ShieldAlert, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { toast } from "sonner";

export default function Navigation() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("currentStudent");
    toast.success("Çıxış uğurludur", {
      description: "Sistemi tərk etdiniz."
    });
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-blue-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link to="/teacher/dashboard" className="flex items-center space-x-2">
            <Calculator className="h-6 w-6 text-blue-600" />
            <span className="font-headline font-bold text-xl text-gray-800">Riyaziyyat İmtahanı</span>
          </Link>
          
          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/teacher/dashboard" 
              className="nav-link text-gray-600 hover:text-blue-600 transition-colors"
            >
              İdarə Paneli
            </Link>
            <Link 
              to="/teacher/create" 
              className="nav-link text-gray-600 hover:text-blue-600 transition-colors"
            >
              İmtahan Yarat
            </Link>
            <Link 
              to="/teacher/students" 
              className="nav-link text-foreground/60 hover:text-foreground/80 transition-colors flex items-center space-x-1"
            >
              <UserCog className="h-4 w-4" />
              <span>Şagirdlər</span>
            </Link>
            <Link 
              to="/teacher/cheaters" 
              className="nav-link text-destructive hover:text-destructive/80 transition-colors flex items-center space-x-1"
            >
              <ShieldAlert className="h-4 w-4" />
              <span>Köçürənlər</span>
            </Link>
          </nav>
          
          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-500/10 text-blue-600 font-medium">
                    A
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Dr. Anar Hüseynov</p>
                  <p className="text-xs leading-none text-muted-foreground">anar.huseynov</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/teacher/dashboard">İdarə Paneli</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Çıxış
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}