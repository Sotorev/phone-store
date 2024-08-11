// src/components/component/modal-create-user.tsx

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

interface ModalCreateUserProps {
  onClose: () => void;
  onCreate: () => void; // Callback para cuando se cree el usuario
}

export function ModalCreateUser({ onClose, onCreate }: ModalCreateUserProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("Employee");

  const MySwal = withReactContent(Swal);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newUser = { username, password, full_name: fullName, role };

    try {
      const response = await fetch("http://localhost:3001/web/api/users", { // Asegúrate de que esta URL sea correcta
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        MySwal.fire({
          title: '¡Éxito!',
          text: 'Usuario creado exitosamente',
          icon: 'success',
          confirmButtonColor: '#604CC3',
          confirmButtonText: 'Cerrar'
        }).then(() => {
          onCreate(); // Call the callback function to refresh the user list
          onClose(); // Close the modal
        });
      } else {
        const { error } = await response.json();
        MySwal.fire({
          title: 'Error',
          text: error || 'Hubo un error al crear el usuario',
          icon: 'error',
          confirmButtonColor: '#604CC3',
          confirmButtonText: 'Cerrar'
        });
      }
    } catch (error) {
      console.error("Error al crear el usuario:", error);
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
          <CardTitle>Crear Nuevo Usuario</CardTitle>
          <CardDescription>Crea la información del usuario.</CardDescription>
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
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Administrator">Administrador</SelectItem>
                  <SelectItem value="Employee">Empleado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end">
              <Button type="submit" className="mr-2">Crear Usuario</Button>
              <Button type="button" onClick={onClose}>Cerrar</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
