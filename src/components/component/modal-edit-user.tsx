import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

interface User {
  user_id: number;
  username: string;
  password?: string;
  full_name: string;
  role: string;
}

interface ModalEditUserProps {
  user: User;
  onClose: () => void;
  onUpdate: () => void;  
}

export function ModalEditUser({ user, onClose, onUpdate }: ModalEditUserProps) {
  const [username, setUsername] = useState(user.username);
  const [password, setPassword] = useState(user.password || "");
  const [fullName, setFullName] = useState(user.full_name);
  const [role, setRole] = useState(user.role);

  useEffect(() => {
    console.log("Password:", password);
  }, [password]);

  const MySwal = withReactContent(Swal);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser = { username, password, full_name: fullName, role };
  
    try {
      const response = await fetch(`http://localhost:3001/web/api/users/${user.user_id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`, 
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedUser),
      });
  
      if (response.ok) {
        MySwal.fire({
          title: '¡Éxito!',
          text: 'Usuario actualizado exitosamente',
          icon: 'success',
          confirmButtonColor: '#604CC3',
          confirmButtonText: 'Cerrar'
        });
        onUpdate(); 
        onClose(); 
      } else {
        MySwal.fire({
          title: 'Error',
          text: 'Hubo un error al actualizar el usuario',
          icon: 'error',
          confirmButtonColor: '#604CC3',
          confirmButtonText: 'Cerrar'
        });
      }
    } catch (error) {
      console.error("Error al actualizar el usuario:", error);
      MySwal.fire({
        title: 'Error',
        text: 'Ocurrió un error. Inténtalo de nuevo.',
        icon: 'error',
        confirmButtonColor: '#604CC3',
        confirmButtonText: 'Cerrar'
      });
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <Card className="w-full max-w-md mx-auto bg-white">
        <CardHeader>
          <CardTitle>Editar información de usuario</CardTitle>
          <CardDescription>Actualiza la información del usuario.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="username">Nombre de Usuario</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingresa tu usuario"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fullName">Nombre Completo</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ingresa tu nombre completo"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Rol</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Selecciona un" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Administrator">Administrador</SelectItem>
                  <SelectItem value="Employee">Empleado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end">
              <Button type="submit" className="mr-2">Guardar Cambios</Button>
              <Button type="button" onClick={onClose}>Cerrar</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
