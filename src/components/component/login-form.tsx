'use client';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from 'next/navigation';
import { useContext } from 'react';
import AuthContext from '@/hooks/auth-context';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const loginSchema = z.object({
  username: z.string().min(3, { message: 'El usuario debe tener al menos 3 caracteres' }),
  password: z.string().min(5, { message: 'La contraseña debe tener al menos 6 caracteres' }),
});

export function LoginForm() {
  const router = useRouter();
  const { isLogged } = useContext(AuthContext);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    const res = await fetch('http://localhost:3001/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(values),
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('token', data.token);
      router.push('/');
    } else {
      // Handle error
    }
  };

  if (isLogged) return null;

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[#503dab] to-[#604CC3]">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg animate-fade-in">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold">Iniciar Sesión</h2>
        </div>
        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Usuario</FormLabel>
                  <FormControl>
                    <Input id="username" placeholder="Ingrese su usuario" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" id="password" placeholder="Ingrese su contraseña" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full px-4 py-3 font-medium text-white bg-[#604CC3] rounded-md hover:bg-[#604CC3] focus:outline-none focus:ring-2 focus:ring-[#604CC3] focus:ring-offset-2 animate-fade-in">
              Iniciar sesión
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}