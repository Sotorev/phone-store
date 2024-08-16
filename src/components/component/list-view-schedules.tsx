"use client"; // Asegúrate de agregar esta línea al inicio del archivo

import { useState, useEffect } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useRouter } from 'next/navigation';
import { ModalCreateSchedule } from '@/components/component/modal-create-schedules'; // Ajusta la ruta según tu estructura
import { ModalEditSchedule } from "@/components/component/modal-edit-shedules";

interface Schedule {
  schedule_id: number;
  user_id: number;
  work_date: string;
  hours_worked: string;
  is_active: number;
}

interface User {
  user_id: number;
  full_name: string;
}

const MySwal = withReactContent(Swal);

export function ListViewSchedules() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedSchedules, setSelectedSchedules] = useState<Schedule | null>(null);
  const [isModalCreateOpen, setIsCreateModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchSchedules();
    fetchUsers(); // Llama a esta función también
  }, []);

  const fetchSchedules = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      console.error("No token found");
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/web/api/schedules", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: Schedule[] = await response.json();
      const activeSchedules = data.filter((schedule) => schedule.is_active === 1);
      setSchedules(activeSchedules);
    } catch (error) {
      console.error("Error fetching schedules:", error);
    }
  };

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
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const getFullNameByUserId = (userId: number) => {
    const user = users.find(user => user.user_id === userId);
    return user ? user.full_name : 'Nombre no disponible';
  };

  const handleEditClick = (schedule: Schedule) => {
    setSelectedSchedules(schedule);
    setIsModalOpen(true);
  };

  const handleUpdateSchedule = () => {
    fetchSchedules();
  };

  const handleOpenModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCloseEditModal = () => {
    setIsModalOpen(false);
  };

  const handleCreateSchedule = () => {
    fetchSchedules();
    handleCloseModal();
  };

  const handleDeactivateSchedule = async (schedule_id: number, username: string) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error("No token found");
      return;
    }
  
    const result = await MySwal.fire({
      title: 'Confirmar',
      text: `¿Seguro que quieres desactivar este horario para el usuario: ${username}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#604CC3',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar'
    });
  
    if (result.isConfirmed) {
      try {
        const response = await fetch(`http://localhost:3001/web/api/schedules/${schedule_id}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ is_active: 0 }), // Enviar 0 para desactivar el horario
        });
  
        if (response.ok) {
          MySwal.fire({
            title: '¡Éxito!',
            text: 'Horario desactivado exitosamente',
            icon: 'success',
            confirmButtonColor: '#604CC3',
            confirmButtonText: 'Cerrar'
          });
          fetchSchedules(); // Asegúrate de que fetchSchedules() actualice la lista de horarios
        } else {
          MySwal.fire({
            title: 'Error',
            text: 'Hubo un error al desactivar el horario',
            icon: 'error',
            confirmButtonColor: '#604CC3',
            confirmButtonText: 'Cerrar'
          });
        }
      } catch (error) {
        console.error("Error al desactivar el horario:", error);
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
          onClick={handleOpenModal}
        >
          Nuevo
        </Button>
        <Button
          variant="outline"
          className="bg-[#f0f0f0] text-[#604CC3] hover:bg-[#e0e0e0]"
          onClick={() => router.push('/schedules/listViewOff')}
        >
          Ver Desactivados
        </Button>
      </div>
      <div className="bg-background rounded-lg shadow-lg w-[90%] md:w-[80%] lg:w-[70%]">
        <Table>
          <TableHeader className="bg-[#604CC3] text-white">
            <TableRow>
              <TableHead className="px-4 py-3 font-bold text-white">ID</TableHead>
              <TableHead className="px-4 py-3 font-bold text-white">Nombre Completo</TableHead>
              <TableHead className="px-4 py-3 font-bold text-white">Día de Trabajo</TableHead>
              <TableHead className="px-4 py-3 font-bold text-white">Horas Trabajadas</TableHead>
              <TableHead className="px-4 py-3 font-bold text-white">Configuración</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schedules.map(schedule => (
              <TableRow key={schedule.schedule_id} className="border-b">
                <TableCell className="px-4 py-3">{schedule.schedule_id}</TableCell>
                <TableCell className="px-4 py-3">{getFullNameByUserId(schedule.user_id)}</TableCell>
                <TableCell className="px-4 py-3">{schedule.work_date}</TableCell>
                <TableCell className="px-4 py-3">{schedule.hours_worked}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEditClick(schedule)}>
                    Editar
                  </Button>
                  <Button variant="outline" size="sm" className="mr-2" onClick={() => handleDeactivateSchedule(schedule.schedule_id, getFullNameByUserId(schedule.user_id))}>
                    Desactivar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {isModalOpen && selectedSchedules && (
        <ModalEditSchedule
          schedule={selectedSchedules}
          users={users} // Asegúrate de pasar `users` al modal de edición
          onClose={handleCloseEditModal}
          onUpdate={handleUpdateSchedule}
        />
      )}
      {isModalCreateOpen && (
        <ModalCreateSchedule
          users={users} // Asegúrate de pasar `users` al modal de creación si es necesario
          onClose={handleCloseModal}
          onCreate={handleCreateSchedule}
        />
      )}
    </div>
  );
}
