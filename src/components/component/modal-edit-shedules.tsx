import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

interface User {
  user_id: number;
  full_name: string;
}

interface Schedule {
  schedule_id: number;
  work_date: string;
  hours_worked: string;
  user_id: number;
  is_active: number;
}

interface ModalEditScheduleProps {
  schedule: Schedule;
  users: User[];
  onUpdate: () => void;
  onClose: () => void;
}

export function ModalEditSchedule({ schedule, users, onClose, onUpdate }: ModalEditScheduleProps) {
  const [date, setDate] = useState(new Date(schedule.work_date));
  const [hoursWorked, setHoursWorked] = useState(schedule.hours_worked);
  const [userId, setUserId] = useState(schedule.user_id);
  const [isActive, setIsActive] = useState(schedule.is_active);

  const MySwal = withReactContent(Swal);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedSchedule = { work_date: date.toISOString().split('T')[0], hours_worked: hoursWorked, user_id: userId, is_active: isActive };

    try {
      const response = await fetch(`http://localhost:3001/web/api/schedules/${schedule.schedule_id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedSchedule),
      });

      if (response.ok) {
        MySwal.fire({
          title: '¡Éxito!',
          text: 'Horario actualizado exitosamente',
          icon: 'success',
          confirmButtonColor: '#604CC3',
          confirmButtonText: 'Cerrar'
        }).then(() => {
            onUpdate();
            onClose();
        });
      } else {
        MySwal.fire({
          title: 'Error',
          text: 'Hubo un error al actualizar el horario',
          icon: 'error',
          confirmButtonColor: '#604CC3',
          confirmButtonText: 'Cerrar'
        });
      }
    } catch (error) {
      console.error("Error al actualizar el horario:", error);
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
          <CardTitle>Editar Horario</CardTitle>
          <CardDescription>Actualiza la información del horario.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="date">Fecha</Label>
              <DatePicker
                id="date"
                selected={date}
                onChange={(date: Date) => setDate(date)}
                dateFormat="yyyy-MM-dd"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="hoursWorked">Horas Trabajadas</Label>
              <Input
                id="hoursWorked"
                type="text"
                value={hoursWorked}
                onChange={(e) => setHoursWorked(e.target.value)}
                placeholder="Ejemplo: 09:00 - 17:00"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="user">Usuario</Label>
              <Select value={String(userId)} onValueChange={(value) => setUserId(Number(value))}>
                <SelectTrigger id="user">
                  <SelectValue placeholder="Selecciona un usuario" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.user_id} value={String(user.user_id)}>
                      {user.full_name}
                    </SelectItem>
                  ))}
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
