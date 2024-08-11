"use client";
import { useEffect, useState } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useRouter } from 'next/navigation';

interface User {
  user_id: number;
  username: string;
  password: string;
  full_name: string;
  role: string;
  is_active: number;
}

const MySwal = withReactContent(Swal);

export function ListViewUseroff() {
  const [users, setUsers] = useState<User[]>([]);
  const router = useRouter(); // Hook para manejar la redirección

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      console.error("No token found");
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/web/api/users", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: User[] = await response.json(); 
      const deactivateUsers = data.filter((user) => user.is_active === 0); 
      setUsers(deactivateUsers); 
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleActivateUser = async (userId: number, username: string) => {
    const token = localStorage.getItem('token');

    if (!token) {
      console.error("No token found");
      return;
    }

    const result = await MySwal.fire({
      title: 'Confirmar',
      text: `¿Seguro que quieres activar el usuario: ${username}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#604CC3',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, activar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`http://localhost:3001/web/api/users/${userId}`, {
          method: "PATCH", // Cambiar a PATCH para actualizar el estado del usuario
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          MySwal.fire({
            title: '¡Éxito!',
            text: 'Usuario activado exitosamente',
            icon: 'success',
            confirmButtonColor: '#604CC3',
            confirmButtonText: 'Cerrar'
          });
          fetchUsers(); 
        } else {
          MySwal.fire({
            title: 'Error',
            text: 'Hubo un error al activar el usuario',
            icon: 'error',
            confirmButtonColor: '#604CC3',
            confirmButtonText: 'Cerrar'
          });
        }
      } catch (error) {
        console.error("Error al activar el usuario:", error);
        MySwal.fire({
          title: 'Error',
          text: 'Ocurrió un error. Inténtalo de nuevo.',
          icon: 'error',
          confirmButtonColor: '#604CC3',
          confirmButtonText: 'Cerrar'
        });
      }
    }
  };

  return (
    <div className="flex flex-col items-center mt-12">
      <div className="flex space-x-4 mb-6">
        <Button 
          variant="outline" 
          className="bg-[#604CC3] text-white hover:bg-[#4b3f8c]"
          onClick={() => router.push('/User/listView')} // Redirige a la página de usuarios activos
        >
            Regresar
        </Button>
      </div>
      <div className="bg-background rounded-lg shadow-lg w-[90%] md:w-[80%] lg:w-[70%]">
        <Table>
          <TableHeader className="bg-[#604CC3] text-white">
            <TableRow>
              <TableHead className="px-4 py-3 font-bold text-white">ID</TableHead>
              <TableHead className="px-4 py-3 font-bold text-white">Username</TableHead>
              <TableHead className="px-4 py-3 font-bold text-white">Full Name</TableHead>
              <TableHead className="px-4 py-3 font-bold text-white">Role</TableHead>
              <TableHead className="px-4 py-3 font-bold text-white">Configuration</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(user => (
              <TableRow key={user.user_id} className="border-b">
                <TableCell className="px-4 py-3">{user.user_id}</TableCell>
                <TableCell className="px-4 py-3">{user.username}</TableCell>
                <TableCell className="px-4 py-3">{user.full_name}</TableCell>
                <TableCell className="px-4 py-3">{user.role}</TableCell>
                <TableCell>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mr-2" 
                    onClick={() => handleActivateUser(user.user_id, user.username)}
                  >
                    Activar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
