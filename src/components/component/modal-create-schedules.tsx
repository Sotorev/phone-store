import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import TimePicker from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

interface User {
  user_id: number;
  full_name: string;
}

interface Schedule {
  user_id: number;
  work_date: string; // Solo la fecha en formato 'YYYY-MM-DD'
  hours_worked: number; // Asegúrate de que hours_worked sea un decimal
  is_active?: boolean; // Campo opcional, pero se establecerá como verdadero si no se proporciona
}

interface ModalCreateScheduleProps {
  users: User[]; // Añade esta propiedad si `ModalCreateSchedule` necesita la lista de usuarios
  onClose: () => void;
  onCreate: () => void; // Callback para cuando se cree el horario
}

export function ModalCreateSchedule({ onClose, onCreate }: ModalCreateScheduleProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [workDate, setWorkDate] = useState<Date | null>(null);
  const [workTime, setWorkTime] = useState<string | null>('00:00');
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  const MySwal = withReactContent(Swal);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:3001/web/api/users", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched Users:", data);

        setUsers(data);
      } catch (error) {
        console.error("Error al cargar usuarios:", error);
        setUsers([]);
      }
    };

    fetchUsers();
  }, []);

  const handleAddSchedule = () => {
    if (selectedUser && workDate && workTime) {
      // Convertir la fecha a formato 'YYYY-MM-DD'
      const dateString = workDate.toISOString().split('T')[0];
      const [hours, minutes] = workTime.split(':').map(Number);
      const newHoursWorked = parseFloat((hours + minutes / 60).toFixed(2));

      if (newHoursWorked < 0.5 || newHoursWorked > 8) {
        MySwal.fire({
          title: 'Error',
          text: 'Las horas trabajadas deben estar entre 0.5 y 8 horas.',
          icon: 'error',
          confirmButtonColor: '#604CC3',
          confirmButtonText: 'Cerrar'
        });
        return;
      }

      // Calcular las horas trabajadas en la semana en curso
      const startOfWeek = new Date(workDate);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1); // Lunes de la semana actual

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6); // Domingo de la semana actual

      const totalHoursForWeek = schedules
        .filter(schedule =>
          schedule.user_id === selectedUser &&
          new Date(schedule.work_date) >= startOfWeek &&
          new Date(schedule.work_date) <= endOfWeek
        )
        .reduce((total, schedule) => total + schedule.hours_worked, 0);

      if (totalHoursForWeek + newHoursWorked > 40) {
        MySwal.fire({
          title: 'Error',
          text: 'No se pueden agregar más de 40 horas en una semana para el mismo usuario.',
          icon: 'error',
          confirmButtonColor: '#604CC3',
          confirmButtonText: 'Cerrar'
        });
        return;
      }

      // Validar horas trabajadas en el día
      const totalHoursForDate = schedules
        .filter(schedule => schedule.user_id === selectedUser && schedule.work_date === dateString)
        .reduce((total, schedule) => total + schedule.hours_worked, 0);

      if (totalHoursForDate + newHoursWorked > 8) {
        MySwal.fire({
          title: 'Error',
          text: 'No se pueden agregar más de 8 horas por día para el mismo usuario.',
          icon: 'error',
          confirmButtonColor: '#604CC3',
          confirmButtonText: 'Cerrar'
        });
        return;
      }

      const newSchedule: Schedule = {
        user_id: selectedUser,
        work_date: dateString,
        hours_worked: newHoursWorked,
        is_active: true, // Incluye el campo is_active
      };

      console.log("New Schedule:", newSchedule);
      setSchedules([...schedules, newSchedule]);
      setWorkTime('00:00');
    } else {
      MySwal.fire({
        title: 'Error',
        text: 'Por favor completa todos los campos antes de agregar el horario',
        icon: 'error',
        confirmButtonColor: '#604CC3',
        confirmButtonText: 'Cerrar'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (schedules.length === 0) {
      MySwal.fire({
        title: 'Error',
        text: 'No hay horarios para enviar',
        icon: 'error',
        confirmButtonColor: '#604CC3',
        confirmButtonText: 'Cerrar'
      });
      return;
    }

    console.log("Submitting Schedules:", schedules);

    try {
      const response = await fetch("http://localhost:3001/web/api/schedules", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(schedules),
      });

      if (response.ok) {
        MySwal.fire({
          title: '¡Éxito!',
          text: 'Horarios creados exitosamente',
          icon: 'success',
          confirmButtonColor: '#604CC3',
          confirmButtonText: 'Cerrar'
        }).then(() => {
          onCreate();
          onClose();
        });
      } else {
        const { error } = await response.json();
        MySwal.fire({
          title: 'Error',
          text: error || 'Hubo un error al crear los horarios',
          icon: 'error',
          confirmButtonColor: '#604CC3',
          confirmButtonText: 'Cerrar'
        });
      }
    } catch (error) {
      console.error("Error al crear los horarios:", error);
      MySwal.fire({
        title: 'Error',
        text: 'Ocurrió un error. Inténtalo de nuevo.',
        icon: 'error',
        confirmButtonColor: '#604CC3',
        confirmButtonText: 'Cerrar'
      });
    }
  };

  // Formatear fecha a dd/MM/yyyy
  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00'); // Asegúrate de agregar la hora para obtener la fecha correcta en la zona horaria local
    return date.toLocaleDateString('es-ES'); // 'es-ES' para formato dd/MM/yyyy
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <Card className="w-full max-w-md mx-auto bg-white">
        <CardHeader>
          <CardTitle>Crear Nuevo Horario</CardTitle>
          <CardDescription>Selecciona la información del horario.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="user">Usuario</Label>
              <Select value={selectedUser?.toString() || ''} onValueChange={(value) => setSelectedUser(Number(value))}>
                <SelectTrigger id="user">
                  <SelectValue placeholder="Selecciona un usuario" />
                </SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.user_id} value={user.user_id.toString()}>
                      {user.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="workDate">Fecha</Label>
              <DatePicker
                id="workDate"
                selected={workDate}
                onChange={(date: Date | null) => setWorkDate(date)}
                dateFormat="yyyy-MM-dd"
                placeholderText="Selecciona una fecha"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="workTime">Hora Trabajada</Label>
              <TimePicker
                id="workTime"
                value={workTime}
                onChange={(value) => setWorkTime(value as string | null)}
                format="HH:mm"
                disableClock
                clearIcon={null}
                clockIcon={null}
              />
            </div>
            <div className="flex justify-end">
              <Button type="button" onClick={handleAddSchedule} className="mr-2">
                Agregar Horario
              </Button>
              <Button type="submit" className="mr-2">Crear Horarios</Button>
              <Button className="mr-2" variant="secondary" onClick={onClose}>Cerrar</Button>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <ul>
            {schedules.map((schedule, index) => (
              <li key={index}>
                {users.find(user => user.user_id === schedule.user_id)?.full_name} - {formatDate(schedule.work_date)} - {schedule.hours_worked.toFixed(2)} horas
              </li>
            ))}
          </ul>
        </CardFooter>
      </Card>
    </div>
  );
}
