'use client';
import AuthContext from '@/hooks/auth-context';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useRouter } from 'next/navigation'
import { useContext } from 'react';

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

export function LoginForm() {

  const router = useRouter();
  const { login } = useContext(AuthContext);

  const formSchema = z.object({
    username: z.string().min(2).max(50),
    password: z.string().min(2).max(50),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
    }
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    fetch('http://localhost:3001/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(values)
    })
      .then((res) => res.json())
      .then((data) => {
        // Save token and userId to localStorage
        localStorage.setItem('token', data.token)
        login()
        router.push('/')
      })
      .catch(console.error) // eslint-disable
  }


  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[#503dab] to-[#604CC3]">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg animate-fade-in">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold">Bienvenido</h2>
        </div>
        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de usuario</FormLabel>
                  <FormControl>
                    <Input placeholder="Ingresar usuario" {...field} />
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
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Iniciar sesión </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}